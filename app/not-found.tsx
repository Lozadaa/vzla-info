import Link from "next/link";
import { SiteHeader } from "./components/SiteHeader";

export default function NotFound() {
  return (
    <>
      <SiteHeader back={{ href: "/", label: "Inicio" }} />
      <main id="contenido" className="shell-narrow py-16 text-center">
        <p className="eyebrow">Error 404</p>
        <h1 className="mt-2 text-3xl font-extrabold">No encontramos esta página</h1>
        <p className="mt-3 text-[var(--color-ink-soft)]">
          Es posible que el reporte ya no esté disponible o que el enlace sea
          incorrecto.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn btn-primary">Volver al inicio</Link>
          <Link href="/busco" className="btn btn-ghost">Ver personas buscadas</Link>
        </div>
      </main>
    </>
  );
}
