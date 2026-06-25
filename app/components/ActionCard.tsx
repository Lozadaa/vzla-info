import Link from "next/link";
import { ActionMeta } from "@/lib/types";

/**
 * Acción principal. Tarjeta sobria: regla de color a la izquierda como
 * indicador funcional (no decorativo), título en tinta, instrucción clara.
 */
export function ActionCard({ action }: { action: ActionMeta }) {
  return (
    <Link
      href={action.href}
      className="card group flex items-center gap-4 p-4 sm:p-5 transition-colors hover:bg-[var(--color-paper-sunk)]"
      style={{ borderLeft: `4px solid ${action.accent}` }}
    >
      <span
        aria-hidden="true"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md font-bold"
        style={{ background: action.accentSoft, color: action.accent }}
      >
        {action.index}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-[1.2rem] font-semibold leading-tight">
          {action.title}
        </span>
        <span className="mt-0.5 block text-[0.95rem] text-[var(--color-ink-soft)] leading-snug">
          {action.description}
        </span>
      </span>

      <span
        aria-hidden="true"
        className="shrink-0 text-[var(--color-ink-faint)] transition-transform group-hover:translate-x-0.5"
      >
        →
      </span>
    </Link>
  );
}
