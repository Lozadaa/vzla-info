"use client";

import { useState } from "react";
import { submitReport } from "@/lib/submit";
import { Notice } from "../../components/Notice";

/**
 * Solicitar modificación de una ficha. El usuario no edita directamente:
 * propone cambios (nombre, zona, foto) y un moderador los aplica.
 */
export function ModificationRequest({ personId }: { personId: string }) {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSending(true);
    const fd = new FormData(e.currentTarget);
    try {
      await submitReport("modification_requests", {
        target_table: "missing_persons",
        target_id: personId,
        requested_full_name: String(fd.get("requested_full_name") || "").trim() || null,
        requested_zone: String(fd.get("requested_zone") || "").trim() || null,
        note: String(fd.get("note") || "").trim() || null,
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar la solicitud.");
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <Notice tone="info">
        Solicitud de modificación enviada. Un moderador la revisará. Gracias por
        ayudar a mantener la información correcta.
      </Notice>
    );
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-sm font-semibold underline underline-offset-4 text-[var(--color-ink-soft)]">
        ¿Algún dato está mal? Solicitar modificación
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card p-5 flex flex-col gap-4">
      <h3 className="text-lg font-extrabold">Solicitar modificación</h3>
      <p className="text-sm text-[var(--color-ink-soft)]">
        Indica solo lo que debería corregirse. No se cambia nada hasta que un
        moderador lo apruebe.
      </p>
      {error && <Notice tone="error">{error}</Notice>}

      <div>
        <label htmlFor="requested_full_name" className="field-label">Nombre correcto</label>
        <input id="requested_full_name" name="requested_full_name" className="input" placeholder="Déjalo vacío si está bien" />
      </div>
      <div>
        <label htmlFor="requested_zone" className="field-label">Zona correcta</label>
        <input id="requested_zone" name="requested_zone" className="input" placeholder="Déjalo vacío si está bien" />
      </div>
      <div>
        <label htmlFor="note" className="field-label">Nota para el moderador</label>
        <textarea id="note" name="note" className="textarea" placeholder="Ej.: la foto no corresponde; ya fue encontrada; corregir edad…" />
      </div>

      <div className="flex gap-3">
        <button type="submit" className="btn btn-primary" disabled={sending}>
          {sending ? "Enviando…" : "Enviar solicitud"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn btn-ghost">
          Cancelar
        </button>
      </div>
    </form>
  );
}
