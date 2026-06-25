// Actividad sísmica — réplicas e historial.
//
// Fuente: USGS / FDSN Event Web Service (earthquake.usgs.gov). Es pública,
// gratuita, sin API key y devuelve GeoJSON. La consultamos acotada a una caja
// que cubre Venezuela. FUNVISIS (oficial venezolano) no expone una API JSON
// estable, por eso USGS es la fuente primaria.

const USGS = "https://earthquake.usgs.gov/fdsnws/event/1/query";

// Caja envolvente de Venezuela (lat/lng). Generosa para capturar sismos del
// territorio y costa norte (zona del terremoto de junio 2026).
const VE = { minlat: 0.6, maxlat: 13.0, minlng: -73.5, maxlng: -59.5 };

export interface Quake {
  id: string;
  mag: number | null;
  /** lugar ya traducido al español, p. ej. "a 5 km al NE de Guatire, Venezuela" */
  place: string;
  /** epoch en milisegundos */
  time: number;
  depthKm: number | null;
  lat: number;
  lng: number;
  /** página del evento en USGS */
  url: string;
  /** cuántas personas reportaron haberlo sentido (DYFI) */
  felt: number | null;
  tsunami: boolean;
  /** nivel PAGER: green | yellow | orange | red */
  alert: string | null;
}

export interface QuakeQuery {
  /** ventana hacia atrás en días */
  days?: number;
  /** magnitud mínima */
  minmag?: number;
  /** tope de resultados */
  limit?: number;
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// Direcciones del compás (inglés → español). USGS usa hasta 3 letras.
const DIR_ES: Record<string, string> = {
  N: "N", S: "S", E: "E", W: "O",
  NE: "NE", NW: "NO", SE: "SE", SW: "SO",
  NNE: "NNE", ENE: "ENE", ESE: "ESE", SSE: "SSE",
  SSW: "SSO", WSW: "OSO", WNW: "ONO", NNW: "NNO",
};

// "5 km NE of Guatire, Venezuela" → "a 5 km al NE de Guatire, Venezuela"
function localizePlace(raw: string): string {
  const m = raw.match(/^(\d+(?:\.\d+)?)\s*km\s+([NSEW]+)\s+of\s+(.+)$/i);
  if (m) {
    const dir = DIR_ES[m[2].toUpperCase()] ?? m[2].toUpperCase();
    return `a ${m[1]} km al ${dir} de ${m[3]}`;
  }
  // "Near the coast of ..." u otros formatos: limpiamos el "of" inicial.
  return raw.replace(/\bregion\b/i, "región");
}

interface UsgsFeature {
  id: string;
  properties: {
    mag: number | null;
    place: string | null;
    time: number;
    url: string;
    felt: number | null;
    tsunami: number;
    alert: string | null;
  };
  geometry: { coordinates: [number, number, number] };
}

function toQuake(f: UsgsFeature): Quake {
  const [lng, lat, depth] = f.geometry.coordinates;
  return {
    id: f.id,
    mag: f.properties.mag,
    place: f.properties.place ? localizePlace(f.properties.place) : "Ubicación no disponible",
    time: f.properties.time,
    depthKm: typeof depth === "number" ? depth : null,
    lat,
    lng,
    url: f.properties.url,
    felt: f.properties.felt,
    tsunami: f.properties.tsunami === 1,
    alert: f.properties.alert,
  };
}

/**
 * Lista de sismos en Venezuela, del más reciente al más antiguo.
 * Cachea 2 min (revalidate) para no golpear USGS en cada visita; la URL usa
 * fecha (sin hora) como `starttime`, así la clave de caché es estable.
 */
export async function getQuakes({
  days = 7,
  minmag = 2.5,
  limit = 200,
}: QuakeQuery = {}): Promise<Quake[]> {
  const start = new Date(Date.now() - days * 86_400_000);
  const params = new URLSearchParams({
    format: "geojson",
    starttime: isoDate(start),
    minlatitude: String(VE.minlat),
    maxlatitude: String(VE.maxlat),
    minlongitude: String(VE.minlng),
    maxlongitude: String(VE.maxlng),
    minmagnitude: String(minmag),
    orderby: "time",
    limit: String(limit),
  });

  try {
    const res = await fetch(`${USGS}?${params.toString()}`, {
      next: { revalidate: 120 },
      headers: { "User-Agent": "vzla-info portal ciudadano (contacto vía sitio)" },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { features?: UsgsFeature[] };
    return (data.features ?? []).map(toQuake);
  } catch {
    return [];
  }
}

// ---- Resumen para la cabecera (réplicas recientes + sismo principal) ----

export interface QuakeSummary {
  quakes: Quake[];
  /** sismo más reciente */
  latest: Quake | null;
  /** evento de mayor magnitud en la ventana */
  strongest: Quake | null;
  /** total de sismos en la ventana */
  count: number;
  /** réplicas en las últimas 24 h */
  last24h: number;
}

export async function getQuakeSummary(q: QuakeQuery = {}): Promise<QuakeSummary> {
  const quakes = await getQuakes(q);
  const dayAgo = Date.now() - 86_400_000;
  const strongest = quakes.reduce<Quake | null>(
    (best, cur) => ((cur.mag ?? -Infinity) > (best?.mag ?? -Infinity) ? cur : best),
    null,
  );
  return {
    quakes,
    latest: quakes[0] ?? null,
    strongest,
    count: quakes.length,
    last24h: quakes.filter((k) => k.time >= dayAgo).length,
  };
}

// ---- Helpers de presentación ----

export interface MagStyle {
  accent: string;
  soft: string;
  /** etiqueta cualitativa */
  label: string;
}

/** Color y etiqueta según magnitud (usa los tokens del sistema). */
export function magStyle(mag: number | null): MagStyle {
  const m = mag ?? 0;
  if (m >= 6) return { accent: "var(--color-alert)", soft: "var(--color-alert-soft)", label: "Fuerte" };
  if (m >= 4.5) return { accent: "var(--color-urgent)", soft: "var(--color-urgent-soft)", label: "Moderado" };
  if (m >= 3) return { accent: "var(--color-oro)", soft: "var(--color-oro-soft)", label: "Ligero" };
  return { accent: "var(--color-ink-faint)", soft: "var(--color-paper-sunk)", label: "Menor" };
}

/** Color en hex según magnitud (para Leaflet, que no resuelve variables CSS). */
export function magHex(mag: number | null): string {
  const m = mag ?? 0;
  if (m >= 6) return "#c1121f"; // alert
  if (m >= 4.5) return "#b45309"; // urgent
  if (m >= 3) return "#9a6a00"; // oro
  return "#717b88"; // ink-faint
}

/** Magnitud con coma decimal: 7.5 → "7,5". */
export function fmtMag(mag: number | null): string {
  return mag == null ? "—" : mag.toFixed(1).replace(".", ",");
}

/** Profundidad redondeada: 10 → "10 km". */
export function fmtDepth(depthKm: number | null): string {
  return depthKm == null ? "—" : `${Math.round(depthKm)} km`;
}

/** Tiempo relativo en español: "hace 5 min", "hace 2 h", "hace 3 d". */
export function relTime(ms: number, now = Date.now()): string {
  const diff = Math.max(0, now - ms);
  const min = Math.round(diff / 60_000);
  if (min < 1) return "hace instantes";
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.round(h / 24);
  return `hace ${d} d`;
}

/** Hora local de Venezuela: "24 jun, 5:05 p. m." */
export function fmtWhen(ms: number): string {
  return new Intl.DateTimeFormat("es-VE", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Caracas",
  }).format(new Date(ms));
}
