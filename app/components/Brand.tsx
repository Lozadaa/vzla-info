import Link from "next/link";

/** Emblema: pin de ubicación con punto de alerta — sobrio, funcional. */
export function BrandMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      role="img"
    >
      <path
        d="M20 3c-7.7 0-14 6.1-14 13.7C6 26.6 20 37 20 37s14-10.4 14-20.3C34 9.1 27.7 3 20 3Z"
        fill="var(--color-azul)"
      />
      <circle cx="20" cy="16.4" r="4.6" fill="var(--color-busco)" />
    </svg>
  );
}

export function Brand({
  size = 32,
  withText = true,
}: {
  size?: number;
  withText?: boolean;
}) {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2.5"
      aria-label="Vzla Info, ir al inicio"
    >
      <BrandMark size={size} />
      {withText && (
        <span
          style={{ fontFamily: "var(--font-display)" }}
          className="text-[1.05rem] font-extrabold tracking-tight leading-none"
        >
          Vzla <span className="font-normal text-[var(--color-ink-soft)]">Info</span>
        </span>
      )}
    </Link>
  );
}
