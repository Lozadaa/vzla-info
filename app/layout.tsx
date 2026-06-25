import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { ServiceWorker } from "./components/ServiceWorker";
import { EmergencyBar } from "./components/EmergencyBar";
import "./globals.css";

const display = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const body = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
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
  title: {
    default: "Vzla Info — Reportar tu estado, buscar familiares y ubicar ayuda",
    template: "%s · Vzla Info",
  },
  description:
    "Herramienta comunitaria de respuesta a emergencias: reporta tu estado, busca a un familiar, aporta información y ubica ayuda cercana. Verificado por moderadores.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Vzla Info",
  },
  openGraph: {
    title: "Vzla Info",
    description:
      "Respuesta ciudadana ante emergencias: reportar tu estado, buscar a un familiar, aportar información y ubicar ayuda.",
    type: "website",
    locale: "es_VE",
  },
};

export const viewport: Viewport = {
  themeColor: "#1b2a3a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <a href="#contenido" className="skip-link">
          Saltar al contenido
        </a>
        <EmergencyBar />
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
