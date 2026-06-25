"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import { Check } from "../components/icons";
import { Pager, usePaged } from "../components/Pager";

export interface QueueItem {
  table: string;
  id: string;
  title: string;
  meta: string;
  body?: string | null;
  contact?: string | null;
  image?: string | null;
  created_at: string;
}

export const TABLE_LABELS: Record<string, string> = {
  safe_reports: "Estoy a salvo",
  missing_persons: "Personas buscadas",
  tips: "Información aportada",
  help_listings: "Ayuda",
  modification_requests: "Solicitudes de cambio",
};

const PAGE_SIZE = 8;

export function Moderation({
  items,
  published: publishedInit,
  role,
  email,
}: {
  items: QueueItem[];
  published: QueueItem[];
  role: "admin" | "volunteer";
  email: string;
}) {
  const router = useRouter();
  const [queue, setQueue] = useState(items);
  const [published, setPublished] = useState(publishedInit);
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  async function decide(item: QueueItem, status: "approved" | "rejected") {
    const supabase = createClient();
    if (!supabase) return;
    setBusy(item.id);
    const { error } = await supabase.from(item.table).update({ status }).eq("id", item.id);
    setBusy(null);
    if (!error) setQueue((q) => q.filter((i) => i.id !== item.id));
  }

  // Borrado en dos pasos: el primer toque pide confirmación.
  async function remove(item: QueueItem) {
    if (confirmId !== item.id) {
      setConfirmId(item.id);
      return;
    }
    const supabase = createClient();
    if (!supabase) return;
    setBusy(item.id);
    const { error } = await supabase.from(item.table).delete().eq("id", item.id);
    setBusy(null);
    setConfirmId(null);
    if (!error) setPublished((p) => p.filter((i) => i.id !== item.id));
  }

  async function signOut() {
    const supabase = createClient();
    await supabase?.auth.signOut();
    router.refresh();
  }

  const grouped = queue.reduce<Record<string, QueueItem[]>>((acc, it) => {
    (acc[it.table] ??= []).push(it);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold">Cola de moderación</h2>
          <p className="text-sm text-[var(--color-ink-soft)]">
            {email} · rol <strong>{role === "admin" ? "Administrador" : "Voluntario"}</strong> ·{" "}
            {queue.length} pendiente{queue.length === 1 ? "" : "s"}
          </p>
        </div>
        <button onClick={signOut} className="btn btn-ghost !min-h-[44px] text-sm">
          Cerrar sesión
        </button>
      </div>

      {/* Colas de pendientes, agrupadas por tipo y paginadas */}
      {queue.length === 0 ? (
        <p className="card p-8 flex flex-col items-center gap-2 text-center text-[var(--color-ink-soft)]">
          <Check size={28} aria-hidden="true" style={{ color: "var(--color-ok)" }} />
          No hay nada pendiente por revisar. ¡Buen trabajo!
        </p>
      ) : (
        Object.entries(grouped).map(([table, list]) => (
          <QueueGroup key={table} table={table} list={list} busy={busy} onDecide={decide} />
        ))
      )}

      {/* Publicados — gestión y borrado (solo admin) */}
      {role === "admin" && published.length > 0 && (
        <PublishedList items={published} busy={busy} confirmId={confirmId} onRemove={remove} />
      )}
    </div>
  );
}

// Un grupo de pendientes (por tipo de reporte), paginado.
function QueueGroup({
  table,
  list,
  busy,
  onDecide,
}: {
  table: string;
  list: QueueItem[];
  busy: string | null;
  onDecide: (item: QueueItem, status: "approved" | "rejected") => void;
}) {
  const { page, setPage, view, total, pageSize } = usePaged(list, PAGE_SIZE);
  return (
    <section>
      <h2 className="eyebrow mb-2">
        {TABLE_LABELS[table]} · {total}
      </h2>
      <ul className="flex flex-col gap-3">
        {view.map((item) => (
          <li key={item.id} className="card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex gap-3">
                {item.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image}
                    alt={`Foto de ${item.title}`}
                    className="h-24 w-20 shrink-0 rounded-md object-cover border"
                    style={{ borderColor: "var(--color-line)" }}
                  />
                )}
                <div className="min-w-0">
                  <h3 className="font-extrabold">{item.title}</h3>
                  <p className="text-sm text-[var(--color-ink-soft)]">{item.meta}</p>
                  {item.body && <p className="mt-1 text-sm">{item.body}</p>}
                  {item.contact && <p className="mt-1 folio">WhatsApp: {item.contact}</p>}
                  <p className="mt-1 text-xs text-[var(--color-ink-faint)]">
                    {formatDate(item.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => onDecide(item, "approved")}
                  disabled={busy === item.id}
                  className="btn !min-h-[44px] text-sm"
                  style={{ background: "var(--color-ok)", color: "#fff" }}
                >
                  Aprobar
                </button>
                <button
                  onClick={() => onDecide(item, "rejected")}
                  disabled={busy === item.id}
                  className="btn btn-ghost !min-h-[44px] text-sm"
                >
                  Rechazar
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <Pager page={page} total={total} pageSize={pageSize} onPage={setPage} />
    </section>
  );
}

// Lista de publicados (approved), paginada. Solo admin.
function PublishedList({
  items,
  busy,
  confirmId,
  onRemove,
}: {
  items: QueueItem[];
  busy: string | null;
  confirmId: string | null;
  onRemove: (item: QueueItem) => void;
}) {
  const { page, setPage, view, total, pageSize } = usePaged(items, PAGE_SIZE);
  return (
    <section>
      <h2 className="eyebrow mb-2">Publicados · {total}</h2>
      <p className="text-sm text-[var(--color-ink-soft)] mb-3">
        Elimina una publicación si es falsa, duplicada o si la persona ya fue
        encontrada. Esta acción no se puede deshacer.
      </p>
      <ul className="flex flex-col gap-3">
        {view.map((item) => (
          <li key={item.id} className="card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex gap-3">
                {item.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image}
                    alt={`Foto de ${item.title}`}
                    className="h-20 w-16 shrink-0 rounded-md object-cover border"
                    style={{ borderColor: "var(--color-line)" }}
                  />
                )}
                <div className="min-w-0">
                  <h3 className="font-extrabold">{item.title}</h3>
                  <p className="text-sm text-[var(--color-ink-soft)]">{item.meta}</p>
                  <p className="folio mt-1">{TABLE_LABELS[item.table]}</p>
                </div>
              </div>
              <button
                onClick={() => onRemove(item)}
                disabled={busy === item.id}
                className="btn !min-h-[44px] text-sm shrink-0"
                style={{ background: "var(--color-danger)", color: "#fff" }}
              >
                {confirmId === item.id ? "Confirmar borrado" : "Eliminar"}
              </button>
            </div>
          </li>
        ))}
      </ul>
      <Pager page={page} total={total} pageSize={pageSize} onPage={setPage} />
    </section>
  );
}
