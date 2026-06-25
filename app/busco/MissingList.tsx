"use client";

import { useMemo, useState } from "react";
import { MissingPerson } from "@/lib/types";
import { MissingCard } from "../components/MissingCard";

// Cuántas fichas se muestran por tanda. Con ~1900 personas, pintarlas todas
// de golpe carga miles de nodos e imágenes; mostramos por bloques con "Ver más".
const PAGE = 24;

export function MissingList({ persons }: { persons: MissingPerson[] }) {
  const [q, setQ] = useState("");
  const [visible, setVisible] = useState(PAGE);

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

  // Al cambiar la búsqueda, volvemos a la primera tanda.
  const onSearch = (value: string) => {
    setQ(value);
    setVisible(PAGE);
  };

  const shown = filtered.slice(0, visible);
  const remaining = filtered.length - shown.length;

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
          onChange={(e) => onSearch(e.target.value)}
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
            Mostrando {shown.length} de {filtered.length}{" "}
            {filtered.length === 1 ? "persona" : "personas"}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {shown.map((p) => (
              <MissingCard key={p.id} person={p} />
            ))}
          </div>

          {remaining > 0 && (
            <button
              type="button"
              onClick={() => setVisible((v) => v + PAGE)}
              className="card mx-auto mt-1 px-5 py-3 text-sm font-semibold transition-transform hover:-translate-y-0.5"
              style={{ borderLeft: "4px solid var(--color-busco)" }}
            >
              Ver más ({remaining} restantes)
            </button>
          )}
        </>
      )}
    </div>
  );
}
