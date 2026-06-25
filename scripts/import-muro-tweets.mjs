// ============================================================
// Importa en lote varios tweets al MURO (tabla `muro_posts`).
//
// Le pasas una lista de enlaces de X y, por cada uno, vía la API de sindicación
// (gratis, sin key), reconstruye el tweet (texto, autor, verificado, imagen),
// re-aloja la imagen en Storage, le asigna un triage automático e inserta la
// fila. Dedupe por tweet_id (re-importar el mismo link NO duplica).
//
// SOLO toca `muro_posts`. No modifica ninguna otra tabla.
//
// Env vars (igual que los otros scripts):
//   SUPABASE_URL                 ej. https://gxxftzmhkmqeyqjflmqv.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY    service_role key (NUNCA exponer en el cliente)
//
// Uso:
//   node scripts/import-muro-tweets.mjs --file links.txt          # publica (approved)
//   node scripts/import-muro-tweets.mjs --file links.txt --pending   # deja en cola
//   node scripts/import-muro-tweets.mjs https://x.com/a/status/1 https://x.com/b/status/2
//   node scripts/import-muro-tweets.mjs --file links.txt --dry-run   # no escribe nada
//
// El archivo de links: un enlace por línea (se ignoran líneas vacías y las que
// empiezan con #).
// ============================================================

import fs from "node:fs";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = "fotos";

const DRY_RUN = process.argv.includes("--dry-run");
const AS_PENDING = process.argv.includes("--pending");
const STATUS = AS_PENDING ? "pending" : "approved";

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Faltan SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

// --- Reúne las URLs: de --file <ruta> y/o de argumentos sueltos ---
function collectUrls() {
  const urls = [];
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--file") {
      const p = args[++i];
      const lines = fs.readFileSync(p, "utf8").split(/\r?\n/);
      for (const l of lines) {
        const t = l.trim();
        if (t && !t.startsWith("#")) urls.push(t);
      }
    } else if (!a.startsWith("--")) {
      urls.push(a);
    }
  }
  return urls;
}

// --- Helpers de tweet (mismo cálculo que lib/muro/syndication.ts) ---
const tweetToken = (id) =>
  ((Number(id) / 1e15) * Math.PI).toString(36).replace(/(0+|\.)/g, "");

const normalizeUrl = (u) =>
  u.trim().replace(/^http:\/\//, "https://").replace(/\?.*$/, "");

const extractId = (u) => u.match(/status(?:es)?\/(\d+)/)?.[1] ?? null;

const extractHashtags = (text) =>
  Array.from(text.matchAll(/[#＃]([\p{L}\p{N}_]+)/gu)).map((m) => m[1]);

// --- Triage automático (replica lib/muro/classify.ts) ---
const DESAPARECIDO = ["desaparec","se busca","buscamos a","busco a","no contesta","no aparece","última vez","ultima vez","visto por última","ayúdenme a encontrar","ayudenme a encontrar"];
const OFRECE = ["ofrezco","ofrecemos","tenemos espacio","tenemos cupo","disponemos","disponible para","puedo alojar","podemos alojar","doy ","regalo ","tengo disponible"];
const NECESITA = ["necesito","necesitamos","se necesita","hace falta","urge ","urgente","buscamos donaciones","ayuda con","por favor ayuda"];
function classify(text, hashtags) {
  const hay = (text + " " + hashtags.join(" ")).toLowerCase();
  if (DESAPARECIDO.some((n) => hay.includes(n))) return "desaparecido";
  if (OFRECE.some((n) => hay.includes(n))) return "ofrece_ayuda";
  if (NECESITA.some((n) => hay.includes(n))) return "necesita_ayuda";
  return "sin_clasificar";
}

const sbHeaders = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
};

async function fetchTweet(id) {
  const res = await fetch(
    `https://cdn.syndication.twimg.com/tweet-result?id=${id}&lang=en&token=${tweetToken(id)}`,
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "application/json",
      },
    },
  );
  if (!res.ok) return null;
  let d;
  try {
    d = await res.json();
  } catch {
    return null;
  }
  if (d.__typename !== "Tweet") return null;
  // Foto directa o, si es video/GIF, su miniatura (póster).
  const image =
    d.mediaDetails?.[0]?.media_url_https ?? d.photos?.[0]?.url ?? null;
  return {
    text: (d.full_text ?? d.text ?? "").trim(),
    author_name: d.user?.name ?? d.user?.screen_name ?? "Cuenta de X",
    author_handle: d.user?.screen_name ?? null,
    author_verified: Boolean(d.user?.verified || d.user?.is_blue_verified),
    image_url: image,
    created_at: d.created_at ?? null,
  };
}

async function downloadImage(url) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0", Accept: "image/*" },
    });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    return buf.length > 1000 ? buf : null;
  } catch {
    return null;
  }
}

async function rehost(tweetId, buf) {
  const path = `muro/${tweetId}.jpg`;
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`, {
    method: "POST",
    headers: { ...sbHeaders, "Content-Type": "image/jpeg", "x-upsert": "true" },
    body: buf,
  });
  if (!res.ok) return null;
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

// Upsert por tweet_id (la tabla tiene UNIQUE en tweet_id).
async function upsert(row) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/muro_posts?on_conflict=tweet_id`,
    {
      method: "POST",
      headers: {
        ...sbHeaders,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify(row),
    },
  );
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${await res.text().catch(() => "")}`);
  }
}

async function main() {
  const urls = collectUrls();
  if (urls.length === 0) {
    console.error("No diste ningún enlace. Usa --file links.txt o pásalos como argumentos.");
    process.exit(1);
  }
  console.log(
    `${urls.length} enlace(s) → estado "${STATUS}"${DRY_RUN ? " · DRY-RUN" : ""}.`,
  );

  const stats = { ok: 0, gone: 0, invalid: 0, failed: 0 };

  for (const raw of urls) {
    const url = normalizeUrl(raw);
    const id = extractId(url);
    if (!id) {
      console.error(`  ✗ no parece un tweet: ${raw}`);
      stats.invalid++;
      continue;
    }
    try {
      const t = await fetchTweet(id);
      if (!t) {
        console.log(`  - @${id} borrado/privado/no encontrado: lo salto`);
        stats.gone++;
        continue;
      }

      let image_url = t.image_url;
      if (image_url && !DRY_RUN) {
        const buf = await downloadImage(image_url);
        if (buf) {
          const hosted = await rehost(id, buf);
          if (hosted) image_url = hosted; // si falla, queda la URL de twimg
        }
      }

      const hashtags = extractHashtags(t.text);
      const row = {
        tweet_id: id,
        tweet_url: url,
        author_name: t.author_name,
        author_handle: t.author_handle,
        author_verified: t.author_verified,
        text: t.text,
        image_url,
        hashtags,
        category: classify(t.text, hashtags),
        status: STATUS,
        ...(t.created_at ? { created_at: t.created_at } : {}),
      };

      if (!DRY_RUN) await upsert(row);
      console.log(`  ✓ @${id} [${row.category}] ${t.author_name}: ${t.text.slice(0, 60)}…`);
      stats.ok++;
    } catch (e) {
      console.error(`  ✗ @${id} ${e?.message || e}`);
      stats.failed++;
    }
  }

  console.log(
    `\n✓ Listo. Importados ${stats.ok}, borrados/privados ${stats.gone}, ` +
      `inválidos ${stats.invalid}, fallidos ${stats.failed}.`,
  );
}

main().catch((e) => {
  console.error("✗ Falló la importación:", e?.message || e);
  process.exit(1);
});
