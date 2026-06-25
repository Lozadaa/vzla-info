import type { Metadata } from "next";
import { SiteHeader } from "../../components/SiteHeader";
import { SiteFooter } from "../../components/SiteFooter";
import { PageIntro } from "../../components/PageIntro";
import { HelpForm } from "./HelpForm";

export const metadata: Metadata = {
  title: "Publicar ayuda",
  description: "Indica si necesitas u ofreces ayuda y en qué zona.",
};

export default function Page() {
  return (
    <>
      <SiteHeader back={{ href: "/ayuda", label: "Mapa" }} />
      <main id="contenido">
        <PageIntro
          eyebrow="04 · Necesito / ofrezco ayuda"
          title="Publicar ayuda"
          lead="Tu publicación entra a revisión y luego aparece en el mapa para la comunidad."
          accent="var(--color-ayuda)"
        />
        <div className="shell-narrow pb-12">
          <HelpForm />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
