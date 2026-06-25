/** Aviso informativo (privacidad, moderación, errores). */
export function Notice({
  tone = "info",
  children,
}: {
  tone?: "info" | "warn" | "error";
  children: React.ReactNode;
}) {
  const styles: Record<string, { bg: string; border: string; color: string }> = {
    info: { bg: "var(--color-info-soft)", border: "var(--color-azul)", color: "var(--color-azul-ink)" },
    warn: { bg: "var(--color-ayuda-soft)", border: "var(--color-oro-deep)", color: "#7a5410" },
    error: { bg: "var(--color-busco-soft)", border: "var(--color-busco)", color: "#7d231a" },
  };
  const s = styles[tone];
  return (
    <div
      role={tone === "error" ? "alert" : "note"}
      className="rounded-xl border-l-4 px-4 py-3 text-sm"
      style={{ background: s.bg, borderColor: s.border, color: s.color }}
    >
      {children}
    </div>
  );
}
