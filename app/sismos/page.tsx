import type { Metadata } from "next";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { PageIntro } from "../components/PageIntro";
import { Activity } from "../components/icons";
import { getQuakeSummary, magStyle, fmtMag, fmtDepth, fmtWhen } from "@/lib/sismos";
import { SismosLive } from "./SismosLive";

export const metadata: Metadata = {
  title: "Actividad sísmica y réplicas",
  description:
    "Réplicas e historial de sismos en Venezuela tras el terremoto, con datos oficiales del USGS. Magnitud, profundidad, hora y ubicación, en vivo.",
};

const DAYS = 7;
const MINMAG = 2.5;

export default async function Page() {
  const summary = await getQuakeSummary({ days: DAYS, minmag: MINMAG });
  const main = summary.strongest;

  return (
    <>
      <SiteHeader back={{ href: "/", label: "Inicio" }} />
      <main id="contenido">
        <PageIntro
          eyebrow="Monitoreo · Actividad sísmica"
          title="Réplicas e historial"
          lead="Sismos registrados en Venezuela tras el terremoto del 24 de junio de 2026. Se actualiza automáticamente con datos oficiales del USGS."
          accent="var(--color-azul)"
        />

        {/* Evento principal */}
        {main && (
          <section className="shell" aria-label="Evento principal">
            <div
              className="card flex items-center gap-4 p-4"
              style={{ borderLeft: `6px solid ${magStyle(main.mag).accent}` }}
            >
              <span
                className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-lg leading-none"
                style={{ background: magStyle(main.mag).soft, color: magStyle(main.mag).accent }}
                aria-hidden="true"
              >
                <span className="text-2xl font-extrabold tabular-nums">{fmtMag(main.mag)}</span>
                <span className="text-[0.6rem] font-semibold uppercase tracking-wide">Mag</span>
              </span>
              <div className="min-w-0">
                <p className="eyebrow" style={{ color: "var(--color-azul)" }}>
                  Sismo de mayor magnitud · últimos {DAYS} días
                </p>
                <p className="mt-0.5 text-lg font-bold leading-tight">{main.place}</p>
                <p className="mt-0.5 text-sm text-[var(--color-ink-soft)] tabular-nums">
                  {fmtWhen(main.time)} · Profundidad {fmtDepth(main.depthKm)}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Lista en vivo + filtros */}
        <SismosLive initial={summary} initialDays={DAYS} initialMinmag={MINMAG} />

        {/* Fuente y aclaratoria */}
        <section className="shell mb-10">
          <div className="card p-4 text-sm text-[var(--color-ink-soft)]">
            <p className="flex items-center gap-2 font-semibold text-[var(--color-ink)]">
              <Activity size={18} aria-hidden="true" style={{ color: "var(--color-azul)" }} />
              Sobre estos datos
            </p>
            <p className="mt-2">
              Fuente:{" "}
              <a
                href="https://earthquake.usgs.gov/earthquakes/map/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline underline-offset-2"
              >
                USGS — Servicio Geológico de EE. UU.
              </a>{" "}
              (red mundial). La autoridad sísmica oficial de Venezuela es{" "}
              <a
                href="http://www.funvisis.gob.ve/recientes.php"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline underline-offset-2"
              >
                FUNVISIS
              </a>
              , que puede registrar réplicas menores no incluidas aquí. Las horas
              se muestran en hora de Venezuela. Esta página es informativa y no
              sustituye a los organismos oficiales de emergencia.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
