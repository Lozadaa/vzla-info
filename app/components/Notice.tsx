import { MessageInfo, AlertTriangle } from "./icons";

/** Aviso informativo (privacidad, moderación, errores). */
export function Notice({
  tone = "info",
  children,
}: {
  tone?: "info" | "warn" | "error";
  children: React.ReactNode;
}) {
  const styles: Record<
    string,
    { bg: string; border: string; color: string; Icon: (p: { size?: number }) => React.ReactElement }
  > = {
    info: { bg: "var(--color-info-soft)", border: "var(--color-info)", color: "#0c3a72", Icon: MessageInfo },
    warn: { bg: "var(--color-oro-soft, #fbf0d4)", border: "var(--color-oro)", color: "#6b4a00", Icon: AlertTriangle },
    error: { bg: "var(--color-busco-soft)", border: "var(--color-busco)", color: "#7d121a", Icon: AlertTriangle },
  };
  const s = styles[tone];
  const Icon = s.Icon;
  return (
    <div
      role={tone === "error" ? "alert" : undefined}
      className="flex gap-2.5 rounded-lg border-l-4 px-4 py-3 text-sm"
      style={{ background: s.bg, borderColor: s.border, color: s.color }}
    >
      <Icon size={18} aria-hidden="true" />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
