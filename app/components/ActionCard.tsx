import Link from "next/link";
import { ActionMeta } from "@/lib/types";

/**
 * Tarjeta de acción grande. El lomo de color y el folio "01–04"
 * codifican la categoría; toda la tarjeta es un objetivo táctil.
 */
export function ActionCard({ action }: { action: ActionMeta }) {
  return (
    <Link
      href={action.href}
      className="action-card group card relative flex flex-col gap-3 overflow-hidden p-5 sm:p-6 transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5"
      style={{ minHeight: 160 }}
    >
      {/* Lomo de color a la izquierda */}
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-1.5"
        style={{ background: action.accent }}
      />

      <div className="flex items-start justify-between gap-3 pl-2">
        <span className="folio" aria-hidden="true">
          {action.index}
        </span>
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg font-bold transition-colors"
          style={{ background: action.accentSoft, color: action.accent }}
          aria-hidden="true"
        >
          →
        </span>
      </div>

      <div className="pl-2">
        <h2
          className="text-[1.5rem] sm:text-[1.65rem] font-extrabold leading-[1.05]"
          style={{ color: action.accent }}
        >
          {action.title}
        </h2>
        <p className="mt-1.5 text-[0.98rem] text-[var(--color-ink-soft)] leading-snug">
          {action.description}
        </p>
      </div>
    </Link>
  );
}
