import type { Metadata } from "next";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { PageIntro } from "../components/PageIntro";
import { TipForm } from "./TipForm";
import { getMissingPerson } from "@/lib/data";

export const metadata: Metadata = {
  title: "Tengo información de alguien",
  description: "Aporta un dato o avistamiento sobre una persona buscada.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ caso?: string }>;
}) {
  const { caso } = await searchParams;
  const person = caso ? await getMissingPerson(caso) : null;

  return (
    <>
      <SiteHeader back={{ href: caso ? `/busco/${caso}` : "/", label: "Volver" }} />
      <main id="contenido">
        <PageIntro
          eyebrow="03 · Tengo información"
          title="Aporta un dato"
          lead="Un avistamiento o una pista puede ser la diferencia. Lo que envíes se revisa antes de compartirse con la familia."
          accent="var(--color-info)"
        />
        <div className="shell-narrow pb-12">
          <TipForm caso={caso ?? null} personName={person?.full_name ?? null} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
