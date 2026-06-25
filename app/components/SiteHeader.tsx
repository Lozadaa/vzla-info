import Link from "next/link";
import { Brand } from "./Brand";
import { ArrowRight } from "./icons";

/**
 * Cabecera. En sub-páginas muestra un enlace "Volver" a la izquierda;
 * en el inicio solo el logo. Fija al desplazar, fondo translúcido sobre blanco.
 */
export function SiteHeader({ back }: { back?: { href: string; label: string } }) {
  return (
    <header
      className="sticky top-0 z-40 border-b backdrop-blur"
      style={{
        borderColor: "var(--color-line-strong)",
        background: "color-mix(in srgb, var(--color-paper) 90%, transparent)",
      }}
    >
      <div className="shell flex items-center justify-between gap-3 py-3">
        <div className="flex items-center gap-3 min-w-0">
          {back && (
            <Link
              href={back.href}
              className="btn btn-ghost !min-h-[40px] !px-3 !py-2 text-sm shrink-0"
            >
              <ArrowRight size={16} aria-hidden="true" className="rotate-180" />
              <span className="hidden sm:inline">{back.label}</span>
            </Link>
          )}
          <Brand size={30} withText={!back} />
        </div>

        <nav className="flex items-center gap-1 text-sm">
          <Link
            href="/muro"
            className="px-3 py-2 font-semibold rounded-md hover:bg-[var(--color-paper-sunk)]"
            style={{ color: "var(--color-alert)" }}
          >
            Muro
          </Link>
          <Link
            href="/busco"
            className="hidden sm:inline px-3 py-2 font-semibold rounded-md hover:bg-[var(--color-paper-sunk)]"
          >
            Buscar
          </Link>
          <Link
            href="/ayuda"
            className="hidden sm:inline px-3 py-2 font-semibold rounded-md hover:bg-[var(--color-paper-sunk)]"
          >
            Ayuda
          </Link>
        </nav>
      </div>
    </header>
  );
}
