import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Vzla Info",
    short_name: "Vzla Info",
    description:
      "Respuesta a emergencias: reportar tu estado, buscar a un familiar, aportar información y ubicar ayuda.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0b2c54",
    lang: "es",
    orientation: "portrait",
    categories: ["social", "utilities", "health"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon-maskable.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
