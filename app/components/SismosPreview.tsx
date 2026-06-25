import Link from "next/link";
import { getQuakeSummary, magStyle, fmtMag, fmtDepth, relTime } from "@/lib/sismos";
import { Activity, MapPin } from "./icons";

// Banner de actividad sísmica en el inicio: última réplica destacada + tira de
// los sismos más recientes (USGS). Mobile-first; toda la cabecera lleva a /sismos.
export async function SismosPreview() {
  const { quakes, latest, last24h, count } = await getQuakeSummary({ days: 7, minmag: 2.5 });
  const recent = quakes.slice(0, 10);

  return (
    <section className="shell mb-4" aria-label="Actividad sísmica">
      <div
        className="card overflow-hidden"
        style={{ borderLeft: "4px solid var(--color-azul)" }}
      >
        {/* Cabecera (clic → /sismos) */}
        <Link
          href="/sismos"
          className="flex items-center gap-4 p-4 hover:bg-[var(--color-paper-sunk)]"
        >
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md"
            style={{ background: "var(--color-info-soft)", color: "var(--color-azul)" }}
            aria-hidden="true"
          >
            <Activity size={22} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-lg">Actividad sísmica y réplicas</span>
              <span className="tag" style={{ background: "var(--color-azul)", color: "#fff" }}>
                En vivo
              </span>
            </span>
            <span className="block text-sm text-[var(--color-ink-soft)]">
              Réplicas e historial del terremoto, con datos oficiales del USGS.
              Se actualiza solo.
            </span>
            <span
              className="tap-hint mt-1.5 flex sm:hidden"
              style={{ color: "var(--color-azul)" }}
            >
              Toca para ver los sismos
            </span>
          </span>
          <span
            className="hidden sm:inline shrink-0 text-sm font-semibold"
            style={{ color: "var(--color-azul)" }}
          >
            Ver todo →
          </span>
        </Link>

        {quakes.length === 0 ? (
          <p className="border-t border-[var(--color-line)] p-4 text-sm text-[var(--color-ink-soft)]">
            No pudimos cargar los datos sísmicos en este momento. Intenta de nuevo
            en unos minutos o consulta directamente a{" "}
            <a
              href="http://www.funvisis.gob.ve/recientes.php"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline underline-offset-2"
            >
              FUNVISIS
            </a>
            .
          </p>
        ) : (
          <>
            {/* Resumen — última réplica + conteos */}
            {latest && (
              <div className="grid gap-3 border-t border-[var(--color-line)] p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="flex items-center gap-3 min-w-0">
                  <MagBadge mag={latest.mag} />
                  <div className="min-w-0">
                    <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-[var(--color-ink-faint)]">
                      Última réplica · {relTime(latest.time)}
                    </p>
                    <p className="truncate text-[0.95rem] font-semibold leading-tight">
                      {latest.place}
                    </p>
                    <p className="text-[0.78rem] text-[var(--color-ink-soft)]">
                      Profundidad {fmtDepth(latest.depthKm)}
                    </p>
                  </div>
                </div>
                <dl className="flex shrink-0 gap-5 sm:gap-6">
                  <div>
                    <dt className="folio">Últimas 24 h</dt>
                    <dd className="text-xl font-extrabold tabular-nums">{last24h}</dd>
                  </div>
                  <div>
                    <dt className="folio">Últimos 7 días</dt>
                    <dd className="text-xl font-extrabold tabular-nums">{count}</dd>
                  </div>
                </dl>
              </div>
            )}

            {/* Tira de sismos recientes */}
            <div className="flex gap-3 overflow-x-auto border-t border-[var(--color-line)] p-3">
              {recent.map((k) => {
                const s = magStyle(k.mag);
                return (
                  <Link
                    key={k.id}
                    href="/sismos"
                    className="flex w-44 shrink-0 flex-col gap-1.5 overflow-hidden rounded-md border border-[var(--color-line)] p-2.5 transition-shadow hover:shadow-[var(--shadow-raise)]"
                    style={{ borderLeft: `3px solid ${s.accent}` }}
                    aria-label={`Sismo magnitud ${fmtMag(k.mag)} ${k.place} ${relTime(k.time)}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="rounded px-1.5 py-0.5 text-[0.95rem] font-extrabold tabular-nums leading-none"
                        style={{ background: s.soft, color: s.accent }}
                      >
                        {fmtMag(k.mag)}
                      </span>
                      <span className="text-[0.66rem] text-[var(--color-ink-faint)]">
                        {relTime(k.time)}
                      </span>
                    </div>
                    <p className="line-clamp-2 text-[0.78rem] font-semibold leading-snug">
                      {k.place}
                    </p>
                    <p className="flex items-center gap-1 text-[0.66rem] text-[var(--color-ink-soft)]">
                      <MapPin size={12} aria-hidden="true" className="shrink-0" />
                      <span>Prof. {fmtDepth(k.depthKm)}</span>
                    </p>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function MagBadge({ mag }: { mag: number | null }) {
  const s = magStyle(mag);
  return (
    <span
      className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg leading-none"
      style={{ background: s.soft, color: s.accent }}
      aria-hidden="true"
    >
      <span className="text-[1.35rem] font-extrabold tabular-nums">{fmtMag(mag)}</span>
      <span className="text-[0.6rem] font-semibold uppercase tracking-wide">Mag</span>
    </span>
  );
}
