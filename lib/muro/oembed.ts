import "server-only";
import { classifyTweet } from "./classify";
import { fetchTweetById } from "./syndication";
import type { MuroPost } from "../types";

// Reconstrucción GRATIS de un tweet desde su URL.
// Fuente primaria: API de sindicación (trae texto + autor + imagen + verificado;
// ver syndication.ts). Respaldo: oEmbed público de X (solo autor + texto, sin
// imagen) por si la sindicación falla puntualmente.
//   https://publish.twitter.com/oembed

const OEMBED = "https://publish.twitter.com/oembed";

export function extractTweetId(url: string): string | null {
  return url.match(/status(?:es)?\/(\d+)/)?.[1] ?? null;
}

export function normalizeTweetUrl(url: string): string {
  return url.trim().replace(/^http:\/\//, "https://").replace(/\?.*$/, "");
}

function decodeEntities(s: string): string {
  return s
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .trim();
}

interface OEmbedResponse {
  author_name?: string;
  author_url?: string;
  html?: string;
}

function extractHashtags(text: string): string[] {
  return Array.from(text.matchAll(/[#＃]([\p{L}\p{N}_]+)/gu)).map((m) => m[1]);
}

// Respaldo: reconstruye autor + texto desde el oEmbed (sin imagen).
async function tweetTextViaOEmbed(
  tweet_url: string,
): Promise<{ author_name: string; author_handle: string | null; text: string }> {
  const res = await fetch(
    `${OEMBED}?omit_script=1&dnt=true&url=${encodeURIComponent(tweet_url)}`,
    { headers: { Accept: "application/json" } },
  );
  if (!res.ok) {
    throw new Error("No se pudo leer el tweet (¿es público y existe?).");
  }
  const data: OEmbedResponse = await res.json();
  const html = data.html ?? "";
  const handle =
    data.author_url?.match(/(?:twitter|x)\.com\/([^/?#]+)/i)?.[1] ?? null;
  return {
    author_name: data.author_name ?? handle ?? "Cuenta de X",
    author_handle: handle,
    text: decodeEntities(html.match(/<p[^>]*>([\s\S]*?)<\/p>/i)?.[1] ?? ""),
  };
}

// Construye un MuroPost "pending" listo para moderación. Intenta la API de
// sindicación (con imagen + verificado) y, si falla, cae al oEmbed (solo texto).
export async function tweetUrlToPost(rawUrl: string): Promise<MuroPost> {
  const tweet_url = normalizeTweetUrl(rawUrl);
  const tweet_id = extractTweetId(tweet_url);
  if (!tweet_id) throw new Error("La URL no parece un tweet válido.");

  const syn = await fetchTweetById(tweet_id);

  const author_name = syn?.author_name ?? null;
  const author_handle = syn?.author_handle ?? null;
  const author_verified = syn?.author_verified ?? false;
  const image_url = syn?.image_url ?? null;
  let text = syn?.text ?? "";

  // Sin sindicación (o sin texto): respaldo por oEmbed.
  let fallbackAuthor: string | null = null;
  let fallbackHandle: string | null = null;
  if (!syn || !text) {
    const oe = await tweetTextViaOEmbed(tweet_url);
    text = text || oe.text;
    fallbackAuthor = oe.author_name;
    fallbackHandle = oe.author_handle;
  }

  const hashtags = extractHashtags(text);

  return {
    id: tweet_id,
    tweet_id,
    tweet_url,
    author_name: author_name ?? fallbackAuthor ?? "Cuenta de X",
    author_handle: author_handle ?? fallbackHandle,
    author_verified,
    text,
    image_url,
    hashtags,
    category: classifyTweet(text, hashtags),
    zone: null,
    status: "pending",
    created_at: syn?.created_at ?? new Date().toISOString(),
  };
}
