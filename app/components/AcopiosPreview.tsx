import Link from "next/link";
import { Box, ArrowRight } from "./icons";
import { getAcopios } from "@/lib/acopios";

/** Banner del inicio: centros de acopio para donar. */
export async function AcopiosPreview() {
  const acopios = await getAcopios();
  if (acopios.length === 0) return null;
  const cities = new Set(acopios.map((a) => a.city || "Otras")).size;

  return (
    <section className="shell mt-9">
      <Link
        href="/acopios"
        className="card flex items-center gap-4 p-4 transition-colors hover:bg-[var(--color-paper-sunk)]"
        style={{ borderLeft: "4px solid var(--color-ayuda)" }}
      >
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md"
          style={{ background: "var(--color-ayuda-soft)", color: "var(--color-ayuda)" }}
          aria-hidden="true"
        >
          <Box size={22} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-lg font-bold">Centros de acopio</span>
          <span className="block text-sm text-[var(--color-ink-soft)]">
            {acopios.length} puntos de donación en {cities} ciudades — agua, alimentos,
            insumos médicos, ropa y más.
          </span>
        </span>
        <ArrowRight size={20} aria-hidden="true" className="shrink-0 text-[var(--color-ink-faint)]" />
      </Link>
    </section>
  );
}
