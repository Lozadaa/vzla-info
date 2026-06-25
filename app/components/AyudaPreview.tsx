import Link from "next/link";
import { getHelpListings } from "@/lib/data";
import { categoryLabel } from "@/lib/types";
import { LifeBuoy, CategoryIcon, MapPin } from "./icons";

// Banner de Ayuda en el inicio + tira de miniaturas (preview) de los últimos
// listados aprobados (necesito / ofrezco), para que se vea un adelanto del mapa.
export async function AyudaPreview() {
  const listings = await getHelpListings();
  const latest = listings.slice(0, 8);

  return (
    <section className="shell mb-4">
      <div
        className="card overflow-hidden"
        style={{ borderLeft: "4px solid var(--color-ayuda)" }}
      >
        {/* Cabecera (clic → /ayuda) */}
        <Link
          href="/ayuda"
          className="flex items-center gap-4 p-4 hover:bg-[var(--color-paper-sunk)]"
        >
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md"
            style={{ background: "var(--color-ayuda-soft)", color: "var(--color-ayuda)" }}
            aria-hidden="true"
          >
            <LifeBuoy size={22} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2">
              <span className="font-semibold text-lg">Necesito / ofrezco ayuda</span>
              <span
                className="tag"
                style={{ background: "var(--color-ayuda)", color: "#fff" }}
              >
                Mapa
              </span>
            </span>
            <span className="block text-sm text-[var(--color-ink-soft)]">
              Refugio, comida, atención médica, transporte y más, publicados por
              la comunidad y revisados por moderadores.
            </span>
            <span
              className="tap-hint mt-1.5 flex sm:hidden"
              style={{ color: "var(--color-ayuda)" }}
            >
              Toca para abrir el mapa
            </span>
          </span>
          <span
            className="hidden sm:inline shrink-0 text-sm font-semibold"
            style={{ color: "var(--color-ayuda)" }}
          >
            Ver todo →
          </span>
        </Link>

        {/* Tira de miniaturas */}
        {latest.length > 0 && (
          <div className="flex gap-3 overflow-x-auto border-t border-[var(--color-line)] p-3">
            {latest.map((l) => {
              const accent =
                l.kind === "offer" ? "var(--color-salvo)" : "var(--color-ayuda)";
              return (
                <Link
                  key={l.id}
                  href="/ayuda"
                  className="flex w-52 shrink-0 flex-col gap-1.5 overflow-hidden rounded-md border border-[var(--color-line)] p-2.5 transition-shadow hover:shadow-[var(--shadow-raise)]"
                  style={{ borderLeft: `3px solid ${accent}` }}
                  aria-label={`${l.kind === "offer" ? "Ofrece" : "Necesita"}: ${l.title}`}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span
                      className="tag"
                      style={{ background: accent, color: "#fff" }}
                    >
                      {l.kind === "offer" ? "Ofrece" : "Necesita"}
                    </span>
                    <span
                      className="inline-flex items-center text-[var(--color-ink-faint)]"
                      aria-hidden="true"
                    >
                      <CategoryIcon slug={l.category} size={15} />
                    </span>
                  </div>
                  <p className="line-clamp-2 text-[0.8rem] font-semibold leading-snug">
                    {l.title}
                  </p>
                  <p className="flex items-center gap-1 text-[0.68rem] text-[var(--color-ink-soft)]">
                    <MapPin size={12} aria-hidden="true" className="shrink-0" />
                    <span className="truncate">{l.zone}</span>
                  </p>
                  <span className="text-[0.66rem] text-[var(--color-ink-faint)]">
                    {categoryLabel(l.category)}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
