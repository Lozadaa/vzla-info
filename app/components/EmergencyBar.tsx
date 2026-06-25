/**
 * Barra de utilidad de emergencia, fija en todo el sitio.
 * Mensaje sobrio y siempre vigente: prioriza la línea oficial de auxilio.
 */
export function EmergencyBar() {
  return (
    <div style={{ background: "var(--color-azul)", color: "#fff" }}>
      <div className="shell flex items-center justify-between gap-3 py-1.5 text-[0.82rem]">
        <p className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: "var(--color-busco)" }}
          />
          <span>
            ¿Tu vida está en peligro? Llama primero a los servicios de emergencia.
          </span>
        </p>
        <a
          href="tel:911"
          className="shrink-0 font-semibold underline underline-offset-2 tabular-nums"
        >
          911
        </a>
      </div>
    </div>
  );
}
