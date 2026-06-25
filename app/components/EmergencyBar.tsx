import { AlertTriangle, Phone } from "./icons";

/**
 * Barra de utilidad de emergencia, al inicio de cada página.
 * Mensaje sobrio y siempre vigente: prioriza la línea oficial de auxilio.
 * Coronada por una franja tricolor nacional como acento de identidad.
 */
export function EmergencyBar() {
  return (
    <div>
      <div className="flag-rule" aria-hidden="true" />
      <div style={{ background: "var(--color-azul)", color: "#fff" }}>
        <div className="shell flex items-center justify-between gap-3 py-2 text-[0.84rem]">
          <p className="flex items-center gap-2 min-w-0">
            <AlertTriangle size={16} className="shrink-0" style={{ color: "var(--color-flag-amarillo)" }} />
            <span className="truncate">
              ¿Tu vida está en peligro? Llama primero a emergencias.
            </span>
          </p>
          <a
            href="tel:911"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1 font-bold tabular-nums"
            style={{ background: "rgba(255,255,255,0.14)", color: "#fff" }}
          >
            <Phone size={15} aria-hidden="true" />
            911
          </a>
        </div>
      </div>
    </div>
  );
}
