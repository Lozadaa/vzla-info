import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vzla Info — Gracias. La comunidad sigue unida.",
};

const STARS = Array.from({ length: 8 });

export default function Home() {
  return (
    <main
      style={{
        position: "relative",
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2.5rem 1.25rem",
        overflow: "hidden",
        // Bandera de Venezuela de fondo (franjas horizontales).
        background:
          "linear-gradient(to bottom, #f1c40f 0 33.34%, #1357be 33.34% 66.67%, #cf142b 66.67% 100%)",
      }}
    >
      {/* Arco de 8 estrellas blancas sobre la franja azul */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          justifyContent: "center",
          gap: "min(6vw, 3.5rem)",
          pointerEvents: "none",
          opacity: 0.95,
        }}
      >
        {STARS.map((_, i) => (
          <span
            key={i}
            style={{
              fontSize: "clamp(1rem, 3vw, 2rem)",
              color: "#fff",
              transform: `translateY(${i === 0 || i === 7 ? "10px" : i === 3 || i === 4 ? "-10px" : "0"})`,
            }}
          >
            ★
          </span>
        ))}
      </div>

      {/* Velo oscuro para legibilidad */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(8, 18, 33, 0.62)",
        }}
      />

      {/* Tarjeta del comunicado */}
      <article
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "44rem",
          background: "rgba(255, 255, 255, 0.97)",
          borderRadius: 16,
          padding: "clamp(1.5rem, 4vw, 2.75rem)",
          boxShadow: "0 30px 80px -30px rgba(0,0,0,0.6)",
          color: "var(--color-ink)",
        }}
      >
        <p
          className="eyebrow"
          style={{ color: "var(--color-flag-rojo)", letterSpacing: "0.12em" }}
        >
          Comunicado · Venezuela, junio 2026
        </p>

        <h1
          style={{
            marginTop: "0.75rem",
            fontSize: "clamp(1.8rem, 5vw, 2.6rem)",
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: "-0.02em",
          }}
        >
          Gracias. Sigamos juntos donde la comunidad ya está unida.
        </h1>

        <div
          style={{
            marginTop: "1.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.9rem",
            fontSize: "1.05rem",
            color: "var(--color-ink-soft)",
            lineHeight: 1.6,
          }}
        >
          <p>
            Creamos esta página —{" "}
            <a
              href="https://x.com/lozadapp"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--color-info)", fontWeight: 600 }}
            >
              @lozadapp
            </a>{" "}
            y{" "}
            <a
              href="https://x.com/sirubencho"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--color-info)", fontWeight: 600 }}
            >
              @sirubencho
            </a>
            — en las horas siguientes al terremoto, con una idea simple: reunir en
            un solo lugar lo esencial para reencontrarnos. Reportarse a salvo,
            buscar a un familiar, aportar información verificada y ubicar ayuda
            cercana.
          </p>
          <p>
            En estos días, dentro de la comunidad se formaron equipos que trabajan
            casi <strong style={{ color: "var(--color-ink)" }}>24/7</strong>{" "}
            organizando, normalizando y completando toda la data de la situación,
            con un alcance y una dedicación enormes. Lo más útil que podemos hacer
            es <strong style={{ color: "var(--color-ink)" }}>sumar fuerzas ahí</strong>,
            no dividirlas.
          </p>
          <p>
            Por eso retiramos esta herramienta y te dirigimos a las plataformas
            donde hoy está el esfuerzo principal:
          </p>
        </div>

        {/* Enlaces a las plataformas activas */}
        <div
          style={{
            marginTop: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          <a
            href="https://terremotovenezuela.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-block"
            style={{
              background: "var(--color-azul)",
              color: "#fff",
              justifyContent: "space-between",
              minHeight: 60,
              fontSize: "1.05rem",
            }}
          >
            <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1.2 }}>
              <span style={{ fontWeight: 700 }}>terremotovenezuela.app</span>
              <span style={{ fontWeight: 400, fontSize: "0.82rem", opacity: 0.9 }}>
                Mapa de emergencia, rescate y personas desaparecidas
              </span>
            </span>
            <span aria-hidden="true">→</span>
          </a>

          <a
            href="https://desaparecidosterremotovenezuela.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-block"
            style={{
              background: "var(--color-busco)",
              color: "#fff",
              justifyContent: "space-between",
              minHeight: 60,
              fontSize: "1.05rem",
            }}
          >
            <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1.2 }}>
              <span style={{ fontWeight: 700 }}>desaparecidosterremotovenezuela.com</span>
              <span style={{ fontWeight: 400, fontSize: "0.82rem", opacity: 0.9 }}>
                Registro de personas desaparecidas
              </span>
            </span>
            <span aria-hidden="true">→</span>
          </a>

          <a
            href="https://discord.gg/5hhaQxU3PM"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-block"
            style={{
              background: "#5865F2",
              color: "#fff",
              justifyContent: "space-between",
              minHeight: 60,
              fontSize: "1.05rem",
            }}
          >
            <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1.2 }}>
              <span style={{ fontWeight: 700 }}>Discord de voluntarios</span>
              <span style={{ fontWeight: 400, fontSize: "0.82rem", opacity: 0.9 }}>
                Únete al equipo que coordina la data y los rescates
              </span>
            </span>
            <span aria-hidden="true">→</span>
          </a>
        </div>

        {/* Créditos */}
        <footer
          style={{
            marginTop: "1.75rem",
            paddingTop: "1.25rem",
            borderTop: "1px solid var(--color-line)",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.75rem",
            fontSize: "0.9rem",
            color: "var(--color-ink-soft)",
          }}
        >
          <span>
            Hecho con cariño por{" "}
            <a href="https://x.com/lozadapp" target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600, color: "var(--color-ink)" }}>
              @lozadapp
            </a>{" "}
            y{" "}
            <a href="https://x.com/sirubencho" target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600, color: "var(--color-ink)" }}>
              @sirubencho
            </a>
            .
          </span>
          <span style={{ fontWeight: 600, color: "var(--color-ink)" }}>
            Por los que faltan. Por los que esperan.
          </span>
        </footer>
      </article>
    </main>
  );
}
