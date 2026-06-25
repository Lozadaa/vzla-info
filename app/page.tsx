import Link from "next/link";
import { SiteHeader } from "./components/SiteHeader";
import { SiteFooter } from "./components/SiteFooter";
import { ActionCard } from "./components/ActionCard";
import { MissingCard } from "./components/MissingCard";
import { MuroPreview } from "./components/MuroPreview";
import { AyudaPreview } from "./components/AyudaPreview";
import { SismosPreview } from "./components/SismosPreview";
import { Phone, AlertTriangle } from "./components/icons";
import { ACTIONS } from "@/lib/types";
import { EMERGENCY_PRIMARY, EMERGENCY_QUICK } from "@/lib/emergency";
import { getMissingPersons, getReunionsCount, getSituationMap } from "@/lib/data";
import { MapView } from "./mapa/MapView";

const nf = new Intl.NumberFormat("es-VE");

export default async function Home() {
  const [missing, reunions, situation] = await Promise.all([
    getMissingPersons(6),
    getReunionsCount(),
    getSituationMap(),
  ]);

  return (
    <>
      <SiteHeader />
      <main id="contenido">
        {/* Encabezado — directo y funcional, sin tono publicitario */}
        <section className="shell pt-9 pb-7 sm:pt-12 sm:pb-9">
          <p className="eyebrow">Respuesta ciudadana ante emergencias</p>
          <h1 className="mt-3 text-[2rem] sm:text-[2.7rem] font-extrabold leading-[1.05] max-w-3xl">
            Reporta tu estado, busca a los tuyos y ubica ayuda.
          </h1>
          <p className="mt-4 text-[1.05rem] text-[var(--color-ink-soft)] max-w-2xl">
            Herramienta comunitaria para reconectar con familiares y localizar
            recursos después de una emergencia. Cada reporte es verificado por un
            moderador antes de publicarse. No reemplaza a los servicios oficiales
            de emergencia.
          </p>

          {reunions > 0 && (
            <p
              className="mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
              style={{ background: "var(--color-salvo-soft)", color: "var(--color-salvo)" }}
              title="Personas marcadas como “localizado” por la fuente externa de desaparecidos."
            >
              <span
                aria-hidden="true"
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: "var(--color-salvo)" }}
              />
              {reunions === 1
                ? "1 persona reportada como localizada"
                : `${reunions} personas reportadas como localizadas`}
            </p>
          )}
        </section>

        {/* Las 4 acciones — primer bloque interactivo del inicio */}
        <section className="shell" aria-label="Acciones">
          <div className="mb-2.5 flex items-baseline justify-between gap-3">
            <h2 className="eyebrow">Elige una opción</h2>
            <span className="tap-hint">Toca una opción</span>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2">

            {[...ACTIONS].sort((a, b) =>
              a.key === "busco" ? -1 : b.key === "busco" ? 1 : 0,
            ).map((a) => (
              <ActionCard key={a.key} action={a} featured={a.key === "busco"} />
            ))}
          </div>
        </section>

        {/* Personas buscadas — visibles directamente en el inicio */}
        <section className="shell mt-9" aria-label="Personas buscadas">
          <div className="mb-1.5 flex items-end justify-between gap-3">
            <h2 className="text-lg font-bold" style={{ color: "var(--color-busco)" }}>
              Personas buscadas
            </h2>
            <Link
              href="/busco"
              className="text-sm font-semibold underline underline-offset-2"
            >
              Ver todas →
            </Link>
          </div>
          {missing.length > 0 && (
            <p className="tap-hint mb-3">Toca una ficha para ver el detalle</p>
          )}

          {missing.length === 0 ? (
            <p className="card p-5 text-sm text-[var(--color-ink-soft)]">
              Aún no hay personas reportadas públicamente.{" "}
              <Link
                href="/busco/nuevo"
                className="font-semibold underline underline-offset-2"
                style={{ color: "var(--color-busco)" }}
              >
                Reportar a alguien
              </Link>
              .
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {missing.slice(0, 6).map((p) => (
                <MissingCard key={p.id} person={p} />
              ))}
            </div>
          )}
        </section>

        {/* Mapa de situación — dónde se busca a más personas */}
        {situation.clusters.length > 0 && (
          <section className="shell mt-9" aria-label="Mapa de situación">
            <div className="mb-3 flex items-end justify-between gap-3">
              <h2 className="text-lg font-bold">Mapa de situación</h2>
              <Link href="/mapa" className="text-sm font-semibold underline underline-offset-2">
                Ver mapa completo →
              </Link>
            </div>
            <div
              className="overflow-hidden rounded-2xl border"
              style={{ borderColor: "var(--color-line-strong)", height: 320 }}
            >
              <MapView clusters={situation.clusters} />
            </div>
            <p className="-mt-1 mt-2 text-xs text-[var(--color-ink-faint)]">
              {nf.format(situation.total)} personas buscadas, agrupadas por la última
              zona donde fueron vistas. El círculo más grande, más personas. Toca uno
              para ver el detalle.
            </p>
          </section>
        )}

        {/* Muro de emergencia — banner + miniaturas (preview) */}
        <div className="mt-9">
          <MuroPreview />
        </div>

        {/* Ayuda — banner + miniaturas (preview) de necesito / ofrezco */}
        <AyudaPreview />

        {/* Actividad sísmica — réplicas e historial (USGS), en vivo */}
        <SismosPreview />

        {/* Contexto — por qué existe la plataforma ahora */}
        <section className="shell mt-9 mb-4">
          <div className="card p-5" style={{ borderLeft: "4px solid var(--color-alert)" }}>
            <p className="eyebrow" style={{ color: "var(--color-alert)" }}>
              Contexto · 24 de junio de 2026
            </p>
            <h2 className="mt-1.5 text-lg font-bold">Terremotos de Yaracuy</h2>
            <p className="mt-2 text-[0.97rem] text-[var(--color-ink-soft)]">
              El 24 de junio de 2026, dos sismos sucesivos de magnitud 7,2 y 7,5
              sacudieron el occidente de Venezuela, con epicentro en Yaracuy
              (cerca de San Felipe y Yumare). Hubo derrumbes y daños en Caracas,
              La Guaira, Valencia, Maracay y otros estados, y afectación del
              aeropuerto de Maiquetía. Esta plataforma reúne reportes ciudadanos
              para reencontrar familiares y coordinar ayuda.
            </p>
            <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <div>
                <dt className="folio">Magnitud</dt>
                <dd className="font-bold tabular-nums">7,2 y 7,5 Mw</dd>
              </div>
              <div>
                <dt className="folio">Fallecidos</dt>
                <dd className="font-bold tabular-nums">32+</dd>
              </div>
              <div>
                <dt className="folio">Heridos</dt>
                <dd className="font-bold tabular-nums">700+</dd>
              </div>
              <div>
                <dt className="folio">Intensidad</dt>
                <dd className="font-bold">IX Mercalli</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-[var(--color-ink-faint)]">
              Cifras preliminares; pueden variar conforme avancen las labores de
              rescate. Si tu vida corre peligro, llama al 911 antes de usar esta
              herramienta.
            </p>
          </div>
        </section>

        {/* Llamada rápida — acceso directo a los servicios de auxilio */}
        <section className="shell mt-9" aria-label="Llamada rápida de emergencia">
          <div
            className="card p-5"
            style={{ borderLeft: "4px solid var(--color-alert)" }}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-base font-bold">
                <AlertTriangle size={20} aria-hidden="true" style={{ color: "var(--color-alert)" }} />
                Llamada rápida
              </h2>
              <span className="tap-hint" style={{ color: "var(--color-alert)" }}>
                Toca para llamar
              </span>
            </div>

            {/* 911 destacado */}
            <a
              href={`tel:${EMERGENCY_PRIMARY.tel}`}
              className="btn btn-block mt-3 !justify-start gap-3 !min-h-[64px]"
              style={{ background: "var(--color-alert)", color: "#fff" }}
            >
              <Phone size={24} aria-hidden="true" />
              <span className="flex flex-col items-start leading-tight">
                <span className="text-[1.25rem] font-extrabold tabular-nums">911 · Emergencias</span>
                <span className="text-[0.8rem] font-normal opacity-90">
                  Número único nacional · policía, bomberos y ambulancias
                </span>
              </span>
            </a>

            {/* Demás servicios */}
            <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {EMERGENCY_QUICK.map((q) => (
                <li key={q.tel}>
                  <a
                    href={`tel:${q.tel}`}
                    className="flex h-full items-center gap-2.5 rounded-md border px-3 py-2.5 hover:bg-[var(--color-paper-sunk)]"
                    style={{ borderColor: "var(--color-line-strong)", minHeight: 56 }}
                  >
                    <Phone size={17} aria-hidden="true" className="shrink-0" style={{ color: "var(--color-alert)" }} />
                    <span className="min-w-0 flex flex-col leading-tight">
                      <span className="truncate text-sm font-semibold">{q.name}</span>
                      <span className="folio truncate">{q.label}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            <p className="mt-3 text-xs text-[var(--color-ink-faint)]">
              Los números 0212 son referenciales de Caracas y la Gran Caracas. En
              otros estados hay líneas locales distintas. Para más, abre el botón
              de emergencias.
            </p>
          </div>
        </section>

        {/* Cómo funciona */}
        <section className="shell mt-4 mb-2">
          <div className="card p-5">
            <h2 className="text-base font-bold">Cómo funciona</h2>
            <ol className="mt-3 grid gap-3 text-[0.95rem] sm:grid-cols-3">
              <li className="flex gap-3">
                <span className="folio mt-0.5">1</span>
                <span>Completas un reporte. No necesitas crear una cuenta.</span>
              </li>
              <li className="flex gap-3">
                <span className="folio mt-0.5">2</span>
                <span>Un moderador lo revisa antes de hacerlo público.</span>
              </li>
              <li className="flex gap-3">
                <span className="folio mt-0.5">3</span>
                <span>
                  Una vez aprobado, aparece en la lista o el mapa y puede
                  difundirse por WhatsApp.
                </span>
              </li>
            </ol>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
