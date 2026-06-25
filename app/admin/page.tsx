import type { Metadata } from "next";
import { SiteHeader } from "../components/SiteHeader";
import { Notice } from "../components/Notice";
import { LoginForm } from "./LoginForm";
import { Moderation, QueueItem } from "./Moderation";
import { MatchPanel, MatchItem } from "./MatchPanel";
import { ExportPanel } from "./ExportPanel";
import { MuroReviewCard } from "./MuroReviewCard";
import { VisitsPanel, VisitStats } from "./VisitsPanel";
import { createClient } from "@/lib/supabase/server";
import { getMuroPending } from "@/lib/data";
import { categoryLabel } from "@/lib/types";

export const metadata: Metadata = {
  title: "Moderación",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

// Super-admins (dueños) que pueden ver la analítica de visitas. DEBE coincidir
// con la función is_superadmin() de la migración 20260625170000_page_views.sql.
const SUPER_ADMINS = ["rubendsemprunc@gmail.com", "rlozada808@gmail.com"];

export default async function Page() {
  const supabase = await createClient();

  // Sin backend configurado
  if (!supabase) {
    return (
      <Shell>
        <Notice tone="warn">
          El panel de moderación necesita Supabase configurado. Copia{" "}
          <code>.env.example</code> a <code>.env.local</code>, ejecuta{" "}
          <code>supabase/schema.sql</code> y crea un moderador en la tabla{" "}
          <code>profiles</code>.
        </Notice>
      </Shell>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Shell>
        <LoginForm />
      </Shell>
    );
  }

  // ¿Es moderador?
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, email")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    return (
      <Shell>
        <Notice tone="error">
          Tu cuenta no tiene permisos de moderación. Pide a un administrador que
          te agregue a la tabla <code>profiles</code>.
        </Notice>
      </Shell>
    );
  }

  // Cargar pendientes (todos), publicados (solo admin), coincidencias y muro.
  const isAdmin = profile.role === "admin";
  // Solo los dueños ven la analítica. El correo viene de Auth (verificado),
  // no de profiles; ningún otro correo carga estos datos.
  const isSuper = Boolean(user.email && SUPER_ADMINS.includes(user.email.toLowerCase()));
  const [items, published, matches, muroPending, visits] = await Promise.all([
    loadQueue(supabase),
    isAdmin ? loadPublished(supabase) : Promise.resolve([] as QueueItem[]),
    loadMatches(supabase),
    getMuroPending(),
    isSuper ? loadVisits(supabase) : Promise.resolve(null),
  ]);

  return (
    <Shell>
      <div className="flex flex-col gap-5">
        {/* Visitas reales a la web — solo super-admins (dueños) */}
        {isSuper && <VisitsPanel stats={visits} />}

        {/* 1 · Descargar (export CSV) — arriba del todo, solo admin */}
        {isAdmin && <ExportPanel />}

        {/* 2 · Posibles duplicados / reencuentros */}
        <MatchPanel matches={matches} />

        {/* 3 · Revisar muro de emergencia, con preview paginado */}
        <MuroReviewCard pending={muroPending} />

        {/* 4 · Cola de moderación (pendientes + publicados), paginada */}
        <Moderation
          items={items}
          published={published}
          role={profile.role as "admin" | "volunteer"}
          email={profile.email ?? user.email ?? ""}
        />
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader back={{ href: "/", label: "Inicio" }} />
      <main id="contenido" className="shell py-8">
        {children}
      </main>
    </>
  );
}

type DB = NonNullable<Awaited<ReturnType<typeof createClient>>>;

// Posibles coincidencias (reencuentros + duplicados) detectadas por el motor.
async function loadMatches(supabase: DB): Promise<MatchItem[]> {
  const { data: pms } = await supabase
    .from("possible_matches")
    .select("*")
    .eq("status", "pending")
    .order("score", { ascending: false })
    .limit(150);
  if (!pms || pms.length === 0) return [];

  const missingIds = new Set<string>();
  const safeIds = new Set<string>();
  for (const p of pms) {
    missingIds.add(p.missing_id);
    if (p.other_missing_id) missingIds.add(p.other_missing_id);
    if (p.safe_id) safeIds.add(p.safe_id);
  }

  const [{ data: missing }, { data: safes }] = await Promise.all([
    supabase
      .from("missing_persons")
      .select("id, full_name, age, last_seen_zone, last_seen_at, description, photo_url, contact_whatsapp")
      .in("id", [...missingIds]),
    safeIds.size
      ? supabase.from("safe_reports").select("id, full_name, zone").in("id", [...safeIds])
      : Promise.resolve({ data: [] as { id: string; full_name: string; zone: string }[] }),
  ]);

  const mMap = new Map((missing ?? []).map((m) => [m.id, m]));
  const sMap = new Map((safes ?? []).map((s) => [s.id, s]));

  const out: MatchItem[] = [];
  for (const p of pms) {
    const m = mMap.get(p.missing_id);
    if (!m) continue;
    if (p.kind === "reencuentro") {
      const s = p.safe_id ? sMap.get(p.safe_id) : null;
      if (!s) continue;
      out.push({
        id: p.id, kind: "reencuentro", score: p.score,
        missing_id: m.id, missing_name: m.full_name, missing_zone: m.last_seen_zone, missing_photo: m.photo_url,
        safe_id: s.id, safe_name: s.full_name, safe_zone: s.zone,
      });
    } else {
      const o = p.other_missing_id ? mMap.get(p.other_missing_id) : null;
      if (!o) continue;
      out.push({
        id: p.id, kind: "duplicado", score: p.score,
        missing_id: m.id, missing_name: m.full_name, missing_zone: m.last_seen_zone, missing_photo: m.photo_url,
        missing_age: m.age, missing_date: m.last_seen_at, missing_desc: m.description, missing_contact: m.contact_whatsapp,
        other_id: o.id, other_name: o.full_name, other_zone: o.last_seen_zone, other_photo: o.photo_url,
        other_age: o.age, other_date: o.last_seen_at, other_desc: o.description, other_contact: o.contact_whatsapp,
      });
    }
  }
  return out;
}

// Cifras de visitas (analítica propia). Devuelve null si la migración aún no
// se aplicó (la función RPC no existe), para no romper el panel.
async function loadVisits(supabase: DB): Promise<VisitStats | null> {
  try {
    const { data, error } = await supabase.rpc("visit_stats");
    if (error || !data) return null;
    return data as unknown as VisitStats;
  } catch {
    return null;
  }
}

async function loadQueue(supabase: DB): Promise<QueueItem[]> {
  const pending = (t: string) =>
    supabase.from(t).select("*").eq("status", "pending").order("created_at", { ascending: false });

  const [safe, missing, tips, help, mods] = await Promise.all([
    pending("safe_reports"),
    pending("missing_persons"),
    pending("tips"),
    pending("help_listings"),
    pending("modification_requests"),
  ]);

  const items: QueueItem[] = [];

  for (const r of safe.data ?? []) {
    items.push({
      table: "safe_reports",
      id: r.id,
      title: r.full_name,
      meta: `Estoy a salvo · ${r.zone}`,
      body: r.message,
      contact: r.contact_whatsapp,
      created_at: r.created_at,
    });
  }
  for (const r of missing.data ?? []) {
    items.push({
      table: "missing_persons",
      id: r.id,
      title: r.full_name + (r.age ? `, ${r.age} años` : ""),
      meta: `Buscada · última vez en ${r.last_seen_zone}`,
      body: r.description,
      contact: r.contact_whatsapp,
      image: r.photo_url,
      created_at: r.created_at,
    });
  }
  for (const r of tips.data ?? []) {
    items.push({
      table: "tips",
      id: r.id,
      title: r.person_name ? `Dato sobre ${r.person_name}` : "Información aportada",
      meta: r.zone ? `Zona: ${r.zone}` : "Sin zona indicada",
      body: r.info,
      contact: r.contact_whatsapp,
      created_at: r.created_at,
    });
  }
  for (const r of help.data ?? []) {
    items.push({
      table: "help_listings",
      id: r.id,
      title: r.title,
      meta: `${r.kind === "offer" ? "Ofrece" : "Necesita"} · ${categoryLabel(r.category)} · ${r.zone}`,
      body: r.description,
      contact: r.contact_whatsapp,
      created_at: r.created_at,
    });
  }
  for (const r of mods.data ?? []) {
    items.push({
      table: "modification_requests",
      id: r.id,
      title: "Solicitud de modificación",
      meta: `${r.target_table} · ${r.target_id}`,
      body:
        [r.requested_full_name && `Nombre: ${r.requested_full_name}`, r.requested_zone && `Zona: ${r.requested_zone}`, r.note]
          .filter(Boolean)
          .join(" · ") || null,
      contact: null,
      created_at: r.created_at,
    });
  }

  return items.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

// Contenido público (approved) que un admin puede eliminar.
async function loadPublished(supabase: DB): Promise<QueueItem[]> {
  const approved = (t: string) =>
    supabase.from(t).select("*").eq("status", "approved").order("created_at", { ascending: false });

  const [safe, missing, help] = await Promise.all([
    approved("safe_reports"),
    approved("missing_persons"),
    approved("help_listings"),
  ]);

  const items: QueueItem[] = [];

  for (const r of safe.data ?? []) {
    items.push({
      table: "safe_reports",
      id: r.id,
      title: r.full_name,
      meta: `A salvo · ${r.zone}`,
      created_at: r.created_at,
    });
  }
  for (const r of missing.data ?? []) {
    items.push({
      table: "missing_persons",
      id: r.id,
      title: r.full_name + (r.age ? `, ${r.age} años` : ""),
      meta: `Buscada · ${r.last_seen_zone}`,
      image: r.photo_url,
      created_at: r.created_at,
    });
  }
  for (const r of help.data ?? []) {
    items.push({
      table: "help_listings",
      id: r.id,
      title: r.title,
      meta: `${r.kind === "offer" ? "Ofrece" : "Necesita"} · ${categoryLabel(r.category)} · ${r.zone}`,
      created_at: r.created_at,
    });
  }

  return items.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}
