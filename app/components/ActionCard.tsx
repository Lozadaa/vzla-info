import Link from "next/link";
import { ActionMeta, ActionKey } from "@/lib/types";
import { ShieldCheck, Search, MessageInfo, LifeBuoy, ArrowRight } from "./icons";

const ICONS: Record<ActionKey, (p: { size?: number }) => React.ReactElement> = {
  "estoy-a-salvo": ShieldCheck,
  busco: Search,
  "tengo-informacion": MessageInfo,
  ayuda: LifeBuoy,
};

/**
 * Acción principal. Tarjeta grande y escaneable: banda de color a la izquierda
 * (indicador funcional, no decorativo), chip con ícono de la categoría, título
 * en tinta e instrucción clara. Pensada para tocarse bajo estrés.
 */
export function ActionCard({ action }: { action: ActionMeta }) {
  const Icon = ICONS[action.key];
  return (
    <Link
      href={action.href}
      className="card group flex items-center gap-4 p-4 sm:p-5 transition-colors hover:bg-[var(--color-paper-sunk)]"
      style={{ borderLeft: `5px solid ${action.accent}` }}
    >
      <span
        aria-hidden="true"
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg"
        style={{ background: action.accentSoft, color: action.accent }}
      >
        <Icon size={26} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-[1.2rem] font-bold leading-tight">
          {action.title}
        </span>
        <span className="mt-0.5 block text-[0.95rem] text-[var(--color-ink-soft)] leading-snug">
          {action.description}
        </span>
      </span>

      <ArrowRight
        size={20}
        aria-hidden="true"
        className="shrink-0 text-[var(--color-ink-faint)] transition-transform group-hover:translate-x-0.5"
      />
    </Link>
  );
}
