import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { PageIntro } from "../components/PageIntro";
import { MapView } from "./MapView";
import { getSituationMap } from "@/lib/data";

export const metadata: Metadata = {
  title: "Mapa de situación",
  description:
    "Dónde se concentran las personas buscadas tras la emergencia, por localidad.",
};

export const dynamic = "force-dynamic";

const nf = new Intl.NumberFormat("es-VE");

export default async function Page() {
  const { clusters, located, unlocated, total } = await getSituationMap();
  const max = clusters[0]?.count ?? 1;

  return (
    <>
      <SiteHeader back={{ href: "/", label: "Inicio" }} />
      <main id="contenido">
        <PageIntro
          eyebrow="Mapa de situación"
          title="Dónde se busca a más personas"
          lead="Personas reportadas como buscadas, agrupadas por la última localidad donde fueron vistas. El tamaño del círculo refleja cuántas personas se buscan en cada zona."
          accent="var(--color-busco)"
        />

        <div className="shell pb-12 flex flex-col gap-5">
          {/* Cifras */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { n: total, label: "personas buscadas", color: "var(--color-busco)" },
              { n: located, label: "ubicadas en el mapa", color: "var(--color-ink)" },
              { n: clusters.length, label: "zonas con reportes", color: "var(--color-ayuda)" },
            ].map((s) => (
              <div key={s.label} className="card p-4 text-center">
                <p className="text-[1.7rem] font-extrabold tabular-nums leading-none" style={{ color: s.color }}>
                  {nf.format(s.n)}
                </p>
                <p className="mt-1 text-xs text-[var(--color-ink-soft)]">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Mapa */}
          <div
            className="overflow-hidden rounded-2xl border"
            style={{ borderColor: "var(--color-line-strong)", height: 420 }}
          >
            <MapView clusters={clusters} />
          </div>
          <p className="-mt-2 text-xs text-[var(--color-ink-faint)]">
            Ubicación aproximada a nivel de localidad. {unlocated > 0 && `${nf.format(unlocated)} reportes con zona no reconocida no aparecen en el mapa.`} Toca un círculo para ver el detalle.
          </p>

          {/* Ranking de zonas (visual, sin depender del mapa) */}
          <section className="card p-5">
            <h2 className="text-base font-bold">Zonas más afectadas</h2>
            <ul className="mt-3 flex flex-col gap-2.5">
              {clusters.slice(0, 12).map((c) => (
                <li key={c.name} className="flex items-center gap-3 text-sm">
                  <span className="w-32 shrink-0 truncate font-semibold">{c.name}</span>
                  <span className="relative h-5 flex-1 overflow-hidden rounded" style={{ background: "var(--color-paper-sunk)" }}>
                    <span
                      className="absolute inset-y-0 left-0 rounded"
                      style={{ width: `${Math.max(4, (c.count / max) * 100)}%`, background: "var(--color-busco)" }}
                    />
                  </span>
                  <span className="w-14 shrink-0 text-right tabular-nums font-semibold">{nf.format(c.count)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm">
              <Link href="/busco" className="font-semibold underline underline-offset-4">
                Ver la lista completa de personas buscadas →
              </Link>
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
