"use client";

import { useState } from "react";

// Aportar un tweet pegando su enlace. Lo envía a la cola de moderación.
export function SubmitTweet() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ tone: "ok" | "error"; text: string } | null>(
    null,
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/muro/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo procesar.");
      setMsg({
        tone: "ok",
        text: "Recibido. Pasará por moderación antes de publicarse.",
      });
      setUrl("");
    } catch (err) {
      setMsg({
        tone: "error",
        text: err instanceof Error ? err.message : "Error desconocido.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="card p-4">
      <label htmlFor="tweet-url" className="field-label">
        Aportar información desde un tweet
      </label>
      <p className="field-hint mb-2">
        Pega el enlace de un tweet con información de personas desaparecidas o
        necesidades. No se publica hasta que un moderador lo revise.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="tweet-url"
          type="url"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://x.com/usuario/status/…"
          className="input"
        />
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary shrink-0"
        >
          {loading ? "Procesando…" : "Enviar"}
        </button>
      </div>

      {msg && (
        <p
          className="mt-3 rounded-lg px-3 py-2 text-sm"
          style={{
            background:
              msg.tone === "ok"
                ? "var(--color-salvo-soft)"
                : "var(--color-alert-soft)",
            color:
              msg.tone === "ok" ? "var(--color-salvo)" : "var(--color-alert)",
          }}
        >
          {msg.text}
        </p>
      )}
    </form>
  );
}
