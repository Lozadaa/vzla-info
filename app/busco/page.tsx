import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { PageIntro } from "../components/PageIntro";
import { MissingList } from "./MissingList";
import { getMissingPersons } from "@/lib/data";

export const metadata: Metadata = {
  title: "Busco a alguien",
  description: "Reporta a un familiar desaparecido o revisa los reportes activos.",
};

export default async function Page() {
  const persons = await getMissingPersons();

  return (
    <>
      <SiteHeader back={{ href: "/", label: "Inicio" }} />
      <main id="contenido">
        <PageIntro
          eyebrow="02 · Busco a alguien"
          title="Personas buscadas"
          lead="Revisa los reportes activos o crea uno nuevo. Comparte por WhatsApp para multiplicar el alcance."
          accent="var(--color-busco)"
        />

        <div className="shell pb-12 flex flex-col gap-5">
          <Link
            href="/busco/nuevo"
            className="card flex items-center gap-4 p-4 transition-transform hover:-translate-y-0.5"
            style={{ borderLeft: "6px solid var(--color-busco)" }}
          >
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl font-bold"
              style={{ background: "var(--color-busco-soft)", color: "var(--color-busco)" }}
              aria-hidden="true"
            >
              +
            </span>
            <span>
              <span className="block font-extrabold text-lg">Reportar a una persona</span>
              <span className="text-sm text-[var(--color-ink-soft)]">
                Publica una ficha con foto y última zona donde fue vista.
              </span>
            </span>
          </Link>

          <MissingList persons={persons} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
