// ============================================================
// Sincroniza la lista de desaparecidos del sismo desde la API pública
// del sitio original hacia nuestra tabla `missing_persons` (Supabase).
//
//   Fuente:  https://desaparecidos-terremoto-api.theempire.tech/api/personas
//   Destino: <SUPABASE_URL>/rest/v1/missing_persons  (upsert por dedupe_key)
//
// Idempotente: deduplica (nombre+ubicación+contacto) y hace UPSERT, así que
// re-correrlo no duplica; solo inserta nuevos y refresca los existentes
// (p. ej. cuando alguien pasa a "localizado").
//
// Requiere variables de entorno (GitHub Actions → repo secrets):
//   SUPABASE_URL                 ej. https://gxxftzmhkmqeyqjflmqv.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY    service_role key (NUNCA exponer en el cliente)
//
// Uso: node scripts/sync-desaparecidos.mjs
// ============================================================

const SOURCE = "https://desaparecidos-terremoto-api.theempire.tech/api/personas";
const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const CHUNK = 500;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Faltan SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

// --- normalización: DEBE coincidir con el backfill SQL de la migración ---
const norm = (s) => (s || "").toLowerCase().trim().replace(/\s+/g, " ");
const dedupeKey = (x) =>
  `${norm(x.nombre)}|${norm(x.ubicacion)}|${norm(x.contacto)}`;

// Representante "más rico" por grupo: con foto > descripción más larga >
// el reporte más antiguo (createdAt menor). Determinista entre corridas.
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
  const t = (v || "").trim();
  return t || null;
};
const isoDate = (v) => (/^\d{4}-\d{2}-\d{2}$/.test((v || "").trim()) ? v.trim() : null);

async function fetchJson(url, init, tries = 3) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, init);
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

// La API devuelve { items, total, page, pageSize, totalPages }. Paginamos
// (máx. 100 por página) hasta recorrerlas todas.
async function fetchAllPeople() {
  const PAGE_SIZE = 100;
  const all = [];
  let page = 1;
  let totalPages = 1;
  do {
    const res = await fetchJson(
      `${SOURCE}?page=${page}&pageSize=${PAGE_SIZE}`,
      { headers: { "User-Agent": "vzla-info-sync" } },
    );
    const j = await res.json();
    const items = Array.isArray(j) ? j : j.items ?? [];
    if (items.length === 0) break;
    all.push(...items);
    totalPages = Number.isFinite(j.totalPages) ? j.totalPages : 1;
    page++;
  } while (page <= totalPages && page <= 1000); // tope de seguridad
  return all;
}

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
  // 1) Traer la fuente (todas las páginas).
  const people = await fetchAllPeople();
  if (people.length === 0) throw new Error("La fuente no devolvió registros.");

  // 2) Deduplicar (estrategia B), quedándonos con el representante más rico.
  const best = new Map();
  for (const x of people) {
    const k = dedupeKey(x);
    if (!best.has(k) || better(x, best.get(k))) best.set(k, x);
  }

  // 3) Mapear a filas de `missing_persons`. Omitimos folio/created_at a
  //    propósito: en INSERT los pone el default (secuencia / now()) y en
  //    UPDATE no se tocan.
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

  console.log(`Fuente: ${people.length} registros → ${rows.length} tras deduplicar.`);

  // 4) Respetar moderación: descartar lo que un moderador haya rechazado,
  //    para no volver a publicarlo en cada corrida.
  const rejected = await fetchRejectedKeys();
  const toUpsert = rows.filter((r) => !rejected.has(r.dedupe_key));
  const skipped = rows.length - toUpsert.length;
  if (skipped > 0) {
    console.log(`Respetando ${skipped} ficha(s) rechazada(s) por moderación.`);
  }

  // 5) Upsert por lotes (ON CONFLICT dedupe_key → merge).
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

  console.log(`✓ Sincronización completa: ${sent} upserted, ${skipped} rechazadas omitidas.`);
}

main().catch((e) => {
  console.error("✗ Falló la sincronización:", e?.message || e);
  process.exit(1);
});
