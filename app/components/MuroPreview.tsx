import Link from "next/link";
import { getMuroPosts } from "@/lib/data";
import { muroCategoryMeta } from "@/lib/types";
import { AlertTriangle } from "./icons";

// Banner del Muro en el inicio + tira de miniaturas (preview) de los últimos
// reportes aprobados, para que la gente vea un adelanto y entre.
export async function MuroPreview() {
  const posts = await getMuroPosts();
  const latest = posts.slice(0, 8);

  return (
    <section className="shell mb-4">
      <div
        className="card overflow-hidden"
        style={{ borderLeft: "4px solid var(--color-alert)" }}
      >
        {/* Cabecera (clic → /muro) */}
        <Link
          href="/muro"
          className="flex items-center gap-4 p-4 hover:bg-[var(--color-paper-sunk)]"
        >
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md"
            style={{ background: "var(--color-alert-soft)", color: "var(--color-alert)" }}
            aria-hidden="true"
          >
            <AlertTriangle size={22} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2">
              <span className="font-semibold text-lg">Muro de emergencia</span>
              <span
                className="tag"
                style={{ background: "var(--color-alert)", color: "#fff" }}
              >
                En vivo
              </span>
            </span>
            <span className="block text-sm text-[var(--color-ink-soft)]">
              Reportes recopilados de redes sobre personas desaparecidas y
              necesidades urgentes, revisados por moderadores.
            </span>
            <span
              className="tap-hint mt-1.5 flex sm:hidden"
              style={{ color: "var(--color-alert)" }}
            >
              Toca para abrir el muro
            </span>
          </span>
          <span
            className="hidden sm:inline shrink-0 text-sm font-semibold"
            style={{ color: "var(--color-alert)" }}
          >
            Ver todo →
          </span>
        </Link>

        {/* Tira de miniaturas */}
        {latest.length > 0 && (
          <div className="flex gap-3 overflow-x-auto border-t border-[var(--color-line)] p-3">
            {latest.map((p) => {
              const cat = muroCategoryMeta(p.category);
              return (
                <Link
                  key={p.id}
                  href="/muro"
                  className="w-40 shrink-0 overflow-hidden rounded-md border border-[var(--color-line)] transition-shadow hover:shadow-[var(--shadow-raise)]"
                  style={{ borderLeft: `3px solid ${cat.accent}` }}
                  aria-label={`${cat.triage}: ${p.text.slice(0, 60)}`}
                >
                  {p.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.image_url}
                      alt=""
                      loading="lazy"
                      className="h-24 w-full object-cover object-top"
                    />
                  ) : (
                    <div
                      className="h-24 overflow-hidden p-2"
                      style={{ background: "var(--color-paper)" }}
                    >
                      <p className="line-clamp-4 text-[0.72rem] leading-snug text-[var(--color-ink-soft)]">
                        {p.text}
                      </p>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 px-2 py-1.5">
                    <span
                      className="inline-block h-2 w-2 shrink-0 rounded-full"
                      style={{ background: cat.accent }}
                      aria-hidden="true"
                    />
                    <span className="truncate text-[0.68rem] font-semibold uppercase tracking-wide">
                      {cat.triage}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
