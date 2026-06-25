import Link from "next/link";
import { SiteHeader } from "./components/SiteHeader";
import { SiteFooter } from "./components/SiteFooter";
import { ActionCard } from "./components/ActionCard";
import { Phone, AlertTriangle } from "./components/icons";
import { ACTIONS } from "@/lib/types";

export default function Home() {
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

        {/* Información factual: cómo funciona + números de emergencia */}
        <section className="shell mt-9 grid gap-4 md:grid-cols-[1.4fr_1fr]">
          <div className="card p-5">
            <h2 className="text-base font-bold">Cómo funciona</h2>
            <ol className="mt-3 flex flex-col gap-3 text-[0.95rem]">
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

          <div
            className="card p-5"
            style={{ borderLeft: "4px solid var(--color-busco)" }}
          >
            <h2 className="text-base font-bold">Números de emergencia</h2>
            <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
              Para auxilio inmediato, llama antes de usar esta herramienta.
            </p>
            <ul className="mt-3 flex flex-col gap-2 text-[0.95rem]">
              <li>
                <a
                  href="tel:911"
                  className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5 -mx-2 hover:bg-[var(--color-paper-sunk)]"
                >
                  <span className="flex items-center gap-2">
                    <Phone size={18} aria-hidden="true" style={{ color: "var(--color-busco)" }} />
                    Emergencias
                  </span>
                  <span className="font-bold tabular-nums">911</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:171"
                  className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5 -mx-2 hover:bg-[var(--color-paper-sunk)]"
                >
                  <span className="flex items-center gap-2">
                    <Phone size={18} aria-hidden="true" style={{ color: "var(--color-busco)" }} />
                    Protección Civil / Bomberos
                  </span>
                  <span className="font-bold tabular-nums">171</span>
                </a>
              </li>
            </ul>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
