import { muroCategoryMeta, type MuroPost } from "@/lib/types";
import { formatDate, waLink } from "@/lib/utils";

// Tarjeta de un tweet recopilado. Tono de emergencia: triage por color,
// evidencia (screenshot), fuente original y aviso de "no verificado".
export function TweetCard({ post }: { post: MuroPost }) {
  const cat = muroCategoryMeta(post.category);

  const shareMsg = [
    `${cat.triage}: ${cat.label}`,
    post.zone ? `Zona: ${post.zone}` : "",
    "",
    post.text,
    "",
    `Fuente: ${post.tweet_url}`,
    "Vía Venezuela Unida",
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <article
      className="card overflow-hidden"
      style={{ borderLeft: `6px solid ${cat.accent}` }}
    >
      {/* Triage */}
      <div className="flex items-center justify-between gap-2 px-4 pt-3">
        <span
          className="tag"
          style={{ background: cat.accent, color: "#fff" }}
        >
          {cat.triage} · {cat.label}
        </span>
        {post.zone && (
          <span className="text-xs font-semibold text-[var(--color-ink-soft)]">
            📍 {post.zone}
          </span>
        )}
      </div>

      <div className="px-4 py-3">
        {/* Autor */}
        <div className="flex items-baseline gap-1.5 text-sm">
          <span className="font-extrabold text-[var(--color-ink)]">
            {post.author_name}
          </span>
          {post.author_verified && (
            <span title="Cuenta verificada" aria-label="Cuenta verificada">
              ✔️
            </span>
          )}
          {post.author_handle && (
            <span className="text-[var(--color-ink-faint)]">
              @{post.author_handle}
            </span>
          )}
        </div>

        {/* Texto */}
        <p className="mt-2 whitespace-pre-wrap text-[1rem] leading-relaxed">
          {post.text}
        </p>

        {/* Evidencia (screenshot) */}
        {post.image_url && (
          <div className="mt-3 overflow-hidden rounded-lg border border-[var(--color-line)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.image_url}
              alt={`Captura del tweet de ${post.author_name}`}
              loading="lazy"
              className="w-full"
            />
          </div>
        )}

        <p className="folio mt-3">{formatDate(post.created_at)}</p>
      </div>

      {/* Acciones */}
      <div className="flex flex-wrap gap-2 border-t border-[var(--color-line)] px-4 py-3">
        <a
          href={waLink(null, shareMsg)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-wa !min-h-[44px] text-sm"
        >
          Compartir por WhatsApp
        </a>
        <a
          href={post.tweet_url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost !min-h-[44px] text-sm"
        >
          Ver original en X ↗
        </a>
      </div>
    </article>
  );
}
