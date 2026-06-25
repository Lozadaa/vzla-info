"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export interface MatchItem {
  id: string;
  kind: "reencuentro" | "duplicado";
  score: number;
  missing_id: string;
  missing_name: string;
  missing_zone: string;
  missing_photo: string | null;
  // reencuentro
  safe_id?: string | null;
  safe_name?: string | null;
  safe_zone?: string | null;
  // duplicado
  other_id?: string | null;
  other_name?: string | null;
  other_zone?: string | null;
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

  const reencuentros = list.filter((m) => m.kind === "reencuentro");
  const duplicados = list.filter((m) => m.kind === "duplicado");

  async function resolve(m: MatchItem, action: "confirm" | "dismiss") {
    const supabase = createClient();
    if (!supabase) return;
    setBusy(m.id);

    if (action === "confirm" && m.kind === "reencuentro") {
      await supabase.from("missing_persons").update({ found: true }).eq("id", m.missing_id);
    }
    if (action === "confirm" && m.kind === "duplicado" && m.other_id) {
      // Oculta el reporte repetido; conserva el principal.
      await supabase.from("missing_persons").update({ status: "rejected" }).eq("id", m.other_id);
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
            {reencuentros.map((m) => (
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
            {duplicados.map((m) => (
              <li key={m.id} className="card p-4" style={{ borderLeft: "5px solid var(--color-oro)" }}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0 text-sm">
                    <p>
                      <span className="font-bold">Conservar:</span> {m.missing_name}{" "}
                      <span className="text-[var(--color-ink-soft)]">({m.missing_zone})</span>
                    </p>
                    <p>
                      <span className="font-bold">Ocultar repetido:</span> {m.other_name}{" "}
                      <span className="text-[var(--color-ink-soft)]">({m.other_zone})</span>
                    </p>
                    <p className="folio mt-1">similitud {(m.score * 100).toFixed(0)}%</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => resolve(m, "confirm")} disabled={busy === m.id} className="btn !min-h-[44px] text-sm" style={{ background: "var(--color-oro)", color: "#fff" }}>
                      Es duplicado
                    </button>
                    <button onClick={() => resolve(m, "dismiss")} disabled={busy === m.id} className="btn btn-ghost !min-h-[44px] text-sm">
                      Son distintas
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
