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
    description: "Confirma que estás bien y en qué zona, para que tu familia lo sepa.",
    accent: "var(--color-salvo)",
    accentSoft: "var(--color-salvo-soft)",
    index: "01",
  },
  {
    key: "busco",
    href: "/busco",
    title: "Busco a alguien",
    description: "Reporta a un familiar con quien perdiste contacto o revisa los reportes.",
    accent: "var(--color-busco)",
    accentSoft: "var(--color-busco-soft)",
    index: "02",
  },
  {
    key: "tengo-informacion",
    href: "/tengo-informacion",
    title: "Tengo información",
    description: "Aporta un dato o avistamiento sobre una persona reportada.",
    accent: "var(--color-info)",
    accentSoft: "var(--color-info-soft)",
    index: "03",
  },
  {
    key: "ayuda",
    href: "/ayuda",
    title: "Necesito / ofrezco ayuda",
    description: "Pide o señala refugio, agua, atención médica y más en el mapa.",
    accent: "var(--color-ayuda)",
    accentSoft: "var(--color-ayuda-soft)",
    index: "04",
  },
];

// Categorías de ayuda — abiertas y extensibles. El ícono se resuelve por
// slug en <CategoryIcon> (SVG), no se guarda emoji.
export interface HelpCategory {
  slug: string;
  label: string;
}

export const HELP_CATEGORIES: HelpCategory[] = [
  { slug: "refugio", label: "Refugio / alojamiento" },
  { slug: "comida", label: "Comida y agua" },
  { slug: "medico", label: "Médico / medicinas" },
  { slug: "transporte", label: "Transporte" },
  { slug: "legal", label: "Ayuda legal" },
  { slug: "psicologico", label: "Apoyo psicológico" },
  { slug: "ropa", label: "Ropa y abrigo" },
  { slug: "otros", label: "Otros" },
];

export function categoryLabel(slug: string): string {
  return HELP_CATEGORIES.find((c) => c.slug === slug)?.label ?? "Otros";
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
