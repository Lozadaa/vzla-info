"use client";

import { useState } from "react";

// Paginación de listas en el cliente. Reutilizable en el panel de moderación
// (pendientes, publicados) y en el de coincidencias.

export function usePaged<T>(items: T[], pageSize: number) {
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  // Se reajusta sola si la lista encoge (al resolver/eliminar ítems).
  const safePage = Math.min(page, totalPages - 1);
  const view = items.slice(safePage * pageSize, safePage * pageSize + pageSize);
  return { page: safePage, setPage, totalPages, view, total: items.length, pageSize };
}

// Controles de paginación. No se muestran si solo hay una página.
export function Pager({
  page,
  total,
  pageSize,
  onPage,
}: {
  page: number;
  total: number;
  pageSize: number;
  onPage: (p: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;
  const from = page * pageSize + 1;
  const to = Math.min(total, (page + 1) * pageSize);
  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
      <span className="folio">
        {from}–{to} de {total}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPage(page - 1)}
          disabled={page === 0}
          className="btn btn-ghost !min-h-[40px]"
        >
          ← Anterior
        </button>
        <span className="folio">
          {page + 1} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPage(page + 1)}
          disabled={page >= totalPages - 1}
          className="btn btn-ghost !min-h-[40px]"
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}
