const nf = new Intl.NumberFormat("es-VE");

export interface HomeStat {
  n: number;
  label: string;
  color: string;
}

/**
 * Franja de estadísticas del inicio: consolida en un solo bloque las cifras
 * que antes vivían sueltas (el badge de "localizadas" del hero y el total de
 * buscadas bajo el mapa). Cifras honestas, sin inflar.
 */
export function HomeStats({ stats }: { stats: HomeStat[] }) {
  return (
    <section className="shell mt-6" aria-label="Estadísticas">
      <dl className="grid grid-cols-3 gap-2.5">
        {stats.map((s) => (
          <div key={s.label} className="card p-4 text-center">
            <dd
              className="text-[1.7rem] font-extrabold tabular-nums leading-none"
              style={{ color: s.color }}
            >
              {nf.format(s.n)}
            </dd>
            <dt className="mt-1 text-xs text-[var(--color-ink-soft)]">{s.label}</dt>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-xs text-[var(--color-ink-faint)]">
        Cifras según los reportes verificados en la plataforma; no representan
        totales oficiales.
      </p>
    </section>
  );
}
