import { SiteHeader } from "../components/SiteHeader";

export default function Offline() {
  return (
    <>
      <SiteHeader back={{ href: "/", label: "Inicio" }} />
      <main id="contenido" className="shell-narrow py-16 text-center">
        <p className="text-5xl" aria-hidden="true">📶</p>
        <h1 className="mt-4 text-3xl font-extrabold">Sin conexión</h1>
        <p className="mt-3 text-[var(--color-ink-soft)]">
          Parece que no tienes internet en este momento. Las páginas que ya
          visitaste siguen disponibles. Vuelve a intentarlo cuando recuperes la
          señal.
        </p>
      </main>
    </>
  );
}
