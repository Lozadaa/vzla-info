// ============================================================
// Moderación automática — Vzla Info
// Escanea las tablas de contenido en Supabase (conexión directa Postgres,
// salta RLS/grants) y detecta registros troll / groseros / inapropiados.
//
// Uso:
//   node scripts/moderar.mjs            -> DRY-RUN (solo reporta, no borra)
//   node scripts/moderar.mjs --apply    -> borra los registros detectados
//   node scripts/moderar.mjs --json     -> salida JSON (para el loop)
//
// Política: AGRESIVA — marca si CUALQUIER campo (nombre, título, cuerpo,
// handle, zona) coincide con figura política troll, groserías o patrones
// troll. Se cuida la "trampa Scunthorpe": las groserías se buscan como
// palabra completa en nombres (para no borrar a un real "Vergara"), y como
// subcadena solo en handles (que son deliberados).
// ============================================================

import { readFileSync } from "node:fs";
import pg from "pg";

const APPLY = process.argv.includes("--apply");
const AS_JSON = process.argv.includes("--json");

// ---- Carga mínima de .env.local (gitignored): los secretos viven ahí, no
// en este script (que sí se commitea). ----
function loadEnvLocal() {
  try {
    for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      const key = m[1];
      let val = m[2].replace(/^["']|["']$/g, "");
      if (process.env[key] === undefined) process.env[key] = val;
    }
  } catch {
    /* sin .env.local */
  }
}
loadEnvLocal();

// ---- Conexión (cloud, directa como postgres) ----
function connectionString() {
  if (process.env.MODERATION_DB_URL) return process.env.MODERATION_DB_URL.trim();
  const REF = process.env.SUPABASE_CLOUD_PROJECT_REF || "gxxftzmhkmqeyqjflmqv";
  const PASS = process.env.SUPABASE_CLOUD_DB_PASSWORD || "";
  const HOST = process.env.SUPABASE_CLOUD_POOLER_HOST || "aws-1-us-east-1.pooler.supabase.com";
  if (!PASS) {
    throw new Error(
      "Falta SUPABASE_CLOUD_DB_PASSWORD en .env.local (o MODERATION_DB_URL). " +
        "No puedo conectarme a la BD de producción."
    );
  }
  return `postgresql://postgres.${REF}:${encodeURIComponent(PASS)}@${HOST}:5432/postgres`;
}

// ---- Normalización (minúsculas, sin acentos) ----
const norm = (s) =>
  (s ?? "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

// ---- Listas de detección ----
// CLAVE: las figuras políticas / famosos / patrones solo se buscan en campos
// de IDENTIDAD (nombre, título, handle). NUNCA en zona/ubicación ni en
// descripciones libres, porque hay topónimos legítimos como "Urb. Hugo Chávez"
// (una urbanización real) y eso borraría desaparecidos reales.

// Figuras políticas — nombres completos y DISTINTIVOS (evitamos nombres
// comunes tipo "Jorge Rodríguez" para no pegarle a homónimos reales).
const POLITICAL = [
  "nicolas maduro", "maduro moros", "hugo chavez",
  "diosdado cabello", "tareck el aissami", "delcy rodriguez", "cilia flores",
];

// Nombres famosos/ficticios usados como troll (nombre completo).
const FAMOUS = [
  "mickey mouse", "john cena", "chuck norris", "spider man", "spiderman",
  "bad bunny", "cristiano ronaldo", "lionel messi", "el chavo", "peppa pig",
  "bob esponja", "goku", "donald trump", "joe biden", "barney",
];

// Groserías para campos de NOMBRE (palabra completa, sin acentos). Se omiten
// ambiguas (cono/culo/zorra/joder) que producen falsos positivos.
const PROFANITY = [
  "verga", "vergalarga", "vergota", "vergazo", "coño", "marico", "maricon",
  "mariconzon", "puta", "puto", "mierda", "pinga", "pendejo", "mamahuevo",
  "mamaguevo", "mamaverga", "mamavergas", "singar", "webon", "guebon",
  "guevon", "gonorrea", "malparido", "hijueputa", "hijodeputa", "cabron",
  "coñoetumadre", "conoetumadre", "verguero", "comemierda", "guevonada",
];

// Subcadenas vulgares para HANDLES (deliberados, sin riesgo de surname).
const HANDLE_ROOTS = ["verga", "mamahuevo", "mamaguevo", "puta", "puto", "marico", "coño", "mierda", "pinga", "gonorrea"];

// Vulgaridad para CUERPOS de texto libre: solo lo inequívoco (nunca aparece en
// un reporte real, ni siquiera de alguien angustiado que dice una grosería).
const HARDCORE = [
  "mamahuevo", "mamaguevo", "mamaverga", "mamavergas", "coñoetumadre",
  "conoetumadre", "hijueputa", "hijodeputa", "malparido", "gonorrea",
  "vergalarga", "mariconzon", "comemierda", "guevonada",
];

// Patrones troll (mashing de teclado / basura) — solo en campos de nombre.
const TROLL_PATTERNS = [
  /\b(asdf+|asdasd+|qwerty+|test\s*test|lorem ipsum|aaaa+|zzzz+|xd{3,})\b/,
  /(.)\1{5,}/, // 6+ caracteres idénticos seguidos
];

const WORD = (root) => new RegExp(`(^|[^a-z0-9])${root.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z0-9]|$)`);

// ---- Evaluación por clase de campo ----
// name  → identidad: todas las reglas (lo que el reporte ES).
// handle→ identidad con subcadena vulgar permitida.
// body  → texto libre: solo vulgaridad inequívoca.
function checkName(value) {
  const n = norm(value);
  if (!n.trim()) return null;
  for (const p of POLITICAL) if (n.includes(p)) return `figura política como nombre: "${p}"`;
  for (const f of FAMOUS) if (n.includes(f)) return `nombre famoso/ficticio: "${f}"`;
  for (const w of PROFANITY) if (WORD(w).test(n)) return `grosería en el nombre: "${w}"`;
  for (const re of TROLL_PATTERNS) if (re.test(n)) return `nombre basura/troll`;
  return null;
}
function checkHandle(value) {
  const n = norm(value);
  if (!n.trim()) return null;
  const nh = n.replace(/[^a-z0-9]/g, "");
  for (const r of HANDLE_ROOTS) if (nh.includes(r)) return `handle vulgar: "${r}"`;
  return checkName(value);
}
function checkBody(value) {
  const n = norm(value);
  if (!n.trim()) return null;
  for (const w of HARDCORE) if (WORD(w).test(n)) return `vulgaridad inequívoca: "${w}"`;
  return null;
}

// ---- Configuración de tablas (campos por clase) ----
// names  = identidad (todas las reglas) · handles = identidad+subcadena
// bodies = texto libre (solo HARDCORE). Zonas/ubicaciones se EXCLUYEN a
// propósito (topónimos legítimos con nombres políticos).
const TABLES = [
  { table: "safe_reports", label: "Estoy a salvo", names: ["full_name"], handles: [], bodies: ["message"] },
  { table: "missing_persons", label: "Personas buscadas", names: ["full_name"], handles: [], bodies: ["description"] },
  { table: "tips", label: "Información aportada", names: ["person_name"], handles: [], bodies: ["info"] },
  { table: "help_listings", label: "Ayuda", names: ["title"], handles: [], bodies: ["description"] },
  { table: "muro_posts", label: "Muro", names: ["author_name"], handles: ["author_handle"], bodies: ["text"] },
  { table: "modification_requests", label: "Solicitudes de cambio", names: ["requested_full_name"], handles: [], bodies: ["note"] },
];

async function tableExists(client, table) {
  const { rows } = await client.query("select to_regclass($1) as t", [`public.${table}`]);
  return rows[0].t !== null;
}

async function run() {
  const client = new pg.Client({
    connectionString: connectionString(),
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  const findings = [];
  for (const cfg of TABLES) {
    if (!(await tableExists(client, cfg.table))) continue;
    const cols = ["id", ...cfg.names, ...cfg.handles, ...cfg.bodies];
    const { rows } = await client.query(`select ${cols.join(", ")} from public.${cfg.table}`);
    for (const row of rows) {
      let hit = null;
      let where = null;
      for (const f of cfg.names) {
        const r = checkName(row[f]);
        if (r) { hit = r; where = f; break; }
      }
      if (!hit) for (const f of cfg.handles) {
        const r = checkHandle(row[f]);
        if (r) { hit = r; where = f; break; }
      }
      if (!hit) for (const f of cfg.bodies) {
        const r = checkBody(row[f]);
        if (r) { hit = r; where = f; break; }
      }
      if (hit) {
        findings.push({
          table: cfg.table,
          label: cfg.label,
          id: row.id,
          field: where,
          reason: hit,
          sample: String(row[where] ?? "").slice(0, 90),
        });
      }
    }
  }

  let deleted = 0;
  if (APPLY && findings.length) {
    const byTable = {};
    for (const f of findings) (byTable[f.table] ??= []).push(f.id);
    for (const [table, ids] of Object.entries(byTable)) {
      const res = await client.query(`delete from public.${table} where id = any($1::uuid[])`, [ids]);
      deleted += res.rowCount;
    }
  }
  await client.end();

  if (AS_JSON) {
    console.log(JSON.stringify({ applied: APPLY, found: findings.length, deleted, findings }, null, 2));
  } else {
    const ts = new Date().toISOString();
    console.log(`\n[moderación ${ts}] ${APPLY ? "APLICANDO" : "DRY-RUN"} — ${findings.length} detectado(s)${APPLY ? `, ${deleted} borrado(s)` : ""}`);
    if (!findings.length) {
      console.log("  ✓ Sin registros troll/inapropiados.");
    } else {
      for (const f of findings) {
        console.log(`  • [${f.label}] ${f.field}="${f.sample}"  →  ${f.reason}  (${f.id})`);
      }
      if (!APPLY) console.log(`\n  (dry-run: ningún registro fue borrado. Usa --apply para borrar.)`);
    }
  }
  return { found: findings.length, deleted };
}

run().catch((e) => {
  console.error("ERROR moderación:", e.message);
  process.exit(1);
});
