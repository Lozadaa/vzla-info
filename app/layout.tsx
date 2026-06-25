import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Public_Sans, IBM_Plex_Mono } from "next/font/google";
import { ServiceWorker } from "./components/ServiceWorker";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Public_Sans({
  subsets: ["latin"],
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
  metadataBase: new URL("https://venezuelaunida.com"),
  title: {
    default: "Venezuela Unida — Reportarse, buscar familiares y encontrar ayuda",
    template: "%s · Venezuela Unida",
  },
  description:
    "Plataforma humanitaria para reportarte a salvo, buscar a un familiar, aportar información verificada y ubicar ayuda cercana. Rápida, accesible y con WhatsApp.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Venezuela Unida",
  },
  openGraph: {
    title: "Venezuela Unida",
    description:
      "Reportarte a salvo, buscar a un familiar, aportar información y encontrar ayuda cercana.",
    type: "website",
    locale: "es_VE",
  },
};

export const viewport: Viewport = {
  themeColor: "#173e73",
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
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
