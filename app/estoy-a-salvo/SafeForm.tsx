"use client";

import { useState } from "react";
import { submitReport } from "@/lib/submit";
import { SubmittedCard } from "../components/SubmittedCard";
import { Notice } from "../components/Notice";

export function SafeForm() {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ folio: string; demo: boolean } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSending(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await submitReport(
        "safe_reports",
        {
          full_name: String(fd.get("full_name") || "").trim(),
          zone: String(fd.get("zone") || "").trim(),
          message: String(fd.get("message") || "").trim() || null,
          contact_whatsapp: String(fd.get("contact_whatsapp") || "").trim() || null,
        },
        { withFolio: true }
      );
      setDone(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar. Intenta de nuevo.");
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <SubmittedCard
        folio={done.folio}
        demo={done.demo}
        title="¡Quedó tu aviso de que estás a salvo!"
        accent="var(--color-salvo)"
      />
    );
  }

  return (
    <form onSubmit={onSubmit} className="card p-5 sm:p-6 flex flex-col gap-5">
      {error && <Notice tone="error">{error}</Notice>}

      <div>
        <label htmlFor="full_name" className="field-label">
          Tu nombre completo
        </label>
        <input
          id="full_name"
          name="full_name"
          required
          autoComplete="name"
          className="input"
          placeholder="Ej.: María González"
        />
      </div>

      <div>
        <label htmlFor="zone" className="field-label">
          Zona donde te encuentras
        </label>
        <input
          id="zone"
          name="zone"
          required
          className="input"
          placeholder="Ej.: Petare, Caracas"
        />
        <p className="field-hint">
          Basta una referencia aproximada. No publiques tu dirección exacta.
        </p>
      </div>

      <div>
        <label htmlFor="message" className="field-label">
          Mensaje para tu gente <span className="font-normal text-[var(--color-ink-faint)]">(opcional)</span>
        </label>
        <textarea
          id="message"
          name="message"
          className="textarea"
          placeholder="Estoy bien, con la familia. Sin señal a ratos."
          maxLength={400}
        />
      </div>

      <div>
        <label htmlFor="contact_whatsapp" className="field-label">
          WhatsApp de contacto <span className="font-normal text-[var(--color-ink-faint)]">(opcional)</span>
        </label>
        <input
          id="contact_whatsapp"
          name="contact_whatsapp"
          type="tel"
          inputMode="tel"
          className="input"
          placeholder="+58 412 000 0000"
        />
        <p className="field-hint">
          Solo se mostrará si lo apruebas un moderador. Sirve para que te ubiquen.
        </p>
      </div>

      <button
        type="submit"
        className="btn btn-block"
        style={{ background: "var(--color-salvo)", color: "#fff" }}
        disabled={sending}
      >
        {sending ? "Enviando…" : "Avisar que estoy a salvo"}
      </button>
    </form>
  );
}
