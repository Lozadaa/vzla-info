import "server-only";
import { createClient } from "./supabase/server";
import { DEMO_HELP, DEMO_MISSING } from "./demo";
import { muroListApproved, muroListPending } from "./muro/db";
import { aggregateZones, type ZoneCluster } from "./geo";
import type { HelpListing, MissingPerson, MuroPost, SafeReport } from "./types";

export interface SituationData {
  clusters: ZoneCluster[];
  located: number;
  unlocated: number;
  total: number;
}

/** Datos del mapa de situación: personas buscadas agregadas por localidad. */
export async function getSituationMap(): Promise<SituationData> {
  const supabase = await createClient();
  if (!supabase) return { clusters: [], located: 0, unlocated: 0, total: 0 };

  // La vista vu_missing_zones devuelve {zone, n}. Puede tener miles de filas
  // (PostgREST limita a 1000 por petición); paginamos hasta traerlas todas.
  const PAGE = 1000;
  const rows: { zone: string; n: number }[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("vu_missing_zones")
      .select("zone, n")
      .range(from, from + PAGE - 1);
    if (error || !data || data.length === 0) break;
    rows.push(...(data as { zone: string; n: number }[]));
    if (data.length < PAGE) break;
  }

  const { clusters, located, unlocated } = aggregateZones(rows);
  return { clusters, located, unlocated, total: located + unlocated };
}

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
      .eq("found", false) // los reencontrados salen de la búsqueda activa
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

/** Cuántas personas fueron reencontradas (contador público de esperanza). */
export async function getReunionsCount(): Promise<number> {
  const supabase = await createClient();
  if (!supabase) return 0;
  const { data } = await supabase.from("vu_reunions_count").select("reunions").maybeSingle();
  return ((data?.reunions as number | undefined) ?? 0) || 0;
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
