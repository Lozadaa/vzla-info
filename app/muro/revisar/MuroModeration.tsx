"use client";

import { useState } from "react";
import {
  MURO_CATEGORIES,
  type MuroCategory,
  type MuroPost,
} from "@/lib/types";
import { TweetCard } from "../TweetCard";

export function MuroModeration({
  initialPosts,
  published: publishedInit = [],
  isAdmin = false,
}: {
  initialPosts: MuroPost[];
  published?: MuroPost[];
  isAdmin?: boolean;
}) {
  const [queue, setQueue] = useState<MuroPost[]>(initialPosts);
  const [published, setPublished] = useState<MuroPost[]>(publishedInit);
  const [cats, setCats] = useState<Record<string, MuroCategory>>(
    Object.fromEntries(initialPosts.map((p) => [p.id, p.category])),
  );
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function decide(post: MuroPost, status: "approved" | "rejected") {
    setBusy(post.id);
    setError(null);
    try {
      const res = await fetch("/api/muro/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: post.id,
          status,
          category: cats[post.id] ?? post.category,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "No se pudo guardar.");
      }
      setQueue((q) => q.filter((p) => p.id !== post.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido.");
    } finally {
      setBusy(null);
    }
  }

  // Eliminar un publicado en dos pasos (el primer toque pide confirmación).
  async function remove(post: MuroPost) {
    if (confirmId !== post.id) {
      setConfirmId(post.id);
      return;
    }
    setBusy(post.id);
    setError(null);
    try {
      const res = await fetch(`/api/muro/moderate?id=${encodeURIComponent(post.id)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "No se pudo eliminar.");
      }
      setPublished((p) => p.filter((x) => x.id !== post.id));
      setConfirmId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col gap-10">
      {error && (
        <p
          className="rounded-lg px-3 py-2 text-sm"
          style={{ background: "var(--color-alert-soft)", color: "var(--color-alert)" }}
        >
          {error}
        </p>
      )}

      {/* Pendientes */}
      <section className="flex flex-col gap-5">
        <p className="text-sm text-[var(--color-ink-soft)]">
          {queue.length} pendiente{queue.length === 1 ? "" : "s"} por revisar
        </p>

        {queue.length === 0 ? (
          <p className="card p-8 text-center text-[var(--color-ink-soft)]">
            No hay tweets pendientes por revisar.
          </p>
        ) : (
          <ul className="flex flex-col gap-6">
            {queue.map((post) => {
              const preview = { ...post, category: cats[post.id] ?? post.category };
              return (
                <li key={post.id} className="grid gap-3 lg:grid-cols-[1fr_320px]">
                  <TweetCard post={preview} />

                  <div className="card flex flex-col gap-3 p-4">
                    <div>
                      <span className="field-label">Categoría de triage</span>
                      <div className="flex flex-col gap-1.5">
                        {MURO_CATEGORIES.map((c) => (
                          <label key={c.key} className="flex items-center gap-2 text-sm">
                            <input
                              type="radio"
                              name={`cat-${post.id}`}
                              checked={(cats[post.id] ?? post.category) === c.key}
                              onChange={() => setCats((m) => ({ ...m, [post.id]: c.key }))}
                            />
                            <span
                              className="inline-block h-3 w-3 rounded-full"
                              style={{ background: c.accent }}
                              aria-hidden="true"
                            />
                            {c.triage} · {c.label}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="mt-auto flex gap-2">
                      <button
                        onClick={() => decide(post, "approved")}
                        disabled={busy === post.id}
                        className="btn btn-block !min-h-[44px] text-sm"
                        style={{ background: "var(--color-ok)", color: "#fff" }}
                      >
                        Aprobar
                      </button>
                      <button
                        onClick={() => decide(post, "rejected")}
                        disabled={busy === post.id}
                        className="btn btn-ghost !min-h-[44px] text-sm"
                      >
                        Rechazar
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Publicados — eliminar (solo admin) */}
      {isAdmin && published.length > 0 && (
        <section className="flex flex-col gap-4">
          <div>
            <h2 className="eyebrow mb-1">Publicados · {published.length}</h2>
            <p className="text-sm text-[var(--color-ink-soft)]">
              Elimina un tweet del muro si es falso, duplicado o ya no aplica. Esta
              acción no se puede deshacer.
            </p>
          </div>
          <ul className="flex flex-col gap-6">
            {published.map((post) => (
              <li key={post.id} className="grid gap-3 lg:grid-cols-[1fr_320px]">
                <TweetCard post={post} />
                <div className="card flex flex-col justify-between gap-3 p-4">
                  <p className="text-sm text-[var(--color-ink-soft)]">
                    Publicado el muro. Solo un administrador puede eliminarlo.
                  </p>
                  <button
                    onClick={() => remove(post)}
                    disabled={busy === post.id}
                    className="btn !min-h-[44px] text-sm"
                    style={{ background: "var(--color-danger)", color: "#fff" }}
                  >
                    {confirmId === post.id ? "Confirmar eliminación" : "Eliminar"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
