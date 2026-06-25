"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MURO_CATEGORIES, type MuroCategory, type MuroPost } from "@/lib/types";
import { TweetCard } from "./TweetCard";

const POLL_MS = 30_000; // refresco "en vivo"
type Filter = MuroCategory | "todos";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "desaparecido", label: "Críticos" },
  { key: "necesita_ayuda", label: "Necesitan ayuda" },
  { key: "ofrece_ayuda", label: "Ofrecen ayuda" },
];

export function MuroFeed({ initialPosts }: { initialPosts: MuroPost[] }) {
  const [posts, setPosts] = useState<MuroPost[]>(initialPosts);
  const [filter, setFilter] = useState<Filter>("todos");
  const [q, setQ] = useState("");
  const [pending, setPending] = useState<MuroPost[]>([]);
  const knownIds = useRef(new Set(initialPosts.map((p) => p.id)));

  // Refresco en vivo: detecta nuevos sin mover la vista.
  useEffect(() => {
    const t = setInterval(async () => {
      try {
        const res = await fetch("/api/muro", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { posts: MuroPost[] };
        const fresh = data.posts.filter((p) => !knownIds.current.has(p.id));
        if (fresh.length) {
          fresh.forEach((p) => knownIds.current.add(p.id));
          setPending((prev) => [...fresh, ...prev]);
        }
      } catch {
        /* reintenta al próximo ciclo */
      }
    }, POLL_MS);
    return () => clearInterval(t);
  }, []);

  function revealPending() {
    setPosts((prev) => [...pending, ...prev]);
    setPending([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return posts.filter((p) => {
      if (filter !== "todos" && p.category !== filter) return false;
      if (!term) return true;
      return (
        p.text.toLowerCase().includes(term) ||
        p.author_name.toLowerCase().includes(term) ||
        (p.zone?.toLowerCase().includes(term) ?? false)
      );
    });
  }, [posts, filter, q]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { todos: posts.length };
    for (const cat of MURO_CATEGORIES) {
      c[cat.key] = posts.filter((p) => p.category === cat.key).length;
    }
    return c;
  }, [posts]);

  return (
    <div className="flex flex-col gap-4">
      {/* Buscador */}
      <div>
        <label htmlFor="muro-buscar" className="sr-only">
          Buscar por nombre, zona o palabra
        </label>
        <input
          id="muro-buscar"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="input"
          placeholder="Buscar por nombre, zona o palabra…"
        />
      </div>

      {/* Filtros de triage */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por urgencia">
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(f.key)}
              className="btn !min-h-[40px] text-sm"
              style={
                active
                  ? { background: "var(--color-ink)", color: "#fff" }
                  : {
                      background: "var(--color-card)",
                      color: "var(--color-ink)",
                      border: "1px solid var(--color-line-strong)",
                    }
              }
            >
              {f.label}
              <span className="opacity-70">· {counts[f.key] ?? 0}</span>
            </button>
          );
        })}
      </div>

      {/* Nuevos en vivo */}
      {pending.length > 0 && (
        <button
          type="button"
          onClick={revealPending}
          className="btn btn-primary self-center"
        >
          ↑ {pending.length} {pending.length === 1 ? "nuevo" : "nuevos"}
        </button>
      )}

      {/* Cascada */}
      {filtered.length === 0 ? (
        <p className="card p-6 text-center text-[var(--color-ink-soft)]">
          No hay publicaciones que coincidan.
        </p>
      ) : (
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4 [&>*]:break-inside-avoid">
          {filtered.map((p) => (
            <TweetCard key={p.id} post={p} />
          ))}
        </div>
      )}
    </div>
  );
}
