// Números de emergencia de Venezuela (referencial para Caracas y la Gran
// Caracas, código 0212). Datos estáticos usados por el botón flotante de
// emergencias (EmergencyButton). Cada teléfono trae su versión "marcable" (tel)
// ya saneada para enlaces tel:.

export interface EmergencyPhone {
  /** texto mostrado (puede llevar puntos, paréntesis, letras, etc.) */
  label: string;
  /** número saneado para el enlace tel: (solo dígitos, +, *) */
  tel: string;
}

export interface EmergencyContact {
  name: string;
  phones: EmergencyPhone[];
  note?: string;
}

export interface EmergencyGroup {
  emoji: string;
  title: string;
  contacts: EmergencyContact[];
}

/** Número único, lo más importante: se destaca por encima de todo. */
export const EMERGENCY_PRIMARY = {
  label: "911",
  tel: "911",
  description:
    "Número nacional de emergencias. Integra policía, bomberos y ambulancias. Gratuito y funciona desde cualquier teléfono.",
};

export const EMERGENCY_GROUPS: EmergencyGroup[] = [
  {
    emoji: "📡",
    title: "Según tu operador",
    contacts: [
      { name: "CANTV (desde fijo)", phones: [{ label: "171", tel: "171" }] },
      { name: "Movilnet", phones: [{ label: "*1", tel: "*1" }] },
      { name: "Digitel", phones: [{ label: "112", tel: "112" }] },
      { name: "Movistar", phones: [{ label: "911", tel: "911" }] },
    ],
  },
  {
    emoji: "🚑",
    title: "Ambulancias",
    contacts: [
      {
        name: "Aeroambulancias",
        phones: [
          { label: "(0212) 993.25.41", tel: "02129932541" },
          { label: "(0212) 992.89.80", tel: "02129928980" },
          { label: "(0212) 992.89.90", tel: "02129928990" },
          { label: "(0212) 991.79.40", tel: "02129917940" },
        ],
      },
      {
        name: "Rescarven",
        phones: [
          { label: "(0212) 993.69.11", tel: "02129936911" },
          { label: "(0212) 993.69.91", tel: "02129936991" },
          { label: "(0212) 993.13.10", tel: "02129931310" },
          { label: "(0212) 993.33.67", tel: "02129933367" },
        ],
      },
      {
        name: "Servicio de Ambulancia Metropolitano",
        phones: [
          { label: "(0212) 545.45.45", tel: "02125454545" },
          { label: "(0212) 545.46.55", tel: "02125454655" },
          { label: "(0212) 577.92.09", tel: "02125779209" },
        ],
      },
    ],
  },
  {
    emoji: "👮",
    title: "Policía",
    contacts: [
      {
        name: "Policía Nacional Bolivariana (PNB)",
        phones: [{ label: "0800-765-4622", tel: "08007654622" }],
      },
      {
        name: "CICPC — investigación penal / denuncias",
        phones: [{ label: "0800-CICPC-00", tel: "08002427200" }],
        note: "0800-24272-00",
      },
    ],
  },
  {
    emoji: "🚒",
    title: "Bomberos (Caracas)",
    contacts: [
      { name: "Antímano", phones: [{ label: "(0212) 472.20.54", tel: "02124722054" }] },
      { name: "Catia la Mar", phones: [{ label: "(0212) 351.99.66", tel: "02123519966" }] },
      { name: "Chacao", phones: [{ label: "(0212) 265.32.61", tel: "02122653261" }] },
      {
        name: "del Este (Cafetal)",
        phones: [
          { label: "(0212) 987.43.34", tel: "02129874334" },
          { label: "(0212) 985.50.60", tel: "02129855060" },
        ],
      },
      { name: "Sucre", phones: [{ label: "(0212) 985.36.40", tel: "02129853640" }] },
      {
        name: "El Cafetal",
        phones: [
          { label: "(0212) 985.36.40", tel: "02129853640" },
          { label: "(0212) 985.29.77", tel: "02129852977" },
        ],
      },
      { name: "El Paraíso", phones: [{ label: "(0212) 481.09.61", tel: "02124810961" }] },
      {
        name: "El Valle",
        phones: [
          { label: "(0212) 672.01.75", tel: "02126720175" },
          { label: "(0212) 672.06.36", tel: "02126720636" },
        ],
      },
      {
        name: "La Guaira",
        phones: [
          { label: "(0212) 332.76.20", tel: "02123327620" },
          { label: "(0212) 331.04.45", tel: "02123310445" },
        ],
      },
      { name: "La Trinidad", phones: [{ label: "(0212) 943.43.61", tel: "02129434361" }] },
      { name: "La Urbina", phones: [{ label: "(0212) 241.66.41", tel: "02122416641" }] },
      { name: "Metropolitanos", phones: [{ label: "(0212) 545.45.45", tel: "02125454545" }] },
      { name: "Miranda", phones: [{ label: "(0212) 235.69.67", tel: "02122356967" }] },
      {
        name: "Parque Central",
        phones: [
          { label: "(0212) 507.91.37", tel: "02125079137" },
          { label: "(0212) 507.71.50", tel: "02125077150" },
        ],
      },
      {
        name: "Plaza Venezuela",
        phones: [
          { label: "(0212) 793.00.39", tel: "02127930039" },
          { label: "(0212) 793.64.57", tel: "02127936457" },
        ],
      },
      { name: "San Bernardino", phones: [{ label: "(0212) 577.92.09", tel: "02125779209" }] },
      { name: "San José", phones: [{ label: "(0212) 861.52.13", tel: "02128615213" }] },
    ],
  },
  {
    emoji: "🏥",
    title: "Salud y rescate",
    contacts: [
      {
        name: "Cruz Roja Venezolana",
        phones: [
          { label: "(0212) 578.25.16", tel: "02125782516" },
          { label: "(0212) 571.24.11", tel: "02125712411" },
        ],
      },
      {
        name: "Protección Civil",
        phones: [
          { label: "0800-558-8427", tel: "08005588427" },
          { label: "0800-266-8446", tel: "08002668446" },
        ],
      },
    ],
  },
];

export const EMERGENCY_TIP =
  "En cualquier emergencia, marca primero 911: es el número unificado y te conecta con el servicio que necesites. Los números 0212 son referenciales de Caracas y la Gran Caracas; en otros estados hay líneas locales distintas.";
