// ============================================================
// Sincroniza desaparecidos del sismo desde FUENTES EXTERNAS adicionales
// hacia nuestra tabla `missing_persons` (Supabase).
//
//   Fuentes:
//     1) terremotovenezuela.app  →  GET /api/missing            ({ people: [...] })
//     2) venezuelatebusca.com    →  su Supabase, tabla `desaparecidos`
//
//   Destino: <SUPABASE_URL>/rest/v1/missing_persons  (upsert por dedupe_key)
//
// Usa EXACTAMENTE el mismo `dedupe_key` que sync-desaparecidos.mjs
// (norm(nombre)|norm(ubicación)|norm(contacto)), así que:
//   · "valida que no exista en nuestra DB" → ON CONFLICT (dedupe_key) merge.
//   · no duplica entre fuentes ni en re-corridas (es idempotente).
//   · respeta lo que un moderador haya marcado `rejected` (no lo re-publica).
//
// Requiere (GitHub Actions → repo secrets):
//   SUPABASE_URL                 ej. https://gxxftzmhkmqeyqjflmqv.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY    service_role key (NUNCA exponer en el cliente)
//
// Uso: node scripts/sync-fuentes.mjs
// ============================================================

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const CHUNK = 500;
const UA = "vzla-info-sync";

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Faltan SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

// --- normalización: DEBE coincidir con sync-desaparecidos.mjs y el backfill SQL ---
const norm = (s) => (s || "").toLowerCase().trim().replace(/\s+/g, " ");
const dedupeKey = (x) =>
  `${norm(x.nombre)}|${norm(x.ubicacion)}|${norm(x.contacto)}`;

// Representante "más rico" por grupo: con foto > descripción más larga >
// reporte más antiguo (createdAt menor). Determinista entre corridas.
const richness = (x) => [
  (x.foto || "").trim() ? 1 : 0,
  (x.descripcion || "").trim().length,
  -(x.createdAt || 0),
];
const better = (a, b) => {
  const ra = richness(a), rb = richness(b);
  for (let i = 0; i < ra.length; i++) if (ra[i] !== rb[i]) return ra[i] > rb[i];
  return false;
};

const clean = (v) => {
  const t = (v == null ? "" : String(v)).trim();
  return t || null;
};
const isoDate = (v) => (/^\d{4}-\d{2}-\d{2}$/.test((v || "").trim()) ? v.trim() : null);

async function fetchJson(url, init, tries = 3) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { ...init, signal: AbortSignal.timeout(30000) });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} ${res.statusText} ${body.slice(0, 300)}`);
      }
      return res;
    } catch (e) {
      lastErr = e;
      if (i < tries - 1) await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
    }
  }
  throw lastErr;
}

// ---- Fuente 1: terremotovenezuela.app ----
// Devuelve { people: [...] } completo (sin paginación). Foto es relativa.
async function fetchTerremotoApp() {
  const ORIGIN = "https://terremotovenezuela.app";
  const res = await fetchJson(`${ORIGIN}/api/missing`, { headers: { "User-Agent": UA } });
  const j = await res.json();
  const people = Array.isArray(j) ? j : j.people ?? j.items ?? [];
  return people.map((p) => ({
    nombre: p.name,
    edad: Number.isFinite(p.age) ? Math.trunc(p.age) : null,
    foto: p.photoUrl ? (p.photoUrl.startsWith("http") ? p.photoUrl : ORIGIN + p.photoUrl) : null,
    ubicacion: p.lastSeen,
    fecha: null, // no expone fecha ISO; createdAt es epoch
    descripcion: p.description,
    contacto: p.contact,
    estado: p.resolvedAt || p.status === "resolved" || p.status === "found" ? "localizado" : "desaparecido",
    createdAt: Number.isFinite(p.createdAt) ? p.createdAt : 0,
  }));
}

// ---- Fuente 2: venezuelatebusca.com (su propio Supabase, anon key pública) ----
async function fetchVenezuelaTeBusca() {
  const URL = "https://ihcnbvkwkiyxlkhuwapu.supabase.co";
  const KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloY25idmt3a2l5eGxraHV3YXB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzNDQxNzcsImV4cCI6MjA5NzkyMDE3N30.-0hKS1VFaMFFpnCTzrl4Wj7XwfUVAfos6a0QTGzDtEY";
  const all = [];
  const PAGE = 1000;
  for (let from = 0; from < 100000; from += PAGE) {
    const res = await fetchJson(
      `${URL}/rest/v1/desaparecidos?select=*&order=created_at.asc`,
      {
        headers: {
          apikey: KEY,
          Authorization: `Bearer ${KEY}`,
          Range: `${from}-${from + PAGE - 1}`,
          "User-Agent": UA,
        },
      },
    );
    const arr = await res.json();
    if (!Array.isArray(arr) || arr.length === 0) break;
    all.push(...arr);
    if (arr.length < PAGE) break;
  }
  return all.map((x) => ({
    nombre: [x.nombre, x.apellido].filter(Boolean).join(" ").trim(),
    edad: Number.isFinite(x.edad) ? Math.trunc(x.edad) : null,
    foto: x.foto_url,
    ubicacion: x.ultima_ubicacion,
    fecha: null,
    descripcion: x.descripcion,
    contacto: x.reportado_por_telefono,
    estado: x.estado === "encontrado" ? "localizado" : "desaparecido",
    createdAt: x.created_at ? Date.parse(x.created_at) || 0 : 0,
  }));
}

const SOURCES = [
  { name: "terremotovenezuela.app", fetch: fetchTerremotoApp },
  { name: "venezuelatebusca.com", fetch: fetchVenezuelaTeBusca },
];

// Claves que un moderador marcó como `rejected`: NO se vuelven a publicar.
async function fetchRejectedKeys() {
  const keys = new Set();
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const res = await fetchJson(
      `${SUPABASE_URL}/rest/v1/missing_persons?status=eq.rejected&dedupe_key=not.is.null&select=dedupe_key`,
      {
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
          Range: `${from}-${from + PAGE - 1}`,
        },
      },
    );
    const arr = await res.json();
    if (!Array.isArray(arr) || arr.length === 0) break;
    for (const r of arr) if (r.dedupe_key) keys.add(r.dedupe_key);
    if (arr.length < PAGE) break;
  }
  return keys;
}

async function main() {
  // 1) Traer todas las fuentes (sin abortar si una falla).
  const people = [];
  for (const src of SOURCES) {
    try {
      const items = await src.fetch();
      console.log(`Fuente ${src.name}: ${items.length} registros.`);
      people.push(...items);
    } catch (e) {
      console.error(`⚠ Fuente ${src.name} falló: ${e?.message || e}`);
    }
  }
  if (people.length === 0) throw new Error("Ninguna fuente devolvió registros.");

  // 2) Deduplicar quedándonos con el representante más rico por dedupe_key.
  const best = new Map();
  for (const x of people) {
    if (!norm(x.nombre)) continue; // descartar sin nombre
    const k = dedupeKey(x);
    if (!best.has(k) || better(x, best.get(k))) best.set(k, x);
  }

  // 3) Mapear a filas de `missing_persons` (folio/created_at los pone el default).
  const rows = [...best.entries()].map(([key, x]) => ({
    full_name: clean(x.nombre) ?? "(sin nombre)",
    age: Number.isFinite(x.edad) ? Math.trunc(x.edad) : null,
    photo_url: clean(x.foto),
    last_seen_zone: clean(x.ubicacion) ?? "No especificada",
    last_seen_at: isoDate(x.fecha),
    description: clean(x.descripcion),
    contact_whatsapp: clean(x.contacto),
    found: x.estado === "localizado",
    status: "approved",
    dedupe_key: key,
  }));

  console.log(`Total combinado: ${people.length} → ${rows.length} tras deduplicar.`);

  // 4) Respetar moderación: no re-publicar lo rechazado.
  const rejected = await fetchRejectedKeys();
  const toUpsert = rows.filter((r) => !rejected.has(r.dedupe_key));
  const skipped = rows.length - toUpsert.length;
  if (skipped > 0) console.log(`Respetando ${skipped} ficha(s) rechazada(s) por moderación.`);

  // 5) Upsert por lotes (ON CONFLICT dedupe_key → merge). Si existe, no duplica.
  const endpoint = `${SUPABASE_URL}/rest/v1/missing_persons?on_conflict=dedupe_key`;
  let sent = 0;
  for (let i = 0; i < toUpsert.length; i += CHUNK) {
    const batch = toUpsert.slice(i, i + CHUNK);
    await fetchJson(endpoint, {
      method: "POST",
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify(batch),
    });
    sent += batch.length;
    console.log(`  upsert ${sent}/${toUpsert.length}`);
  }

  console.log(`✓ Sync de fuentes completa: ${sent} upserted, ${skipped} rechazadas omitidas.`);
}

main().catch((e) => {
  console.error("✗ Falló la sincronización de fuentes:", e?.message || e);
  process.exit(1);
});
