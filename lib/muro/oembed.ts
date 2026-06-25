import "server-only";
import { classifyTweet } from "./classify";
import type { MuroPost } from "../types";

// Reconstrucción GRATIS de un tweet desde su URL con el oEmbed público de X
// (sin API key, sin cuenta de pago):  https://publish.twitter.com/oembed
// Devuelve autor + texto. La imagen no viene en oEmbed; se obtiene aparte por
// screenshot (ver screenshot.ts).

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

// Construye un MuroPost "pending" (sin imagen todavía) listo para moderación.
export async function tweetUrlToPost(rawUrl: string): Promise<MuroPost> {
  const tweet_url = normalizeTweetUrl(rawUrl);
  const tweet_id = extractTweetId(tweet_url);
  if (!tweet_id) throw new Error("La URL no parece un tweet válido.");

  const res = await fetch(
    `${OEMBED}?omit_script=1&dnt=true&url=${encodeURIComponent(tweet_url)}`,
    { headers: { Accept: "application/json" } },
  );
  if (!res.ok) {
    throw new Error("No se pudo leer el tweet (¿es público y existe?).");
  }
  const data: OEmbedResponse = await res.json();

  const html = data.html ?? "";
  const text = decodeEntities(html.match(/<p[^>]*>([\s\S]*?)<\/p>/i)?.[1] ?? "");
  const handle =
    data.author_url?.match(/(?:twitter|x)\.com\/([^/?#]+)/i)?.[1] ?? null;
  const hashtags = Array.from(text.matchAll(/[#＃]([\p{L}\p{N}_]+)/gu)).map(
    (m) => m[1],
  );

  return {
    id: tweet_id,
    tweet_id,
    tweet_url,
    author_name: data.author_name ?? handle ?? "Cuenta de X",
    author_handle: handle,
    author_verified: false,
    text,
    image_url: null,
    hashtags,
    category: classifyTweet(text, hashtags),
    zone: null,
    status: "pending",
    created_at: new Date().toISOString(),
  };
}
