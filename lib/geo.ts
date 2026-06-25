// Gazetteer curado de localidades de La Guaira/Vargas (epicentro del sismo) y
// algunas de Caracas, para ubicar las zonas en texto libre SIN API externa.
// Coordenadas aproximadas a nivel de localidad (suficiente para un mapa de
// situación por clusters). El orden importa: lo específico va primero y lo
// genérico ("la guaira", "caracas") al final, como respaldo.

export interface Place {
  name: string;
  lat: number;
  lng: number;
  aliases: string[]; // texto normalizado (minúsculas, sin acentos) a buscar como subcadena
}

export const GAZETTEER: Place[] = [
  // --- Costa de Vargas, de este a oeste (específicas primero) ---
  { name: "Chuspa", lat: 10.633, lng: -66.300, aliases: ["chuspa"] },
  { name: "Los Caracas", lat: 10.610, lng: -66.480, aliases: ["los caracas"] },
  { name: "Anare", lat: 10.622, lng: -66.665, aliases: ["anare"] },
  { name: "Camurí Grande", lat: 10.620, lng: -66.700, aliases: ["camuri grande", "camuri"] },
  { name: "Naiguatá", lat: 10.625, lng: -66.738, aliases: ["naiguata"] },
  { name: "Carmen de Uria", lat: 10.617, lng: -66.790, aliases: ["carmen de uria"] },
  { name: "Tanaguarena", lat: 10.617, lng: -66.823, aliases: ["tanaguarena"] },
  { name: "Los Corales", lat: 10.611, lng: -66.852, aliases: ["los corales", "corales"] },
  { name: "Caraballeda", lat: 10.612, lng: -66.847, aliases: ["caraballeda"] },
  { name: "Caribe", lat: 10.613, lng: -66.842, aliases: ["caribe"] },
  { name: "Camurí Chico", lat: 10.611, lng: -66.872, aliases: ["camuri chico"] },
  { name: "Macuto", lat: 10.609, lng: -66.890, aliases: ["macuto"] },
  { name: "Los Cocos", lat: 10.602, lng: -66.925, aliases: ["los cocos"] },
  { name: "Playa Grande", lat: 10.607, lng: -67.010, aliases: ["playa grande"] },
  { name: "Maiquetía", lat: 10.598, lng: -66.969, aliases: ["maiquetia"] },
  { name: "Catia la Mar", lat: 10.601, lng: -67.027, aliases: ["catia la mar", "catia"] },
  { name: "Chichiriviche de la Costa", lat: 10.553, lng: -67.300, aliases: ["chichiriviche"] },
  // --- Caracas ---
  { name: "Los Palos Grandes", lat: 10.498, lng: -66.843, aliases: ["los palos grandes", "palos grandes"] },
  { name: "San Bernardino", lat: 10.510, lng: -66.897, aliases: ["san bernardino"] },
  { name: "La Llanada", lat: 10.486, lng: -66.806, aliases: ["la llanada"] },
  // --- Respaldos genéricos (al final) ---
  { name: "La Guaira", lat: 10.601, lng: -66.931, aliases: ["la guaira", "la guira", "guaira", "vargas"] },
  { name: "Caracas", lat: 10.488, lng: -66.879, aliases: ["caracas"] },
];

/** Ubica una zona (texto ya normalizado) en una localidad del gazetteer. */
export function geocodeZone(zoneNorm: string): Place | null {
  if (!zoneNorm) return null;
  for (const p of GAZETTEER) {
    if (p.aliases.some((a) => zoneNorm.includes(a))) return p;
  }
  return null;
}

export interface ZoneCluster {
  name: string;
  lat: number;
  lng: number;
  count: number;
}

/** Agrega filas {zone, n} en clusters por localidad; devuelve también cuántas no se ubicaron. */
export function aggregateZones(rows: { zone: string; n: number }[]): {
  clusters: ZoneCluster[];
  located: number;
  unlocated: number;
} {
  const byPlace = new Map<string, ZoneCluster>();
  let located = 0;
  let unlocated = 0;
  for (const r of rows) {
    const p = geocodeZone(r.zone);
    if (!p) {
      unlocated += r.n;
      continue;
    }
    located += r.n;
    const existing = byPlace.get(p.name);
    if (existing) existing.count += r.n;
    else byPlace.set(p.name, { name: p.name, lat: p.lat, lng: p.lng, count: r.n });
  }
  const clusters = [...byPlace.values()].sort((a, b) => b.count - a.count);
  return { clusters, located, unlocated };
}
