import "server-only";
import { createClient } from "./supabase/server";
import { DEMO_HELP, DEMO_MISSING } from "./demo";
import { muroListApproved, muroListPending } from "./muro/db";
import type { HelpListing, MissingPerson, MuroPost, SafeReport } from "./types";

/** Tweets del muro aprobados (públicos). */
export async function getMuroPosts(): Promise<MuroPost[]> {
  return muroListApproved();
}

/** Tweets del muro pendientes de moderación. */
export async function getMuroPending(): Promise<MuroPost[]> {
  return muroListPending();
}

/**
 * Personas buscadas aprobadas.
 * @param limit si se indica, trae solo esas N (p.ej. el preview del inicio).
 *   Sin límite, pagina hasta traerlas TODAS.
 */
export async function getMissingPersons(limit?: number): Promise<MissingPerson[]> {
  const supabase = await createClient();
  if (!supabase) {
    return typeof limit === "number" ? DEMO_MISSING.slice(0, limit) : DEMO_MISSING;
  }

  const base = () =>
    supabase
      .from("missing_persons")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false });

  // Caso preview: una sola consulta acotada.
  if (typeof limit === "number") {
    const { data } = await base().range(0, limit - 1);
    return (data as MissingPerson[]) ?? [];
  }

  // Caso completo: Supabase/PostgREST devuelve máx. 1000 filas por petición,
  // y hay >1900 personas. Paginamos por bloques hasta traerlas todas.
  const PAGE = 1000;
  const all: MissingPerson[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await base().range(from, from + PAGE - 1);
    if (error || !data || data.length === 0) break;
    all.push(...(data as MissingPerson[]));
    if (data.length < PAGE) break;
  }
  return all;
}

export async function getMissingPerson(id: string): Promise<MissingPerson | null> {
  const supabase = await createClient();
  if (!supabase) return DEMO_MISSING.find((p) => p.id === id) ?? null;
  const { data } = await supabase
    .from("missing_persons")
    .select("*")
    .eq("id", id)
    .eq("status", "approved")
    .maybeSingle();
  return (data as MissingPerson) ?? null;
}

export async function getSafeReports(): Promise<SafeReport[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("safe_reports")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false });
  return (data as SafeReport[]) ?? [];
}

export async function getHelpListings(): Promise<HelpListing[]> {
  const supabase = await createClient();
  if (!supabase) return DEMO_HELP;
  const { data } = await supabase
    .from("help_listings")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false });
  return (data as HelpListing[]) ?? [];
}
