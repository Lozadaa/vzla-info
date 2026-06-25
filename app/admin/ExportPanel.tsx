"use client";

import { createClient } from "@/lib/supabase/client";
import { downloadCSV } from "@/lib/csv";
import { Download } from "../components/icons";
import { TABLE_LABELS } from "./Moderation";

const EXPORTABLE = ["safe_reports", "missing_persons", "tips", "help_listings"];

// Descarga CSV de cada categoría para compartir con ONGs / autoridades. Solo
// se muestra a administradores (lo controla la página).
export function ExportPanel() {
  async function exportTable(table: string) {
    const supabase = createClient();
    if (!supabase) return;
    const { data } = await supabase
      .from(table)
      .select("*")
      .order("created_at", { ascending: false });
    downloadCSV(`${table}-${new Date().toISOString().slice(0, 10)}.csv`, data ?? []);
  }

  return (
    <div className="card p-4">
      <h2 className="font-bold">Exportar para ONGs / autoridades</h2>
      <p className="text-sm text-[var(--color-ink-soft)] mb-3">
        Descarga CSV con todos los registros de cada categoría.
      </p>
      <div className="flex flex-wrap gap-2">
        {EXPORTABLE.map((t) => (
          <button
            key={t}
            onClick={() => exportTable(t)}
            className="btn btn-ghost !min-h-[40px] text-sm"
          >
            <Download size={16} aria-hidden="true" /> {TABLE_LABELS[t]}
          </button>
        ))}
      </div>
    </div>
  );
}
