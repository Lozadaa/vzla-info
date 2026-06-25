import { Brand } from "./Brand";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t" style={{ borderColor: "var(--color-line)" }}>
      <div className="flag-rule opacity-60" aria-hidden="true" />
      <div className="shell py-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Brand size={26} />
        <p className="text-sm text-[var(--color-ink-soft)] max-w-md">
          Plataforma humanitaria comunitaria. La información publicada es revisada
          por moderadores antes de hacerse visible. No reemplaza a las autoridades
          ni a servicios de emergencia.
        </p>
      </div>
    </footer>
  );
}
