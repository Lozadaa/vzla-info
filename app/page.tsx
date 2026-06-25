import Link from "next/link";
import { SiteHeader } from "./components/SiteHeader";
import { SiteFooter } from "./components/SiteFooter";
import { ActionCard } from "./components/ActionCard";
import { ACTIONS } from "@/lib/types";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="contenido">
        {/* Hero — directo y tranquilizador */}
        <section className="shell pt-10 pb-8 sm:pt-14 sm:pb-10">
          <p className="eyebrow">Plataforma humanitaria · Venezuela</p>
          <h1 className="mt-3 text-[2.3rem] sm:text-[3.25rem] font-extrabold leading-[1.02] max-w-3xl">
            En la incertidumbre,{" "}
            <span style={{ color: "var(--color-azul)" }}>un lugar</span> para
            reencontrarse.
          </h1>
          <p className="mt-4 text-lg text-[var(--color-ink-soft)] max-w-2xl">
            Repórtate a salvo, busca a un familiar, aporta información o encuentra
            ayuda cerca. Sin necesidad de cuenta, revisado por personas y pensado
            para tu teléfono.
          </p>
        </section>

        {/* Muro de emergencia — información ciudadana en vivo */}
        <section className="shell mb-4">
          <Link
            href="/muro"
            className="card flex items-center gap-4 p-4 transition-transform hover:-translate-y-0.5"
            style={{ borderLeft: "6px solid var(--color-alert)" }}
          >
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl"
              style={{ background: "var(--color-alert-soft)" }}
              aria-hidden="true"
            >
              📡
            </span>
            <span className="min-w-0">
              <span className="flex items-center gap-2">
                <span className="font-extrabold text-lg">Muro de emergencia</span>
                <span
                  className="tag"
                  style={{ background: "var(--color-alert)", color: "#fff" }}
                >
                  En vivo
                </span>
              </span>
              <span className="block text-sm text-[var(--color-ink-soft)]">
                Reportes recopilados de redes sobre desaparecidos y necesidades
                urgentes, revisados por moderadores.
              </span>
            </span>
          </Link>
        </section>

        {/* Las 4 acciones — el corazón de la app */}
        <section className="shell" aria-label="Acciones principales">
          <div className="grid gap-4 sm:grid-cols-2">
            {ACTIONS.map((a) => (
              <ActionCard key={a.key} action={a} />
            ))}
          </div>
        </section>

        {/* Tira de confianza */}
        <section className="shell mt-10">
          <ul className="grid gap-3 sm:grid-cols-3 text-sm">
            <li className="card p-4 flex items-start gap-3">
              <span aria-hidden="true" className="text-xl">🪪</span>
              <span>
                <strong className="block">Sin cuenta</strong>
                <span className="text-[var(--color-ink-soft)]">
                  Reporta en segundos. No pedimos registro para ayudarte.
                </span>
              </span>
            </li>
            <li className="card p-4 flex items-start gap-3">
              <span aria-hidden="true" className="text-xl">🛡️</span>
              <span>
                <strong className="block">Revisado por personas</strong>
                <span className="text-[var(--color-ink-soft)]">
                  Cada publicación pasa por moderación antes de hacerse pública.
                </span>
              </span>
            </li>
            <li className="card p-4 flex items-start gap-3">
              <span aria-hidden="true" className="text-xl">💬</span>
              <span>
                <strong className="block">Integrado con WhatsApp</strong>
                <span className="text-[var(--color-ink-soft)]">
                  Comparte y contacta por el canal que ya usas todos los días.
                </span>
              </span>
            </li>
          </ul>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
