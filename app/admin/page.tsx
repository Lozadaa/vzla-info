import type { Metadata } from "next";
import { SiteHeader } from "../components/SiteHeader";
import { Notice } from "../components/Notice";
import { LoginForm } from "./LoginForm";
import { Moderation, QueueItem } from "./Moderation";
import { createClient } from "@/lib/supabase/server";
import { categoryLabel } from "@/lib/types";

export const metadata: Metadata = {
  title: "Moderación",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

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

  // Cargar pendientes de todas las tablas
  const items = await loadQueue(supabase);

  return (
    <Shell>
      <Moderation
        items={items}
        role={profile.role as "admin" | "volunteer"}
        email={profile.email ?? user.email ?? ""}
      />
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
