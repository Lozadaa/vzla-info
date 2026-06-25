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

/** Personas buscadas aprobadas y aún no encontradas. */
export async function getMissingPersons(): Promise<MissingPerson[]> {
  const supabase = await createClient();
  if (!supabase) return DEMO_MISSING;
  const { data } = await supabase
    .from("missing_persons")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false });
  return (data as MissingPerson[]) ?? [];
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
