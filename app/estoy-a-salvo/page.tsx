import type { Metadata } from "next";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { PageIntro } from "../components/PageIntro";
import { Notice } from "../components/Notice";
import { SafeForm } from "./SafeForm";

export const metadata: Metadata = {
  title: "Estoy a salvo",
  description: "Avisa a tu gente que estás bien y en qué zona te encuentras.",
};

export default function Page() {
  return (
    <>
      <SiteHeader back={{ href: "/", label: "Inicio" }} />
      <main id="contenido">
        <PageIntro
          eyebrow="01 · Estoy a salvo"
          title="Avisa que estás bien"
          lead="Un mensaje corto para que tu familia sepa que estás a salvo y en qué zona."
          accent="var(--color-salvo)"
        />
        <div className="shell-narrow pb-10 flex flex-col gap-5">
          <Notice tone="info">
            Lo que envíes se revisa antes de publicarse. Comparte solo lo necesario;
            evita direcciones exactas u otros datos sensibles.
          </Notice>
          <SafeForm />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
