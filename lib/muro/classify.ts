import type { MuroCategory } from "../types";

// Clasificador heurístico de triage. Asigna una categoría tentativa al recopilar
// un tweet; el moderador la confirma o corrige antes de publicar.
// Es deliberadamente conservador: ante la duda, deja "sin_clasificar".

const DESAPARECIDO = [
  "desaparec",
  "se busca",
  "buscamos a",
  "busco a",
  "no contesta",
  "no aparece",
  "última vez",
  "ultima vez",
  "visto por última",
  "ayúdenme a encontrar",
  "ayudenme a encontrar",
];

const OFRECE = [
  "ofrezco",
  "ofrecemos",
  "tenemos espacio",
  "tenemos cupo",
  "disponemos",
  "disponible para",
  "puedo alojar",
  "podemos alojar",
  "doy ",
  "regalo ",
  "tengo disponible",
];

const NECESITA = [
  "necesito",
  "necesitamos",
  "se necesita",
  "hace falta",
  "urge ",
  "urgente",
  "buscamos donaciones",
  "ayuda con",
  "por favor ayuda",
];

function matches(haystack: string, needles: string[]): boolean {
  return needles.some((n) => haystack.includes(n));
}

export function classifyTweet(text: string, hashtags: string[]): MuroCategory {
  const hay = (text + " " + hashtags.join(" ")).toLowerCase();

  // Desaparecidos tiene prioridad (lo más crítico).
  if (matches(hay, DESAPARECIDO)) return "desaparecido";
  if (matches(hay, OFRECE)) return "ofrece_ayuda";
  if (matches(hay, NECESITA)) return "necesita_ayuda";
  return "sin_clasificar";
}
