"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Pager } from "../components/Pager";

// Cuántas coincidencias se muestran por página en cada sección.
const PAGE_SIZE = 10;

export interface MatchItem {
  id: string;
  kind: "reencuentro" | "duplicado";
  score: number;
  missing_id: string;
  missing_name: string;
  missing_zone: string;
  missing_photo: string | null;
  // datos del reporte principal (para comparar)
  missing_age?: number | null;
  missing_date?: string | null;
  missing_desc?: string | null;
  missing_contact?: string | null;
  // reencuentro
  safe_id?: string | null;
  safe_name?: string | null;
  safe_zone?: string | null;
  // duplicado — datos del reporte repetido (para comparar)
  other_id?: string | null;
  other_name?: string | null;
  other_zone?: string | null;
  other_photo?: string | null;
  other_age?: number | null;
  other_date?: string | null;
  other_desc?: string | null;
  other_contact?: string | null;
}

const norm = (s?: string | null) =>
  (s ?? "").toLowerCase().trim().replace(/\s+/g, " ");

function fmtDate(d?: string | null): string | null {
  if (!d) return null;
  const t = new Date(d);
  return Number.isNaN(+t)
    ? d
    : t.toLocaleDateString("es-VE", { day: "2-digit", month: "short", year: "numeric" });
}

// Badge de coincidencia: verde si los dos reportes coinciden en ese campo,
// gris si difieren. Ayuda a decidir de un vistazo.
function MatchBadge({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
      style={
        ok
          ? { background: "var(--color-salvo-soft)", color: "var(--color-salvo)" }
          : { background: "var(--color-paper-sunk)", color: "var(--color-ink-faint)" }
      }
    >
      {ok ? "✓" : "≠"} {children}
    </span>
  );
}

// Columna con los datos de un reporte, para comparar lado a lado.
function PersonCol({
  label,
  name,
  age,
  zone,
  date,
  contact,
  desc,
  photo,
}: {
  label: string;
  name: string;
  age?: number | null;
  zone?: string | null;
  date?: string | null;
  contact?: string | null;
  desc?: string | null;
  photo?: string | null;
}) {
  return (
    <div className="min-w-0 flex-1">
      <p className="folio mb-1.5">{label}</p>
      <div className="flex gap-3">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt={`Foto de ${name}`}
            className="h-16 w-16 shrink-0 rounded-md object-cover"
            style={{ background: "var(--color-paper-sunk)" }}
          />
        ) : (
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md text-center text-[0.65rem] text-[var(--color-ink-faint)]"
            style={{ background: "var(--color-paper-sunk)" }}
          >
            sin foto
          </div>
        )}
        <div className="min-w-0 text-sm">
          <p className="font-bold leading-tight">
            {name}
            {age ? `, ${age} años` : ""}
          </p>
          {zone && <p className="text-[var(--color-ink-soft)]">📍 {zone}</p>}
          {date && <p className="text-[var(--color-ink-soft)]">Visto: {date}</p>}
          {contact && (
            <p className="truncate text-[var(--color-ink-soft)]">📞 {contact}</p>
          )}
        </div>
      </div>
      {desc && (
        <p className="mt-2 line-clamp-3 text-xs text-[var(--color-ink-soft)]">{desc}</p>
      )}
    </div>
  );
}

/**
 * Cola de posibles coincidencias detectadas por el motor (triggers en la BD).
 * Nada es definitivo hasta que un moderador confirma:
 *   - Reencuentro: marca a la persona como encontrada (found=true).
 *   - Duplicado: oculta el reporte repetido (status=rejected), conserva uno.
 */
export function MatchPanel({ matches }: { matches: MatchItem[] }) {
  const [list, setList] = useState(matches);
  const [busy, setBusy] = useState<string | null>(null);
  const [reencPage, setReencPage] = useState(0);
  const [dupPage, setDupPage] = useState(0);
  // Duplicados cuyo "conservar/ocultar" el moderador invirtió manualmente.
  const [swapped, setSwapped] = useState<Set<string>>(new Set());

  const toggleSwap = (id: string) =>
    setSwapped((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const reencuentros = list.filter((m) => m.kind === "reencuentro");
  const duplicados = list.filter((m) => m.kind === "duplicado");

  // La página se reajusta sola cuando se resuelven ítems y la lista encoge.
  const rPage = Math.min(reencPage, Math.max(0, Math.ceil(reencuentros.length / PAGE_SIZE) - 1));
  const dPage = Math.min(dupPage, Math.max(0, Math.ceil(duplicados.length / PAGE_SIZE) - 1));
  const reencView = reencuentros.slice(rPage * PAGE_SIZE, rPage * PAGE_SIZE + PAGE_SIZE);
  const dupView = duplicados.slice(dPage * PAGE_SIZE, dPage * PAGE_SIZE + PAGE_SIZE);

  async function resolve(m: MatchItem, action: "confirm" | "dismiss") {
    const supabase = createClient();
    if (!supabase) return;
    setBusy(m.id);

    if (action === "confirm" && m.kind === "reencuentro") {
      await supabase.from("missing_persons").update({ found: true }).eq("id", m.missing_id);
    }
    if (action === "confirm" && m.kind === "duplicado") {
      // Oculta el que el moderador eligió como repetido (por defecto el "otro",
      // o el principal si invirtió con "Intercambiar"); conserva el contrario.
      const hideId = swapped.has(m.id) ? m.missing_id : m.other_id;
      if (hideId) {
        await supabase.from("missing_persons").update({ status: "rejected" }).eq("id", hideId);
      }
    }
    await supabase
      .from("possible_matches")
      .update({ status: action === "confirm" ? "confirmed" : "dismissed" })
      .eq("id", m.id);

    setBusy(null);
    setList((l) => l.filter((x) => x.id !== m.id));
  }

  if (list.length === 0) return null;

  return (
    <div className="flex flex-col gap-6">
      {reencuentros.length > 0 && (
        <section>
          <h2 className="eyebrow mb-2" style={{ color: "var(--color-salvo)" }}>
            Posibles reencuentros · {reencuentros.length}
          </h2>
          <p className="text-sm text-[var(--color-ink-soft)] mb-3">
            Alguien marcado “a salvo” coincide con un reporte de búsqueda. Si es la
            misma persona, confirma para marcarla como encontrada.
          </p>
          <ul className="flex flex-col gap-3">
            {reencView.map((m) => (
              <li key={m.id} className="card p-4" style={{ borderLeft: "5px solid var(--color-salvo)" }}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0 text-sm">
                    <p>
                      <span className="font-bold">Busca:</span> {m.missing_name}{" "}
                      <span className="text-[var(--color-ink-soft)]">({m.missing_zone})</span>
                    </p>
                    <p>
                      <span className="font-bold">A salvo:</span> {m.safe_name}{" "}
                      <span className="text-[var(--color-ink-soft)]">({m.safe_zone})</span>
                    </p>
                    <p className="folio mt-1">confianza {(m.score * 100).toFixed(0)}%</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => resolve(m, "confirm")} disabled={busy === m.id} className="btn !min-h-[44px] text-sm" style={{ background: "var(--color-salvo)", color: "#fff" }}>
                      Es la misma persona
                    </button>
                    <button onClick={() => resolve(m, "dismiss")} disabled={busy === m.id} className="btn btn-ghost !min-h-[44px] text-sm">
                      No
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <Pager page={rPage} total={reencuentros.length} pageSize={PAGE_SIZE} onPage={setReencPage} />
        </section>
      )}

      {duplicados.length > 0 && (
        <section>
          <h2 className="eyebrow mb-2" style={{ color: "var(--color-oro)" }}>
            Posibles duplicados · {duplicados.length}
          </h2>
          <p className="text-sm text-[var(--color-ink-soft)] mb-3">
            El mismo desaparecido parece reportado dos veces. Confirma para ocultar
            el repetido y conservar uno solo (no se pierde información de contacto
            del que se conserva).
          </p>
          <ul className="flex flex-col gap-3">
            {dupView.map((m) => {
              const sameName = norm(m.missing_name) === norm(m.other_name);
              const sameZone = norm(m.missing_zone) === norm(m.other_zone);
              const bothAges = m.missing_age != null && m.other_age != null;
              const sameAge = bothAges && m.missing_age === m.other_age;
              const bothContacts = Boolean(norm(m.missing_contact) && norm(m.other_contact));
              const sameContact =
                bothContacts && norm(m.missing_contact) === norm(m.other_contact);

              // Qué reporte se conserva y cuál se oculta (invertible con el botón).
              const isSwapped = swapped.has(m.id);
              const principal = {
                name: m.missing_name, age: m.missing_age, zone: m.missing_zone,
                date: m.missing_date, contact: m.missing_contact, desc: m.missing_desc, photo: m.missing_photo,
              };
              const repetido = {
                name: m.other_name ?? "", age: m.other_age, zone: m.other_zone,
                date: m.other_date, contact: m.other_contact, desc: m.other_desc, photo: m.other_photo,
              };
              const keep = isSwapped ? repetido : principal;
              const drop = isSwapped ? principal : repetido;
              return (
                <li key={m.id} className="card p-4" style={{ borderLeft: "5px solid var(--color-oro)" }}>
                  {/* Resumen de coincidencias — ayuda a decidir de un vistazo */}
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="folio">similitud {(m.score * 100).toFixed(0)}%</p>
                    <div className="flex flex-wrap justify-end gap-1.5">
                      <MatchBadge ok={sameName}>Nombre</MatchBadge>
                      <MatchBadge ok={sameZone}>Zona</MatchBadge>
                      {bothAges && <MatchBadge ok={sameAge}>Edad</MatchBadge>}
                      {bothContacts && <MatchBadge ok={sameContact}>Contacto</MatchBadge>}
                    </div>
                  </div>

                  {/* Comparación lado a lado */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                    <PersonCol
                      label="✓ CONSERVAR"
                      name={keep.name}
                      age={keep.age}
                      zone={keep.zone}
                      date={fmtDate(keep.date)}
                      contact={keep.contact}
                      desc={keep.desc}
                      photo={keep.photo}
                    />
                    <div
                      className="hidden w-px self-stretch sm:block"
                      style={{ background: "var(--color-line)" }}
                      aria-hidden="true"
                    />
                    <PersonCol
                      label="✕ OCULTAR REPETIDO"
                      name={drop.name}
                      age={drop.age}
                      zone={drop.zone}
                      date={fmtDate(drop.date)}
                      contact={drop.contact}
                      desc={drop.desc}
                      photo={drop.photo}
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => toggleSwap(m.id)}
                      disabled={busy === m.id}
                      className="btn btn-ghost !min-h-[44px] text-sm"
                      title="Invierte cuál se conserva y cuál se oculta"
                    >
                      ⇄ Intercambiar
                    </button>
                    <div className="flex gap-2">
                      <button onClick={() => resolve(m, "confirm")} disabled={busy === m.id} className="btn !min-h-[44px] text-sm" style={{ background: "var(--color-oro)", color: "#fff" }}>
                        Es duplicado
                      </button>
                      <button onClick={() => resolve(m, "dismiss")} disabled={busy === m.id} className="btn btn-ghost !min-h-[44px] text-sm">
                        Son distintas
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <Pager page={dPage} total={duplicados.length} pageSize={PAGE_SIZE} onPage={setDupPage} />
        </section>
      )}
    </div>
  );
}
