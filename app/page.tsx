import Link from "next/link";
import { SiteHeader } from "./components/SiteHeader";
import { SiteFooter } from "./components/SiteFooter";
import { ActionCard } from "./components/ActionCard";
import { MissingCard } from "./components/MissingCard";
import { Phone, AlertTriangle } from "./components/icons";
import { ACTIONS } from "@/lib/types";
import { EMERGENCY_PRIMARY, EMERGENCY_QUICK } from "@/lib/emergency";
import { getMissingPersons } from "@/lib/data";

export default async function Home() {
  const missing = await getMissingPersons();

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
        </section>

        {/* Muro de emergencia — información ciudadana en vivo */}
        <section className="shell mb-4">
          <Link
            href="/muro"
            className="card flex items-center gap-4 p-4"
            style={{ borderLeft: "4px solid var(--color-alert)" }}
          >
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md"
              style={{ background: "var(--color-alert-soft)", color: "var(--color-alert)" }}
              aria-hidden="true"
            >
              <AlertTriangle size={22} />
            </span>
            <span className="min-w-0">
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
            </span>
          </Link>
        </section>

        {/* Las 4 acciones — elemento dominante de la página */}
        <section className="shell" aria-label="Acciones">
          <h2 className="eyebrow mb-3">Elige una opción</h2>
          <div className="grid gap-3 sm:grid-cols-2">

            {ACTIONS.map((a) => (
              <ActionCard key={a.key} action={a} />
            ))}
          </div>
        </section>

        {/* Personas buscadas — visibles directamente en el inicio */}
        <section className="shell mt-9" aria-label="Personas buscadas">
          <div className="mb-3 flex items-end justify-between gap-3">
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
              <span className="eyebrow">Toca para llamar</span>
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
