import type { Metadata } from "next";
import { SiteHeader } from "../../components/SiteHeader";
import { PageIntro } from "../../components/PageIntro";
import { MuroModeration } from "./MuroModeration";
import { getMuroPending } from "@/lib/data";

export const metadata: Metadata = {
  title: "Revisar muro",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function Page() {
  const pending = await getMuroPending();

  return (
    <>
      <SiteHeader back={{ href: "/muro", label: "Muro" }} />
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
