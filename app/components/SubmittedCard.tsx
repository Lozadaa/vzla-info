import Link from "next/link";

/** Confirmación tras enviar un reporte: folio + próximos pasos. */
export function SubmittedCard({
  folio,
  demo,
  title,
  children,
  accent = "var(--color-salvo)",
}: {
  folio: string;
  demo: boolean;
  title: string;
  children?: React.ReactNode;
  accent?: string;
}) {
  return (
    <div className="card p-6 text-center" role="status">
      <div
        className="mx-auto flex h-14 w-14 items-center justify-center rounded-full text-2xl"
        style={{ background: "var(--color-salvo-soft)", color: accent }}
        aria-hidden="true"
      >
        ✓
      </div>
      <h2 className="mt-4 text-2xl font-extrabold">{title}</h2>
      <p className="mt-2 text-[var(--color-ink-soft)]">
        Tu reporte quedó registrado y será revisado por un moderador antes de
        publicarse. Guarda tu folio por si necesitas referirte a él.
      </p>
      <p className="mt-4">
        <span className="folio inline-block rounded-lg px-3 py-1.5" style={{ background: "var(--color-paper-sunk)" }}>
          Folio {folio}
        </span>
      </p>

      {demo && (
        <p className="mt-3 text-xs text-[var(--color-ink-faint)]">
          Modo demostración: Supabase no está configurado, el reporte no se guardó.
        </p>
      )}

      {children}

      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/" className="btn btn-ghost">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
