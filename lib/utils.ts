import { MissingPerson } from "./types";

/** Normaliza un número a formato wa.me (solo dígitos, con código de país). */
export function waNumber(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 7) return null;
  return digits;
}

/** Construye un enlace de WhatsApp con mensaje pre-escrito. */
export function waLink(number: string | null | undefined, message: string): string {
  const n = waNumber(number);
  const text = encodeURIComponent(message);
  return n ? `https://wa.me/${n}?text=${text}` : `https://wa.me/?text=${text}`;
}

/** Mensaje para compartir un caso de persona buscada. */
export function shareMissingMessage(p: MissingPerson, url: string): string {
  return [
    `🔎 SE BUSCA: ${p.full_name}`,
    p.age ? `Edad: ${p.age}` : "",
    `Visto por última vez en: ${p.last_seen_zone}`,
    `Si tienes información, repórtala aquí:`,
    url,
    "",
    "Vía Vzla Info",
  ]
    .filter(Boolean)
    .join("\n");
}

/** Fecha legible en español. */
export function formatDate(iso: string | null): string {
  if (!iso) return "Fecha no indicada";
  const d = new Date(iso);
  return d.toLocaleDateString("es-VE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Genera un folio legible tipo VU-3F9A2 (solo presentación cuando no hay DB). */
export function makeFolio(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return "VU-" + hash.toString(36).toUpperCase().slice(0, 5).padStart(5, "0");
}

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
