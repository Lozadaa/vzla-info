"use client";

import { useMemo, useState } from "react";
import { MissingPerson } from "@/lib/types";
import { MissingCard } from "../components/MissingCard";

export function MissingList({ persons }: { persons: MissingPerson[] }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return persons;
    return persons.filter(
      (p) =>
        p.full_name.toLowerCase().includes(term) ||
        p.last_seen_zone.toLowerCase().includes(term) ||
        p.folio.toLowerCase().includes(term)
    );
  }, [q, persons]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label htmlFor="buscar" className="sr-only">
          Buscar por nombre, zona o folio
        </label>
        <input
          id="buscar"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="input"
          placeholder="Buscar por nombre, zona o folio…"
        />
      </div>

      {persons.length === 0 ? (
        <p className="card p-6 text-center text-[var(--color-ink-soft)]">
          Aún no hay reportes públicos. Si buscas a alguien, crea el primero con el
          botón de arriba.
        </p>
      ) : filtered.length === 0 ? (
        <p className="card p-6 text-center text-[var(--color-ink-soft)]">
          Ningún reporte coincide con “{q}”.
        </p>
      ) : (
        <>
          <p className="text-sm text-[var(--color-ink-soft)]">
            {filtered.length} {filtered.length === 1 ? "persona" : "personas"} en la lista
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map((p) => (
              <MissingCard key={p.id} person={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
