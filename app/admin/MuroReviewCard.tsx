"use client";

import Link from "next/link";
import { muroCategoryMeta, type MuroPost } from "@/lib/types";
import { Pager, usePaged } from "../components/Pager";

const PAGE_SIZE = 5;

// Tarjeta de acceso a la moderación del muro + preview paginado de los tweets
// pendientes (solo lectura; la aprobación/rechazo se hace en /muro/revisar).
export function MuroReviewCard({ pending }: { pending: MuroPost[] }) {
  const { page, setPage, view, total, pageSize } = usePaged(pending, PAGE_SIZE);

  return (
    <section className="card overflow-hidden" style={{ borderLeft: "4px solid var(--color-alert)" }}>
      <Link
        href="/muro/revisar"
        className="flex items-center justify-between gap-4 p-4 hover:bg-[var(--color-paper-sunk)]"
      >
        <span className="min-w-0">
          <span className="block font-semibold text-lg">
            Revisar muro de emergencia
            {total > 0 && (
              <span
                className="ml-2 rounded-full px-2 py-0.5 text-xs font-bold align-middle"
                style={{ background: "var(--color-alert)", color: "#fff" }}
              >
                {total} pendiente{total === 1 ? "" : "s"}
              </span>
            )}
          </span>
          <span className="block text-sm text-[var(--color-ink-soft)]">
            Aprobar, rechazar o eliminar los tweets recopilados de redes.
          </span>
        </span>
        <span aria-hidden="true" className="shrink-0 text-[var(--color-ink-faint)]">→</span>
      </Link>

      {/* Preview paginado de pendientes */}
      {total > 0 && (
        <div className="border-t border-[var(--color-line)] p-4">
          <ul className="flex flex-col gap-2">
            {view.map((p) => {
              const cat = muroCategoryMeta(p.category);
              return (
                <li
                  key={p.id}
                  className="flex items-center gap-3 rounded-lg border p-2"
                  style={{ borderColor: "var(--color-line)" }}
                >
                  {p.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.image_url}
                      alt=""
                      className="h-12 w-12 shrink-0 rounded object-cover"
                      style={{ background: "var(--color-paper-sunk)" }}
                    />
                  ) : (
                    <div
                      className="h-12 w-12 shrink-0 rounded"
                      style={{ background: "var(--color-paper-sunk)" }}
                      aria-hidden="true"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="rounded px-1.5 py-0.5 text-[0.65rem] font-bold"
                        style={{ background: cat.accent, color: "#fff" }}
                      >
                        {cat.triage}
                      </span>
                      <span className="truncate text-sm font-semibold">{p.author_name}</span>
                    </div>
                    <p className="truncate text-xs text-[var(--color-ink-soft)]">{p.text}</p>
                  </div>
                </li>
              );
            })}
          </ul>
          <Pager page={page} total={total} pageSize={pageSize} onPage={setPage} />
        </div>
      )}
    </section>
  );
}
