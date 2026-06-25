const nf = new Intl.NumberFormat("es-VE");

export interface VisitStats {
  total_views: number;
  unique_visitors: number;
  views_24h: number;
  unique_24h: number;
  views_7d: number;
  top_paths: { path: string; views: number }[];
}

// Panel de visitas reales (analítica propia; ver /api/track + migración).
// No se muestra si aún no hay datos / la migración no se aplicó.
export function VisitsPanel({ stats }: { stats: VisitStats | null }) {
  if (!stats) return null;

  const tiles = [
    { n: stats.unique_24h, label: "visitantes únicos (24 h)", color: "var(--color-busco)" },
    { n: stats.views_24h, label: "visitas (24 h)", color: "var(--color-ayuda)" },
    { n: stats.views_7d, label: "visitas (7 días)", color: "var(--color-info)" },
    { n: stats.unique_visitors, label: "visitantes únicos (total)", color: "var(--color-salvo)" },
    { n: stats.total_views, label: "visitas totales", color: "var(--color-ink-soft)" },
  ];

  return (
    <section className="card p-4">
      <h2 className="font-bold">Visitas a la web</h2>
      <p className="text-sm text-[var(--color-ink-soft)] mb-3">
        Gente real que ha entrado (se excluyen bots y previsualizadores de
        enlaces). Un “visitante único” es un navegador distinto.
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {tiles.map((t) => (
          <div
            key={t.label}
            className="rounded-lg border p-3"
            style={{ borderColor: "var(--color-line)" }}
          >
            <p className="text-2xl font-extrabold tabular-nums" style={{ color: t.color }}>
              {nf.format(Number(t.n) || 0)}
            </p>
            <p className="text-xs text-[var(--color-ink-soft)] leading-tight mt-0.5">
              {t.label}
            </p>
          </div>
        ))}
      </div>

      {stats.top_paths.length > 0 && (
        <div className="mt-4">
          <h3 className="eyebrow mb-2">Páginas más vistas</h3>
          <ul className="flex flex-col gap-1.5">
            {stats.top_paths.map((p) => (
              <li
                key={p.path}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="truncate font-mono text-[var(--color-ink-soft)]">{p.path}</span>
                <span className="folio shrink-0">{nf.format(Number(p.views) || 0)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
