import "server-only";

// Reconstrucción GRATIS y completa de un tweet desde su ID, vía la API pública
// de sindicación de X (la misma que usan los embeds oficiales y la librería
// `react-tweet` de Vercel). Sin API key, sin cuenta de pago.
//
//   https://cdn.syndication.twimg.com/tweet-result?id=<id>&lang=en&token=<token>
//
// A diferencia del oEmbed, esto SÍ trae: la(s) imagen(es) del tweet, el avatar,
// el estado de verificación y la fecha. Por eso reemplaza al screenshot.

const SYNDICATION = "https://cdn.syndication.twimg.com/tweet-result";

// El endpoint exige un "token" derivado del id (mismo cálculo que react-tweet).
function tweetToken(id: string): string {
  return ((Number(id) / 1e15) * Math.PI).toString(36).replace(/(0+|\.)/g, "");
}

interface SyndicationUser {
  name?: string;
  screen_name?: string;
  verified?: boolean;
  is_blue_verified?: boolean;
}

interface SyndicationMedia {
  type?: string; // "photo" | "video" | "animated_gif"
  media_url_https?: string;
}

interface SyndicationTweet {
  __typename?: string;
  text?: string;
  full_text?: string;
  created_at?: string;
  user?: SyndicationUser;
  mediaDetails?: SyndicationMedia[];
  photos?: { url?: string }[];
}

export interface TweetData {
  text: string;
  author_name: string;
  author_handle: string | null;
  author_verified: boolean;
  image_url: string | null; // primera foto del tweet (URL directa de twimg)
  created_at: string | null;
}

// Devuelve los datos del tweet, o null si no existe / es privado / fue borrado
// (el endpoint responde con un "tombstone" sin __typename "Tweet").
export async function fetchTweetById(id: string): Promise<TweetData | null> {
  const url = `${SYNDICATION}?id=${id}&lang=en&token=${tweetToken(id)}`;
  let res: Response;
  try {
    res = await fetch(url, {
      headers: {
        // X responde vacío sin un User-Agent de navegador.
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "application/json",
      },
    });
  } catch {
    return null;
  }
  if (!res.ok) return null;

  let data: SyndicationTweet;
  try {
    data = (await res.json()) as SyndicationTweet;
  } catch {
    return null;
  }
  if (data.__typename !== "Tweet") return null;

  // Imagen del tweet: si es foto, su URL; si es video o GIF, su miniatura
  // (póster). Todos los tipos traen `media_url_https` apuntando a un JPG.
  const image =
    data.mediaDetails?.[0]?.media_url_https ?? data.photos?.[0]?.url ?? null;

  return {
    text: (data.full_text ?? data.text ?? "").trim(),
    author_name: data.user?.name ?? data.user?.screen_name ?? "Cuenta de X",
    author_handle: data.user?.screen_name ?? null,
    author_verified: Boolean(data.user?.verified || data.user?.is_blue_verified),
    image_url: image,
    created_at: data.created_at ?? null,
  };
}
