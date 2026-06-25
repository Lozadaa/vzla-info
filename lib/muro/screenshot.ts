import "server-only";

// Screenshot GRATIS de un tweet (sin API key). Truco: no fotografiamos x.com
// directo (suele salir el muro de "inicia sesión"); fotografiamos el RENDER del
// embed oficial vía un visor (twitframe), que muestra el tweet con su foto.

function embedRenderUrl(tweetUrl: string): string {
  return `https://twitframe.com/show?url=${encodeURIComponent(tweetUrl)}`;
}

// Servicio de captura sin key. Apuntado al render del embed.
// thum.io espera la URL destino CRUDA al final (sin codificar).
function serviceScreenshotUrl(tweetUrl: string): string {
  return `https://image.thum.io/get/width/600/noanimate/${embedRenderUrl(tweetUrl)}`;
}

// Descarga los bytes del screenshot. Devuelve null si falla o sale vacío.
export async function fetchTweetScreenshot(
  tweetUrl: string,
): Promise<Buffer | null> {
  try {
    const res = await fetch(serviceScreenshotUrl(tweetUrl));
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    return buf.length > 1000 ? buf : null; // descarta imágenes vacías/errores
  } catch {
    return null;
  }
}

// PRUEBA LOCAL: guarda el screenshot en public/muro-shots/ (misma carpeta del
// proyecto, como acordamos). Devuelve la URL pública servida por Next, o null.
// En producción esto se reemplaza por subir a Supabase Storage (bucket "fotos").
export async function saveScreenshotLocal(
  tweetUrl: string,
  id: string,
): Promise<string | null> {
  const buf = await fetchTweetScreenshot(tweetUrl);
  if (!buf) return null;

  const fs = await import("node:fs");
  const path = await import("node:path");
  const dir = path.join(process.cwd(), "public", "muro-shots");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${id}.png`), buf);
  return `/muro-shots/${id}.png`;
}
