import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "../../components/SiteHeader";
import { SiteFooter } from "../../components/SiteFooter";
import { MissingActions } from "./MissingActions";
import { ModificationRequest } from "./ModificationRequest";
import { getMissingPerson } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const person = await getMissingPerson(id);
  if (!person) return { title: "Caso no encontrado" };
  return {
    title: `Se busca: ${person.full_name}`,
    description: `Visto por última vez en ${person.last_seen_zone}. Si tienes información, repórtala.`,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const person = await getMissingPerson(id);
  if (!person) notFound();

  return (
    <>
      <SiteHeader back={{ href: "/busco", label: "Buscar" }} />
      <main id="contenido" className="shell-narrow pb-12 pt-6">
        <p className="eyebrow" style={{ color: "var(--color-busco)" }}>
          Se busca · {person.folio}
        </p>

        <div className="mt-4 card overflow-hidden">
          <div className="flex flex-col sm:flex-row">
            <div
              className="relative h-64 w-full sm:h-auto sm:w-48 shrink-0"
              style={{ background: "var(--color-paper-sunk)" }}
            >
              {person.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={person.photo_url} alt={`Foto de ${person.full_name}`} className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-5xl text-[var(--color-ink-faint)]" aria-hidden="true">
                  👤
                </span>
              )}
            </div>

            <div className="p-5 sm:p-6">
              <h1 className="text-[2rem] font-extrabold leading-tight">{person.full_name}</h1>
              <dl className="mt-3 grid gap-2 text-[0.98rem]">
                {person.age != null && (
                  <div className="flex gap-2">
                    <dt className="font-semibold w-28 shrink-0">Edad</dt>
                    <dd className="text-[var(--color-ink-soft)]">{person.age} años</dd>
                  </div>
                )}
                <div className="flex gap-2">
                  <dt className="font-semibold w-28 shrink-0">Última vez</dt>
                  <dd className="text-[var(--color-ink-soft)]">{person.last_seen_zone}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="font-semibold w-28 shrink-0">Fecha</dt>
                  <dd className="text-[var(--color-ink-soft)]">{formatDate(person.last_seen_at)}</dd>
                </div>
                {person.reporter_relation && (
                  <div className="flex gap-2">
                    <dt className="font-semibold w-28 shrink-0">Reporta</dt>
                    <dd className="text-[var(--color-ink-soft)]">{person.reporter_relation}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {person.description && (
            <div className="border-t px-5 sm:px-6 py-4" style={{ borderColor: "var(--color-line)" }}>
              <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--color-ink-soft)]">Descripción y señas</h2>
              <p className="mt-1.5">{person.description}</p>
            </div>
          )}
        </div>

        <div className="mt-5">
          <MissingActions person={person} />
        </div>

        <div className="mt-6">
          <ModificationRequest personId={person.id} />
        </div>

        <p className="mt-8 text-center text-sm text-[var(--color-ink-soft)]">
          ¿Buscas a otra persona?{" "}
          <Link href="/busco" className="font-semibold underline underline-offset-4">
            Ver toda la lista
          </Link>
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
