"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  type Quake,
  type QuakeSummary,
  magStyle,
  fmtMag,
  fmtDepth,
  relTime,
  fmtWhen,
} from "@/lib/sismos";
import { MapPin, ArrowRight } from "../components/icons";

// Leaflet solo en el cliente.
const SismosMap = dynamic(() => import("./SismosMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-sm text-[var(--color-ink-soft)]">
      Cargando mapa…
    </div>
  ),
});

const PERIODS = [
  { days: 1, label: "24 h" },
  { days: 7, label: "7 días" },
  { days: 30, label: "30 días" },
  { days: 365, label: "1 año" },
];

const MAGS = [
  { min: 2.5, label: "2,5+" },
  { min: 4, label: "4,0+" },
  { min: 5, label: "5,0+" },
];

export function SismosLive({
  initial,
  initialDays,
  initialMinmag,
}: {
  initial: QuakeSummary;
  initialDays: number;
  initialMinmag: number;
}) {
  const [days, setDays] = useState(initialDays);
  const [minmag, setMinmag] = useState(initialMinmag);
  const [data, setData] = useState<QuakeSummary>(initial);
  const [loading, setLoading] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<number>(() => Date.now());
  // Evita pisar los datos del SSR con un fetch idéntico en el primer render.
  const isFirst = useRef(true);

  const load = useCallback(async (d: number, m: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/sismos?days=${d}&minmag=${m}`);
      if (res.ok) {
        setData((await res.json()) as QuakeSummary);
        setUpdatedAt(Date.now());
      }
    } catch {
      /* se mantiene la última vista buena */
    } finally {
      setLoading(false);
    }
  }, []);

  // Recargar al cambiar filtros (salta el primer render: ya viene del servidor).
  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    load(days, minmag);
  }, [days, minmag, load]);

  // Auto-refresco cada 2 minutos.
  useEffect(() => {
    const id = setInterval(() => load(days, minmag), 120_000);
    return () => clearInterval(id);
  }, [days, minmag, load]);

  const quakes = data.quakes;

  return (
    <>
      {/* Controles */}
      <section className="shell mt-6" aria-label="Filtros">
        <div className="card flex flex-wrap items-center gap-x-6 gap-y-3 p-4">
          <Filter
            legend="Período"
            options={PERIODS.map((p) => ({ value: p.days, label: p.label }))}
            value={days}
            onChange={setDays}
          />
          <Filter
            legend="Magnitud"
            options={MAGS.map((m) => ({ value: m.min, label: m.label }))}
            value={minmag}
            onChange={setMinmag}
          />
          <div className="ml-auto flex items-center gap-2 text-xs text-[var(--color-ink-faint)]">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: loading ? "var(--color-oro)" : "var(--color-salvo)" }}
              aria-hidden="true"
            />
            {loading ? "Actualizando…" : `Actualizado ${relTime(updatedAt)}`}
          </div>
        </div>
      </section>

      {/* Resumen */}
      <section className="shell mt-4" aria-label="Resumen">
        <dl className="grid grid-cols-3 gap-2.5">
          <Stat label="Sismos" value={data.count} />
          <Stat label="Últimas 24 h" value={data.last24h} />
          <Stat
            label="Mayor magnitud"
            value={fmtMag(data.strongest?.mag ?? null)}
            accent={magStyle(data.strongest?.mag ?? null).accent}
          />
        </dl>
      </section>

      {/* Mapa de epicentros */}
      {quakes.length > 0 && (
        <section className="shell mt-4" aria-label="Mapa de epicentros">
          <div className="card overflow-hidden">
            <div className="h-[260px] w-full sm:h-[360px]">
              <SismosMap quakes={quakes} />
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-[var(--color-line)] px-3 py-2 text-[0.7rem] text-[var(--color-ink-soft)]">
              <span className="font-semibold text-[var(--color-ink-faint)]">Magnitud:</span>
              <Dot color="#717b88" label="menor a 3" />
              <Dot color="#9a6a00" label="3 – 4,5" />
              <Dot color="#b45309" label="4,5 – 6" />
              <Dot color="#c1121f" label="6 o más" />
              <span className="text-[var(--color-ink-faint)]">El tamaño crece con la magnitud.</span>
            </div>
          </div>
        </section>
      )}

      {/* Lista */}
      <section className="shell mt-4 mb-8" aria-label="Lista de sismos">
        {quakes.length === 0 ? (
          <p className="card p-5 text-sm text-[var(--color-ink-soft)]">
            No hay sismos registrados con estos filtros, o la fuente no está
            disponible. Prueba ampliar el período o consulta a{" "}
            <a
              href="http://www.funvisis.gob.ve/recientes.php"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline underline-offset-2"
            >
              FUNVISIS
            </a>
            .
          </p>
        ) : (
          <ul className="grid gap-2.5">
            {quakes.map((k) => (
              <QuakeRow key={k.id} quake={k} />
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

function QuakeRow({ quake: k }: { quake: Quake }) {
  const s = magStyle(k.mag);
  return (
    <li>
      <a
        href={k.url}
        target="_blank"
        rel="noopener noreferrer"
        className="card group flex items-center gap-3 p-3 transition-colors hover:bg-[var(--color-paper-sunk)]"
        style={{ borderLeft: `5px solid ${s.accent}` }}
      >
        {/* Magnitud */}
        <span
          className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg leading-none"
          style={{ background: s.soft, color: s.accent }}
          aria-hidden="true"
        >
          <span className="text-[1.35rem] font-extrabold tabular-nums">{fmtMag(k.mag)}</span>
          <span className="text-[0.58rem] font-semibold uppercase tracking-wide">{s.label}</span>
        </span>

        {/* Datos */}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[1rem] font-bold leading-tight">{k.place}</span>
          <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[0.8rem] text-[var(--color-ink-soft)]">
            <span className="flex items-center gap-1">
              <MapPin size={13} aria-hidden="true" className="shrink-0" />
              Prof. {fmtDepth(k.depthKm)}
            </span>
            <span className="tabular-nums">{fmtWhen(k.time)}</span>
            <span className="text-[var(--color-ink-faint)]">{relTime(k.time)}</span>
            {k.felt != null && k.felt > 0 && (
              <span style={{ color: "var(--color-azul)" }}>
                {k.felt} {k.felt === 1 ? "persona la sintió" : "personas la sintieron"}
              </span>
            )}
            {k.tsunami && (
              <span className="font-semibold" style={{ color: "var(--color-alert)" }}>
                Aviso de tsunami
              </span>
            )}
          </span>
        </span>

        <ArrowRight
          size={18}
          aria-hidden="true"
          className="shrink-0 text-[var(--color-ink-faint)] transition-transform group-hover:translate-x-0.5"
        />
      </a>
    </li>
  );
}

function Filter<T extends number>({
  legend,
  options,
  value,
  onChange,
}: {
  legend: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <fieldset className="flex items-center gap-2">
      <legend className="folio mb-1">{legend}</legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const active = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(o.value)}
              aria-pressed={active}
              className="rounded-md border px-3 py-1.5 text-sm font-semibold transition-colors"
              style={{
                minHeight: 40,
                borderColor: active ? "var(--color-azul)" : "var(--color-line-strong)",
                background: active ? "var(--color-azul)" : "var(--color-paper)",
                color: active ? "#fff" : "var(--color-ink-soft)",
              }}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function Dot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className="inline-block h-2.5 w-2.5 rounded-full"
        style={{ background: color, border: "1px solid #fff", boxShadow: "0 0 0 1px rgba(0,0,0,.1)" }}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent?: string;
}) {
  return (
    <div className="card p-3 text-center">
      <dt className="folio">{label}</dt>
      <dd
        className="mt-0.5 text-2xl font-extrabold tabular-nums"
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </dd>
    </div>
  );
}
