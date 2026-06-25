// Tipos y constantes compartidas de Venezuela Unida

export type ReportStatus = "pending" | "approved" | "rejected";

export type HelpKind = "need" | "offer"; // necesito / ofrezco

export type ActionKey = "estoy-a-salvo" | "busco" | "tengo-informacion" | "ayuda";

export interface ActionMeta {
  key: ActionKey;
  href: string;
  title: string;
  description: string;
  /** color de marca de la acción (variable CSS) */
  accent: string;
  accentSoft: string;
  /** índice mostrado como folio estructural */
  index: string;
}

// Las 4 acciones — el color codifica la categoría, no decora.
export const ACTIONS: ActionMeta[] = [
  {
    key: "estoy-a-salvo",
    href: "/estoy-a-salvo",
    title: "Estoy a salvo",
    description: "Avisa a tu gente que estás bien y en qué zona te encuentras.",
    accent: "var(--color-salvo)",
    accentSoft: "var(--color-salvo-soft)",
    index: "01",
  },
  {
    key: "busco",
    href: "/busco",
    title: "Busco a alguien",
    description: "Reporta a un familiar desaparecido o revisa los reportes activos.",
    accent: "var(--color-busco)",
    accentSoft: "var(--color-busco-soft)",
    index: "02",
  },
  {
    key: "tengo-informacion",
    href: "/tengo-informacion",
    title: "Tengo información de alguien",
    description: "Aporta un dato o avistamiento sobre una persona buscada.",
    accent: "var(--color-info)",
    accentSoft: "var(--color-info-soft)",
    index: "03",
  },
  {
    key: "ayuda",
    href: "/ayuda",
    title: "Necesito / ofrezco ayuda",
    description: "Ubica o publica refugio, comida, atención médica y más, en el mapa.",
    accent: "var(--color-ayuda)",
    accentSoft: "var(--color-ayuda-soft)",
    index: "04",
  },
];

// Categorías de ayuda — abiertas y extensibles.
export interface HelpCategory {
  slug: string;
  label: string;
  emoji: string;
}

export const HELP_CATEGORIES: HelpCategory[] = [
  { slug: "refugio", label: "Refugio / alojamiento", emoji: "🏠" },
  { slug: "comida", label: "Comida y agua", emoji: "🍲" },
  { slug: "medico", label: "Médico / medicinas", emoji: "➕" },
  { slug: "transporte", label: "Transporte", emoji: "🚐" },
  { slug: "legal", label: "Ayuda legal", emoji: "⚖️" },
  { slug: "psicologico", label: "Apoyo psicológico", emoji: "💬" },
  { slug: "ropa", label: "Ropa y abrigo", emoji: "🧥" },
  { slug: "otros", label: "Otros", emoji: "✨" },
];

export function categoryLabel(slug: string): string {
  return HELP_CATEGORIES.find((c) => c.slug === slug)?.label ?? "Otros";
}

export function categoryEmoji(slug: string): string {
  return HELP_CATEGORIES.find((c) => c.slug === slug)?.emoji ?? "✨";
}

// ---- Filas de base de datos ----

export interface SafeReport {
  id: string;
  folio: string;
  full_name: string;
  zone: string;
  message: string | null;
  contact_whatsapp: string | null;
  status: ReportStatus;
  created_at: string;
}

export interface MissingPerson {
  id: string;
  folio: string;
  full_name: string;
  age: number | null;
  photo_url: string | null;
  last_seen_zone: string;
  last_seen_at: string | null;
  description: string | null;
  reporter_relation: string | null;
  contact_whatsapp: string | null;
  status: ReportStatus;
  found: boolean;
  created_at: string;
}

export interface Tip {
  id: string;
  missing_person_id: string | null;
  person_name: string | null;
  info: string;
  zone: string | null;
  contact_whatsapp: string | null;
  status: ReportStatus;
  created_at: string;
}

export interface HelpListing {
  id: string;
  folio: string;
  kind: HelpKind;
  category: string;
  title: string;
  description: string | null;
  zone: string;
  lat: number | null;
  lng: number | null;
  contact_whatsapp: string | null;
  status: ReportStatus;
  created_at: string;
}

export interface ModificationRequest {
  id: string;
  target_table: string;
  target_id: string;
  requested_full_name: string | null;
  requested_photo_url: string | null;
  requested_zone: string | null;
  note: string | null;
  status: ReportStatus;
  created_at: string;
}
