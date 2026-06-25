// ============================================================
// Repara las imágenes del MURO (solo la tabla `muro_posts`).
//
// Las primeras capturas se hicieron con un servicio gratuito que quedó tras
// Cloudflare y guardó la página "Sorry, you have been blocked" en vez del
// tweet. Este script recorre los posts y, vía la API de sindicación de X
// (cdn.syndication.twimg.com, gratis y sin key), regenera la imagen REAL:
//   · descarga la foto del tweet y la re-aloja en Storage (bucket "fotos")
//   · si el tweet no tiene foto → limpia image_url (borra la imagen rota)
//   · si el tweet fue borrado/privado → lo deja igual y avisa
// De paso refresca `author_verified` (antes siempre quedaba en false).
//
// SOLO toca `muro_posts`. No modifica ninguna otra tabla.
//
// Requiere variables de entorno:
//   SUPABASE_URL                 ej. https://gxxftzmhkmqeyqjflmqv.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY    service_role key (NUNCA exponer en el cliente)
//
// Uso:
//   node scripts/backfill-muro-images.mjs              # repara todos
//   node scripts/backfill-muro-images.mjs --only-missing   # solo sin imagen
//   node scripts/backfill-muro-images.mjs --dry-run        # no escribe nada
// ============================================================

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = "fotos";

const DRY_RUN = process.argv.includes("--dry-run");
const ONLY_MISSING = process.argv.includes("--only-missing");

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Faltan SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

// Token derivado del id (mismo cálculo que lib/muro/syndication.ts y react-tweet).
const tweetToken = (id) =>
  ((Number(id) / 1e15) * Math.PI).toString(36).replace(/(0+|\.)/g, "");

async function fetchWithRetry(url, init, tries = 3) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, init);
      if (!res.ok && res.status >= 500) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }
      return res;
    } catch (e) {
      lastErr = e;
      if (i < tries - 1) await new Promise((r) => setTimeout(r, 1200 * (i + 1)));
    }
  }
  throw lastErr;
}

const sbHeaders = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
};

// --- Lee todos los posts (paginado por Range) ---
async function fetchAllPosts() {
  const PAGE = 1000;
  const all = [];
  for (let from = 0; ; from += PAGE) {
    const res = await fetchWithRetry(
      `${SUPABASE_URL}/rest/v1/muro_posts?select=id,tweet_id,tweet_url,image_url,author_verified&order=created_at.asc`,
      { headers: { ...sbHeaders, Range: `${from}-${from + PAGE - 1}` } },
    );
    const arr = await res.json();
    if (!Array.isArray(arr) || arr.length === 0) break;
    all.push(...arr);
    if (arr.length < PAGE) break;
  }
  return all;
}

// --- Reconstruye el tweet por su id (sindicación) ---
async function fetchTweet(id) {
  const res = await fetchWithRetry(
    `https://cdn.syndication.twimg.com/tweet-result?id=${id}&lang=en&token=${tweetToken(id)}`,
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "application/json",
      },
    },
  );
  if (!res.ok) return { gone: true };
  let d;
  try {
    d = await res.json();
  } catch {
    return { gone: true };
  }
  if (d.__typename !== "Tweet") return { gone: true };
  // Foto directa o, si es video/GIF, su miniatura (póster): todos traen
  // media_url_https apuntando a un JPG.
  const image =
    d.mediaDetails?.[0]?.media_url_https ?? d.photos?.[0]?.url ?? null;
  const verified = Boolean(d.user?.verified || d.user?.is_blue_verified);
  return { image, verified };
}

// --- Descarga la foto del tweet ---
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

// --- Sube la foto a Storage y devuelve su URL pública (o null si falla) ---
async function rehost(tweetId, buf) {
  const path = `muro/${tweetId}.jpg`;
  const res = await fetchWithRetry(
    `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`,
    {
      method: "POST",
      headers: {
        ...sbHeaders,
        "Content-Type": "image/jpeg",
        "x-upsert": "true",
      },
      body: buf,
    },
  );
  if (!res.ok) return null;
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

// --- Actualiza la fila (solo image_url + author_verified) ---
async function patchPost(id, patch) {
  const res = await fetchWithRetry(
    `${SUPABASE_URL}/rest/v1/muro_posts?id=eq.${id}`,
    {
      method: "PATCH",
      headers: {
        ...sbHeaders,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(patch),
    },
  );
  if (!res.ok) {
    throw new Error(`PATCH ${id} → HTTP ${res.status} ${await res.text().catch(() => "")}`);
  }
}

async function main() {
  let posts = await fetchAllPosts();
  if (ONLY_MISSING) posts = posts.filter((p) => !p.image_url);
  console.log(
    `${posts.length} post(s) a procesar${ONLY_MISSING ? " (solo sin imagen)" : ""}${DRY_RUN ? " · DRY-RUN" : ""}.`,
  );

  const stats = { rehosted: 0, cleared: 0, gone: 0, unchanged: 0, failed: 0 };

  // Secuencial: el volumen del muro es bajo y evita rate-limits de X.
  for (const p of posts) {
    const tag = `@${p.tweet_id}`;
    try {
      const t = await fetchTweet(p.tweet_id);

      if (t.gone) {
        console.log(`  - ${tag} tweet borrado/privado: lo dejo igual`);
        stats.gone++;
        continue;
      }

      // El tweet no tiene foto → limpiar cualquier imagen previa (rota).
      if (!t.image) {
        if (p.image_url) {
          if (!DRY_RUN) await patchPost(p.id, { image_url: null, author_verified: t.verified });
          console.log(`  ✓ ${tag} sin foto: limpio image_url`);
          stats.cleared++;
        } else {
          if (!DRY_RUN && p.author_verified !== t.verified) {
            await patchPost(p.id, { author_verified: t.verified });
          }
          stats.unchanged++;
        }
        continue;
      }

      // Tiene foto → descargar y re-alojar.
      const buf = await downloadImage(t.image);
      let image_url = t.image; // respaldo: URL directa de twimg
      if (buf) {
        const hosted = DRY_RUN ? "(dry-run)" : await rehost(p.tweet_id, buf);
        if (hosted) image_url = hosted;
      }
      if (!DRY_RUN) await patchPost(p.id, { image_url, author_verified: t.verified });
      console.log(`  ✓ ${tag} imagen regenerada`);
      stats.rehosted++;
    } catch (e) {
      console.error(`  ✗ ${tag} ${e?.message || e}`);
      stats.failed++;
    }
  }

  console.log(
    `\n✓ Listo. Regeneradas ${stats.rehosted}, limpiadas ${stats.cleared}, ` +
      `borradas/privadas ${stats.gone}, sin cambios ${stats.unchanged}, fallidas ${stats.failed}.`,
  );
}

main().catch((e) => {
  console.error("✗ Falló el backfill:", e?.message || e);
  process.exit(1);
});
