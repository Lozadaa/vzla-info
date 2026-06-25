import type { Metadata } from "next";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { PageIntro } from "../components/PageIntro";
import { MapPin, Box } from "../components/icons";
import { getAcopios, type Acopio } from "@/lib/acopios";

export const metadata: Metadata = {
  title: "Centros de acopio",
  description:
    "Dónde llevar donaciones para los afectados por el terremoto: agua, alimentos, insumos médicos, ropa y más, por ciudad.",
};

export const revalidate = 1800;

const nf = new Intl.NumberFormat("es-VE");

/** Enlace de contacto: detecta URL (Instagram/web) o handle; el resto, texto. */
function Contact({ value }: { value: string }) {
  if (!value) return null;
  const isUrl = /^https?:\/\//i.test(value);
  const isHandle = value.startsWith("@");
  if (isUrl || isHandle) {
    const href = isHandle ? `https://instagram.com/${value.slice(1)}` : value;
    const label = /instagram/i.test(value) || isHandle ? "Instagram" : "Enlace";
    return (
      <a href={href} target="_blank" rel="noopener" className="font-semibold underline underline-offset-2" style={{ color: "var(--color-info)" }}>
        {label}
      </a>
    );
  }
  return <span className="folio">{value}</span>;
}

export default async function Page() {
  const acopios = await getAcopios();

  // Agrupar por ciudad, ciudades con más centros primero.
  const byCity = new Map<string, Acopio[]>();
  for (const a of acopios) {
    const city = a.city || "Otras";
    (byCity.get(city) ?? byCity.set(city, []).get(city)!).push(a);
  }
  const cities = [...byCity.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));

  return (
    <>
      <SiteHeader back={{ href: "/", label: "Inicio" }} />
      <main id="contenido">
        <PageIntro
          eyebrow="Centros de acopio"
          title="Dónde llevar donaciones"
          lead="Puntos de recolección para los afectados por el terremoto: agua, alimentos no perecederos, insumos médicos, ropa y más. Confirma horarios por el contacto antes de ir."
          accent="var(--color-ayuda)"
        />

        <div className="shell pb-12 flex flex-col gap-6">
          {/* Cifras */}
          <div className="grid grid-cols-2 gap-3 sm:max-w-md">
            <div className="card p-4 text-center">
              <p className="text-[1.7rem] font-extrabold tabular-nums leading-none" style={{ color: "var(--color-ayuda)" }}>
                {nf.format(acopios.length)}
              </p>
              <p className="mt-1 text-xs text-[var(--color-ink-soft)]">centros de acopio</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-[1.7rem] font-extrabold tabular-nums leading-none">{nf.format(cities.length)}</p>
              <p className="mt-1 text-xs text-[var(--color-ink-soft)]">ciudades</p>
            </div>
          </div>

          {acopios.length === 0 ? (
            <p className="card p-6 text-center text-[var(--color-ink-soft)]">
              No pudimos cargar los centros de acopio en este momento. Intenta de nuevo en unos minutos.
            </p>
          ) : (
            cities.map(([city, list]) => (
              <section key={city}>
                <h2 className="eyebrow mb-2 flex items-center gap-2" style={{ color: "var(--color-ayuda)" }}>
                  <Box size={15} aria-hidden="true" />
                  {city} · {list.length}
                </h2>
                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {list.map((a, i) => (
                    <li key={`${city}-${i}`} className="card min-w-0 p-4 flex flex-col gap-1.5" style={{ borderLeft: "5px solid var(--color-ayuda)" }}>
                      <h3 className="font-bold leading-tight break-words">{a.who || "Centro de acopio"}</h3>
                      {a.address && (
                        <p className="flex min-w-0 items-start gap-1.5 text-sm text-[var(--color-ink-soft)]">
                          <MapPin size={15} aria-hidden="true" className="mt-0.5 shrink-0 text-[var(--color-ink-faint)]" />
                          <span className="min-w-0 break-words">{a.address}</span>
                        </p>
                      )}
                      {a.receives && a.receives.toLowerCase() !== "venezuela" && (
                        <p className="text-sm break-words">
                          <span className="font-semibold">Reciben:</span> {a.receives}
                        </p>
                      )}
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                        {a.contact && (
                          <span className="flex min-w-0 items-center gap-1.5">
                            <span className="shrink-0 text-[var(--color-ink-faint)]">Contacto:</span>
                            <span className="min-w-0 break-words">
                              <Contact value={a.contact} />
                            </span>
                          </span>
                        )}
                        {a.lat != null && a.lng != null && (
                          <a
                            href={`https://www.google.com/maps?q=${a.lat},${a.lng}`}
                            target="_blank"
                            rel="noopener"
                            className="font-semibold underline underline-offset-2"
                            style={{ color: "var(--color-ayuda)" }}
                          >
                            Cómo llegar →
                          </a>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}

          <p className="text-xs text-[var(--color-ink-faint)]">
            Lista comunitaria; los puntos y horarios pueden cambiar. Si conoces un centro que falta o uno que cerró, repórtalo para mantenerla al día.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
