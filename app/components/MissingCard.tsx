import Link from "next/link";
import { MissingPerson } from "@/lib/types";

/** Placard "se busca": foto, nombre, última zona y folio. */
export function MissingCard({ person }: { person: MissingPerson }) {
  return (
    <Link
      href={`/busco/${person.id}`}
      className="card group flex gap-4 p-3.5 transition-transform duration-150 hover:-translate-y-0.5"
    >
      <div
        className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg"
        style={{ background: "var(--color-paper-sunk)" }}
      >
        {person.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={person.photo_url}
            alt={`Foto de ${person.full_name}`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-2xl text-[var(--color-ink-faint)]" aria-hidden="true">
            👤
          </span>
        )}
        <span
          aria-hidden="true"
          className="absolute left-0 top-0 px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide"
          style={{ background: "var(--color-busco)", color: "#fff" }}
        >
          Se busca
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate text-lg font-extrabold leading-tight">
            {person.full_name}
          </h3>
          {person.age != null && (
            <span className="shrink-0 text-sm text-[var(--color-ink-soft)]">
              {person.age} años
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
          <span className="font-semibold text-[var(--color-ink)]">Última vez:</span>{" "}
          {person.last_seen_zone}
        </p>
        {person.description && (
          <p className="mt-1 line-clamp-2 text-sm text-[var(--color-ink-soft)]">
            {person.description}
          </p>
        )}
        <p className="folio mt-2">{person.folio}</p>
      </div>
    </Link>
  );
}
