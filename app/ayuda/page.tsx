import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { PageIntro } from "../components/PageIntro";
import { Plus } from "../components/icons";
import { HelpExplorer } from "./HelpExplorer";
import { getHelpListings } from "@/lib/data";

export const metadata: Metadata = {
  title: "Necesito / ofrezco ayuda",
  description: "Ubica o publica refugio, comida, atención médica y más, en el mapa.",
};

export default async function Page() {
  const listings = await getHelpListings();

  return (
    <>
      <SiteHeader back={{ href: "/", label: "Inicio" }} />
      <main id="contenido">
        <PageIntro
          eyebrow="04 · Necesito / ofrezco ayuda"
          title="Mapa de ayuda"
          lead="Encuentra o publica refugio, comida, atención médica, transporte y más, cerca de ti."
          accent="var(--color-ayuda)"
        />
        <div className="shell pb-12 flex flex-col gap-5">
          <Link
            href="/ayuda/nuevo"
            className="card flex items-center gap-4 p-4 transition-transform hover:-translate-y-0.5"
            style={{ borderLeft: "6px solid var(--color-ayuda)" }}
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ background: "var(--color-ayuda-soft)", color: "var(--color-ayuda)" }} aria-hidden="true">
              <Plus size={22} />
            </span>
            <span>
              <span className="block font-extrabold text-lg">Publicar ayuda</span>
              <span className="text-sm text-[var(--color-ink-soft)]">
                Indica si necesitas u ofreces algo, y en qué zona.
              </span>
            </span>
          </Link>

          <HelpExplorer listings={listings} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
