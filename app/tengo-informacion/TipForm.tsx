"use client";

import { useState } from "react";
import { submitReport } from "@/lib/submit";
import { SubmittedCard } from "../components/SubmittedCard";
import { Notice } from "../components/Notice";

export function TipForm({
  caso,
  personName,
}: {
  caso: string | null;
  personName: string | null;
}) {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ folio: string; demo: boolean } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSending(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await submitReport("tips", {
        missing_person_id: caso,
        person_name: String(fd.get("person_name") || "").trim() || personName || null,
        info: String(fd.get("info") || "").trim(),
        zone: String(fd.get("zone") || "").trim() || null,
        contact_whatsapp: String(fd.get("contact_whatsapp") || "").trim() || null,
      });
      setDone(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar la información.");
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <SubmittedCard folio={done.folio} demo={done.demo} title="Información recibida" accent="var(--color-info)">
        <p className="mt-3 text-sm text-[var(--color-ink-soft)]">
          Un moderador la revisará y, si corresponde, la hará llegar a la familia.
          Gracias por aportar.
        </p>
      </SubmittedCard>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card p-5 sm:p-6 flex flex-col gap-5">
      {error && <Notice tone="error">{error}</Notice>}

      {personName ? (
        <Notice tone="info">
          Estás aportando información sobre <strong>{personName}</strong>.
        </Notice>
      ) : (
        <div>
          <label htmlFor="person_name" className="field-label">¿Sobre quién es la información?</label>
          <input id="person_name" name="person_name" required={!personName} className="input" placeholder="Nombre de la persona" />
        </div>
      )}

      <div>
        <label htmlFor="info" className="field-label">¿Qué sabes?</label>
        <textarea id="info" name="info" required className="textarea" placeholder="La vi el martes en… / está en tal refugio / la atendieron en…" maxLength={600} />
        <p className="field-hint">Cuenta solo lo que sepas con certeza. Evita rumores.</p>
      </div>

      <div>
        <label htmlFor="zone" className="field-label">
          Zona <span className="font-normal text-[var(--color-ink-faint)]">(opcional)</span>
        </label>
        <input id="zone" name="zone" className="input" placeholder="Ej.: Cúcuta, frontera" />
      </div>

      <div>
        <label htmlFor="contact_whatsapp" className="field-label">
          Tu WhatsApp <span className="font-normal text-[var(--color-ink-faint)]">(opcional)</span>
        </label>
        <input id="contact_whatsapp" name="contact_whatsapp" type="tel" inputMode="tel" className="input" placeholder="+58 412 000 0000" />
        <p className="field-hint">Por si el moderador o la familia necesita confirmar el dato contigo.</p>
      </div>

      <button type="submit" className="btn btn-block" style={{ background: "var(--color-info)", color: "#fff" }} disabled={sending}>
        {sending ? "Enviando…" : "Enviar información"}
      </button>
    </form>
  );
}
