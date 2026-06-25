import type { Metadata } from "next";
import { SiteHeader } from "../../components/SiteHeader";
import { SiteFooter } from "../../components/SiteFooter";
import { PageIntro } from "../../components/PageIntro";
import { Notice } from "../../components/Notice";
import { MissingForm } from "./MissingForm";

export const metadata: Metadata = {
  title: "Reportar a una persona buscada",
  description: "Publica una ficha con foto y la última zona donde fue vista.",
};

export default function Page() {
  return (
    <>
      <SiteHeader back={{ href: "/busco", label: "Buscar" }} />
      <main id="contenido">
        <PageIntro
          eyebrow="02 · Busco a alguien"
          title="Reportar a una persona"
          lead="Completa lo que sepas. Mientras más datos, más fácil será reconocerla."
          accent="var(--color-busco)"
        />
        <div className="shell-narrow pb-12 flex flex-col gap-5">
          <Notice tone="warn">
            Publica solo información de la que tengas certeza. El reporte será
            revisado por un moderador antes de hacerse público.
          </Notice>
          <MissingForm />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
