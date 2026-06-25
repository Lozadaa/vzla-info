import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { MuroFeed } from "./MuroFeed";
import { SubmitTweet } from "./SubmitTweet";
import { getMuroPosts } from "@/lib/data";

export const metadata: Metadata = {
  title: "Muro de emergencia",
  description:
    "Reportes recopilados de redes sociales sobre personas desaparecidas y necesidades urgentes en Venezuela. Revisado por moderadores.",
};

export const dynamic = "force-dynamic";

export default async function Page() {
  const posts = await getMuroPosts();

  return (
    <>
      <SiteHeader back={{ href: "/", label: "Inicio" }} />
      <main id="contenido">
        {/* Banda de cabecera seria (emergencia, no marketing) */}
        <section
          className="border-b"
          style={{
            background: "var(--color-ink-emergency)",
            borderColor: "var(--color-ink-emergency)",
          }}
        >
          <div className="shell py-7 text-[#f4f6f8]">
            <p
              className="eyebrow"
              style={{ color: "var(--color-oro)" }}
            >
              Información ciudadana · recopilada de redes
            </p>
            <h1 className="mt-2 text-[2rem] sm:text-[2.6rem] font-extrabold leading-[1.05] text-white">
              Muro de emergencia
            </h1>
            <p className="mt-3 max-w-2xl text-[#c6ccd4]">
              Reportes sobre personas desaparecidas, quienes necesitan ayuda y
              quienes la ofrecen, tomados de publicaciones públicas. Cada uno se
              revisa antes de mostrarse.
            </p>
            <p
              className="mt-4 inline-flex items-start gap-2 rounded-lg px-3 py-2 text-sm"
              style={{ background: "rgba(193,18,31,0.18)", color: "#ffd9d9" }}
            >
              <span aria-hidden="true">⚠️</span>
              <span>
                Información <strong>no verificada de forma oficial</strong>.
                Confirma antes de actuar o difundir. Ante una emergencia,
                contacta a las autoridades.
              </span>
            </p>
          </div>
        </section>

        <div className="shell py-7 flex flex-col gap-6">
          <SubmitTweet />
          <MuroFeed initialPosts={posts} />

          <p className="text-center text-sm text-[var(--color-ink-soft)]">
            ¿Eres moderador?{" "}
            <Link href="/muro/revisar" className="font-semibold underline">
              Revisar tweets pendientes
            </Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
