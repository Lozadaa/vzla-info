import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "../../components/SiteHeader";
import { PageIntro } from "../../components/PageIntro";
import { Notice } from "../../components/Notice";
import { MuroModeration } from "./MuroModeration";
import { getMuroPending } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Revisar muro",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function Page() {
  // Control de acceso: solo moderadores (igual que /admin).
  const supabase = await createClient();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: profile } = user
      ? await supabase.from("profiles").select("id").eq("id", user.id).maybeSingle()
      : { data: null };

    if (!profile) {
      return (
        <>
          <SiteHeader back={{ href: "/muro", label: "Muro" }} />
          <main id="contenido" className="shell py-8">
            <Notice tone="warn">
              Necesitas iniciar sesión como moderador para revisar el muro.{" "}
              <Link href="/admin" className="font-semibold underline underline-offset-2">
                Ir al acceso de moderación
              </Link>
              .
            </Notice>
          </main>
        </>
      );
    }
  }

  const pending = await getMuroPending();

  return (
    <>
      <SiteHeader back={{ href: "/admin", label: "Moderación" }} />
      <main id="contenido">
        <PageIntro
          eyebrow="Moderación · Muro"
          title="Tweets pendientes"
          lead="Confirma la categoría de triage y aprueba para publicar, o rechaza. Verifica la fuente antes de aprobar."
          accent="var(--color-alert)"
        />
        <div className="shell pb-12">
          <MuroModeration initialPosts={pending} />
        </div>
      </main>
    </>
  );
}
