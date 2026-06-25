"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { HelpKind, HelpListing, HELP_CATEGORIES, categoryEmoji, categoryLabel } from "@/lib/types";
import { waLink } from "@/lib/utils";

// Leaflet solo en el cliente.
const HelpMap = dynamic(() => import("./HelpMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-[var(--color-ink-soft)]">
      Cargando mapa…
    </div>
  ),
});

type KindFilter = "all" | HelpKind;

export function HelpExplorer({ listings }: { listings: HelpListing[] }) {
  const [kind, setKind] = useState<KindFilter>("all");
  const [cat, setCat] = useState<string>("all");

  const filtered = useMemo(
    () =>
      listings.filter(
        (l) => (kind === "all" || l.kind === kind) && (cat === "all" || l.category === cat)
      ),
    [listings, kind, cat]
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Filtros */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="inline-flex rounded-xl border p-1" style={{ borderColor: "var(--color-line-strong)" }} role="group" aria-label="Filtrar por tipo">
          {([
            ["all", "Todo"],
            ["need", "Necesitan"],
            ["offer", "Ofrecen"],
          ] as const).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setKind(val)}
              aria-pressed={kind === val}
              className="rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors"
              style={
                kind === val
                  ? { background: "var(--color-ink)", color: "#fff" }
                  : { color: "var(--color-ink-soft)" }
              }
            >
              {label}
            </button>
          ))}
        </div>

        <label className="sr-only" htmlFor="cat">Categoría</label>
        <select id="cat" value={cat} onChange={(e) => setCat(e.target.value)} className="select sm:max-w-xs">
          <option value="all">Todas las categorías</option>
          {HELP_CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.emoji} {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Mapa */}
      <div className="overflow-hidden rounded-2xl border" style={{ borderColor: "var(--color-line-strong)", height: 340 }}>
        <HelpMap listings={filtered} />
      </div>
      <p className="-mt-2 text-xs text-[var(--color-ink-faint)]">
        🟢 Ofrecen ayuda · 🟠 Necesitan ayuda. Toca un pin para ver el detalle.
      </p>

      {/* Lista */}
      {filtered.length === 0 ? (
        <p className="card p-6 text-center text-[var(--color-ink-soft)]">
          No hay publicaciones con estos filtros todavía.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {filtered.map((l) => (
            <li key={l.id} className="card p-4 flex flex-col gap-2" style={{ borderLeft: `5px solid ${l.kind === "offer" ? "var(--color-salvo)" : "var(--color-ayuda)"}` }}>
              <div className="flex items-center justify-between gap-2">
                <span className="tag" style={{ background: l.kind === "offer" ? "var(--color-salvo)" : "var(--color-ayuda)", color: "#fff" }}>
                  {l.kind === "offer" ? "Ofrece" : "Necesita"}
                </span>
                <span className="text-sm text-[var(--color-ink-soft)]">
                  {categoryEmoji(l.category)} {categoryLabel(l.category)}
                </span>
              </div>
              <h3 className="font-extrabold leading-tight">{l.title}</h3>
              {l.description && <p className="text-sm text-[var(--color-ink-soft)]">{l.description}</p>}
              <p className="text-sm">📍 {l.zone}</p>
              {l.contact_whatsapp && (
                <a href={waLink(l.contact_whatsapp, `Hola, te escribo por “${l.title}” en Vzla Info.`)} target="_blank" rel="noopener" className="btn btn-wa !min-h-[44px] mt-1">
                  Contactar por WhatsApp
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
