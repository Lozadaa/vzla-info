import Link from "next/link";
import { Brand } from "./Brand";

/**
 * Cabecera. En sub-páginas muestra un enlace "Volver" a la izquierda;
 * en el inicio solo el logo centrado-izquierda.
 */
export function SiteHeader({ back }: { back?: { href: string; label: string } }) {
  return (
    <header
      className="sticky top-0 z-40 border-b backdrop-blur"
      style={{
        borderColor: "var(--color-line)",
        background: "color-mix(in srgb, var(--color-paper) 88%, transparent)",
      }}
    >
      <div className="shell flex items-center justify-between gap-3 py-3">
        <div className="flex items-center gap-3 min-w-0">
          {back && (
            <Link
              href={back.href}
              className="btn btn-ghost !min-h-[40px] !px-3 !py-2 text-sm shrink-0"
            >
              <span aria-hidden="true">←</span>
              <span className="hidden sm:inline">{back.label}</span>
            </Link>
          )}
          <Brand size={30} withText={!back} />
        </div>

        <nav className="flex items-center gap-1.5 text-sm">
          <Link href="/busco" className="hidden sm:inline px-3 py-2 font-semibold rounded-lg hover:bg-[var(--color-paper-sunk)]">
            Buscar
          </Link>
          <Link href="/ayuda" className="hidden sm:inline px-3 py-2 font-semibold rounded-lg hover:bg-[var(--color-paper-sunk)]">
            Ayuda
          </Link>
          <Link
            href="/admin"
            className="px-3 py-2 font-semibold rounded-lg text-[var(--color-ink-soft)] hover:bg-[var(--color-paper-sunk)]"
          >
            Moderación
          </Link>
        </nav>
      </div>
    </header>
  );
}
