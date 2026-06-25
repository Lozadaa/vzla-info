import { SiteHeader } from "./components/SiteHeader";
import { SiteFooter } from "./components/SiteFooter";
import { ActionCard } from "./components/ActionCard";
import { ACTIONS } from "@/lib/types";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="contenido">
        {/* Encabezado — directo y funcional, sin tono publicitario */}
        <section className="shell pt-9 pb-7 sm:pt-12 sm:pb-9">
          <p className="eyebrow">Respuesta ciudadana ante emergencias</p>
          <h1 className="mt-3 text-[1.95rem] sm:text-[2.6rem] font-semibold leading-[1.08] max-w-3xl">
            Reporta tu estado, busca a los tuyos y ubica ayuda.
          </h1>
          <p className="mt-4 text-[1.05rem] text-[var(--color-ink-soft)] max-w-2xl">
            Herramienta comunitaria para reconectar con familiares y localizar
            recursos después de una emergencia. Cada reporte es verificado por un
            moderador antes de publicarse. No reemplaza a los servicios oficiales
            de emergencia.
          </p>
        </section>

        {/* Las 4 acciones */}
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
            <h2 className="text-base font-semibold">Cómo funciona</h2>
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
            <h2 className="text-base font-semibold">Números de emergencia</h2>
            <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
              Para auxilio inmediato, llama antes de usar esta herramienta.
            </p>
            <ul className="mt-3 flex flex-col gap-2 text-[0.95rem]">
              <li className="flex items-center justify-between gap-3">
                <span>Emergencias</span>
                <a href="tel:911" className="font-semibold tabular-nums underline underline-offset-2">
                  911
                </a>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span>Protección Civil / Bomberos</span>
                <a href="tel:171" className="font-semibold tabular-nums underline underline-offset-2">
                  171
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
