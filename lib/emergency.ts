// Números de emergencia de Venezuela.
// Datos estáticos usados por el botón flotante de emergencias (EmergencyButton).
// Cada teléfono trae su versión "marcable" (tel) ya saneada para enlaces tel:.

export interface EmergencyPhone {
  /** texto mostrado (puede llevar guiones, letras, etc.) */
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
      { name: "CANTV (línea fija)", phones: [{ label: "171", tel: "171" }] },
      { name: "Digitel", phones: [{ label: "112", tel: "112" }] },
      { name: "Movilnet", phones: [{ label: "*1", tel: "*1" }] },
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
      {
        name: "Parque Central",
        phones: [
          { label: "0212-507-9137", tel: "02125079137" },
          { label: "0212-507-7150", tel: "02125077150" },
        ],
      },
      {
        name: "Plaza Venezuela",
        phones: [
          { label: "0212-793-0039", tel: "02127930039" },
          { label: "0212-793-6457", tel: "02127936457" },
        ],
      },
      {
        name: "San Bernardino",
        phones: [{ label: "0212-577-9209", tel: "02125779209" }],
      },
      {
        name: "San José",
        phones: [{ label: "0212-861-5213", tel: "02128615213" }],
      },
    ],
  },
  {
    emoji: "🏥",
    title: "Salud y rescate",
    contacts: [
      {
        name: "Cruz Roja Venezolana",
        phones: [
          { label: "0212-578-2516", tel: "02125782516" },
          { label: "0212-571-2411", tel: "02125712411" },
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
  "En cualquier emergencia, marca primero 911: es el número unificado y te conecta con el servicio que necesites. Los números 0212 son de Caracas; en otros estados hay líneas locales distintas.";
