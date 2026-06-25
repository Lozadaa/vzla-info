// Datos de demostración: se usan SOLO cuando Supabase no está configurado,
// para poder recorrer y evaluar el diseño sin backend.
import type { HelpListing, MissingPerson } from "./types";

// Sin desaparecidos de ejemplo: las personas buscadas son siempre reales.
export const DEMO_MISSING: MissingPerson[] = [];

export const DEMO_HELP: HelpListing[] = [
  {
    id: "demo-h1",
    folio: "VU-AY1X2",
    kind: "offer",
    category: "refugio",
    title: "2 cupos para dormir, familia tranquila",
    description: "Tenemos espacio para 2 personas por unos días. Zona segura.",
    zone: "San Cristóbal, Táchira",
    lat: 7.7669,
    lng: -72.225,
    contact_whatsapp: "+584160000000",
    status: "approved",
    created_at: "2026-06-24T09:00:00Z",
  },
  {
    id: "demo-h2",
    folio: "VU-AY7B8",
    kind: "need",
    category: "medico",
    title: "Necesito insulina (refrigerada)",
    description: "Para adulto mayor diabético. Cualquier ayuda se agradece.",
    zone: "Maracaibo, Zulia",
    lat: 10.6545,
    lng: -71.6406,
    contact_whatsapp: "+584240000000",
    status: "approved",
    created_at: "2026-06-24T12:00:00Z",
  },
  {
    id: "demo-h3",
    folio: "VU-AY3C5",
    kind: "offer",
    category: "comida",
    title: "Olla solidaria, almuerzo gratis",
    description: "Repartimos almuerzo de 12 a 2 pm mientras alcance.",
    zone: "Barquisimeto, Lara",
    lat: 10.0647,
    lng: -69.3301,
    contact_whatsapp: null,
    status: "approved",
    created_at: "2026-06-25T08:00:00Z",
  },
];
