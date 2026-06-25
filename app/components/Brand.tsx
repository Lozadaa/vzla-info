import Link from "next/link";

/** Emblema: pin de ubicación con corazón — humanitario + "ubicar". */
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
      <path
        d="M20 26.5s-6.2-3.9-6.2-8.4a3.5 3.5 0 0 1 6.2-2.2 3.5 3.5 0 0 1 6.2 2.2c0 4.5-6.2 8.4-6.2 8.4Z"
        fill="var(--color-oro)"
      />
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
      aria-label="Venezuela Unida, ir al inicio"
    >
      <BrandMark size={size} />
      {withText && (
        <span
          style={{ fontFamily: "var(--font-display)" }}
          className="text-[1.05rem] font-extrabold tracking-tight leading-none"
        >
          Venezuela<span style={{ color: "var(--color-oro-deep)" }}> Unida</span>
        </span>
      )}
    </Link>
  );
}
