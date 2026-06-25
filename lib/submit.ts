"use client";

import { createClient } from "./supabase/client";
import { makeFolio } from "./utils";

export interface SubmitResult {
  folio: string;
  demo: boolean;
}

/**
 * Inserta un reporte en la tabla indicada. Todo entra con status "pending".
 * En modo demo (sin Supabase configurado) simula el envío para poder
 * recorrer la app sin backend.
 */
export async function submitReport(
  table: string,
  payload: Record<string, unknown>,
  opts: { withFolio?: boolean } = {}
): Promise<SubmitResult> {
  const folio = makeFolio(table + JSON.stringify(payload) + Math.random());
  const row = opts.withFolio ? { ...payload, folio } : payload;

  const supabase = createClient();
  if (!supabase) {
    await new Promise((r) => setTimeout(r, 450));
    return { folio, demo: true };
  }

  const { error } = await supabase.from(table).insert(row);
  if (error) throw new Error(error.message);
  return { folio, demo: false };
}
