import "server-only";

// Descarga la imagen REAL del tweet (la URL de twimg que entrega la API de
// sindicación; ver syndication.ts) para re-alojarla y no depender del enlace
// original (que se rompe si borran el tweet o X bloquea el hotlink).
//
// Antes esto fotografiaba el tweet con un servicio de capturas gratuito, pero
// ese servicio quedó tras Cloudflare y devolvía la página "Sorry, you have been
// blocked" en vez del tweet. Ahora descargamos la foto directa: fiable y nítida.

// Descarga los bytes de una imagen. Devuelve null si falla o sale muy pequeña.
export async function fetchImageBytes(imageUrl: string): Promise<Buffer | null> {
  try {
    const res = await fetch(imageUrl, {
      headers: { "User-Agent": "Mozilla/5.0", Accept: "image/*" },
    });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    return buf.length > 1000 ? buf : null; // descarta vacíos/errores
  } catch {
    return null;
  }
}

// PRUEBA LOCAL: guarda la imagen en public/muro-shots/ y devuelve su URL pública
// servida por Next, o null. En producción se sube a Supabase Storage (ver db.ts).
export async function saveImageLocal(
  imageUrl: string,
  id: string,
): Promise<string | null> {
  const buf = await fetchImageBytes(imageUrl);
  if (!buf) return null;

  const fs = await import("node:fs");
  const path = await import("node:path");
  const dir = path.join(process.cwd(), "public", "muro-shots");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${id}.jpg`), buf);
  return `/muro-shots/${id}.jpg`;
}
