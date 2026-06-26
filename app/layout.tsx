import type { Metadata, Viewport } from "next";
import { Public_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

// Public Sans — la tipografía del US Web Design System: neutra, legible bajo
// presión y oficial. Una sola familia (display + cuerpo) para minimizar el
// payload de fuentes; mono solo para folios/identificadores.
const sans = Public_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://vzla.info"),
  title: "Vzla Info — Gracias. La comunidad sigue unida.",
  description:
    "Creamos esta página tras el terremoto en Venezuela. Hoy la comunidad organiza la data en plataformas dedicadas. Te dirigimos a ellas.",
  openGraph: {
    title: "Vzla Info — Gracias. La comunidad sigue unida.",
    description:
      "Creamos esta página tras el terremoto en Venezuela. Hoy la comunidad organiza la data en plataformas dedicadas. Te dirigimos a ellas.",
    type: "website",
    locale: "es_VE",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b2c54",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${sans.variable} ${mono.variable}`}>
      {/* suppressHydrationWarning: algunas extensiones de navegador (p. ej.
          ColorZilla → cz-shortcut-listen) inyectan atributos en <body> antes de
          que React hidrate, lo que dispara un falso aviso de hidratación. */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
