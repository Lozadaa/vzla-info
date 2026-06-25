"use client";

import { useState } from "react";
import {
  MURO_CATEGORIES,
  type MuroCategory,
  type MuroPost,
} from "@/lib/types";
import { TweetCard } from "../TweetCard";

export function MuroModeration({ initialPosts }: { initialPosts: MuroPost[] }) {
  const [queue, setQueue] = useState<MuroPost[]>(initialPosts);
  const [cats, setCats] = useState<Record<string, MuroCategory>>(
    Object.fromEntries(initialPosts.map((p) => [p.id, p.category])),
  );
  const [busy, setBusy] = useState<string | null>(null);
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

  if (queue.length === 0) {
    return (
      <p className="card p-8 text-center text-[var(--color-ink-soft)]">
        No hay tweets pendientes por revisar.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-[var(--color-ink-soft)]">
        {queue.length} pendiente{queue.length === 1 ? "" : "s"}
      </p>

      {error && (
        <p
          className="rounded-lg px-3 py-2 text-sm"
          style={{ background: "var(--color-alert-soft)", color: "var(--color-alert)" }}
        >
          {error}
        </p>
      )}

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
                      <label
                        key={c.key}
                        className="flex items-center gap-2 text-sm"
                      >
                        <input
                          type="radio"
                          name={`cat-${post.id}`}
                          checked={(cats[post.id] ?? post.category) === c.key}
                          onChange={() =>
                            setCats((m) => ({ ...m, [post.id]: c.key }))
                          }
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
    </div>
  );
}
