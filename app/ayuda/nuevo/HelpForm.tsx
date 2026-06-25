"use client";

import { useState } from "react";
import { submitReport } from "@/lib/submit";
import { HELP_CATEGORIES, HelpKind } from "@/lib/types";
import { SubmittedCard } from "../../components/SubmittedCard";
import { Notice } from "../../components/Notice";
import { MapPin, Check } from "../../components/icons";

export function HelpForm() {
  const [kind, setKind] = useState<HelpKind>("need");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ folio: string; demo: boolean } | null>(null);

  function useMyLocation() {
    if (!("geolocation" in navigator)) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: false, timeout: 8000 }
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSending(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await submitReport(
        "help_listings",
        {
          kind,
          category: String(fd.get("category") || "otros"),
          title: String(fd.get("title") || "").trim(),
          description: String(fd.get("description") || "").trim() || null,
          zone: String(fd.get("zone") || "").trim(),
          lat: coords?.lat ?? null,
          lng: coords?.lng ?? null,
          contact_whatsapp: String(fd.get("contact_whatsapp") || "").trim() || null,
        },
        { withFolio: true }
      );
      setDone(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo publicar.");
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <SubmittedCard folio={done.folio} demo={done.demo} title="Publicación enviada a revisión" accent="var(--color-ayuda)">
        <p className="mt-3 text-sm text-[var(--color-ink-soft)]">
          Cuando se apruebe, aparecerá en el mapa de ayuda.
        </p>
      </SubmittedCard>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card p-5 sm:p-6 flex flex-col gap-5">
      {error && <Notice tone="error">{error}</Notice>}

      <div>
        <span className="field-label">¿Qué quieres hacer?</span>
        <div className="grid grid-cols-2 gap-3">
          {([
            ["need", "Necesito ayuda", "var(--color-ayuda)"],
            ["offer", "Ofrezco ayuda", "var(--color-salvo)"],
          ] as const).map(([val, label, color]) => (
            <button
              key={val}
              type="button"
              onClick={() => setKind(val)}
              aria-pressed={kind === val}
              className="btn"
              style={
                kind === val
                  ? { background: color, color: "#fff" }
                  : { background: "transparent", color: "var(--color-ink)", border: "1.5px solid var(--color-line-strong)" }
              }
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="category" className="field-label">Categoría</label>
        <select id="category" name="category" className="select" defaultValue="refugio">
          {HELP_CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="title" className="field-label">Resumen en una línea</label>
        <input id="title" name="title" required className="input" placeholder={kind === "offer" ? "Ej.: 2 cupos para dormir" : "Ej.: Necesito insulina refrigerada"} maxLength={90} />
      </div>

      <div>
        <label htmlFor="description" className="field-label">
          Detalle <span className="font-normal text-[var(--color-ink-faint)]">(opcional)</span>
        </label>
        <textarea id="description" name="description" className="textarea" maxLength={500} placeholder="Horarios, condiciones, cantidad, etc." />
      </div>

      <div>
        <label htmlFor="zone" className="field-label">Zona</label>
        <input id="zone" name="zone" required className="input" placeholder="Ej.: San Cristóbal, Táchira" />
        <div className="mt-2 flex items-center gap-3">
          <button type="button" onClick={useMyLocation} className="btn btn-ghost !min-h-[44px] text-sm">
            <MapPin size={16} aria-hidden="true" />
            {locating ? "Ubicando…" : "Usar mi ubicación"}
          </button>
          {coords && (
            <span className="inline-flex items-center gap-1 text-sm text-[var(--color-ok)]">
              <Check size={16} aria-hidden="true" />
              Ubicación añadida
            </span>
          )}
        </div>
        <p className="field-hint">Tu ubicación exacta es opcional; ayuda a colocarte en el mapa.</p>
      </div>

      <div>
        <label htmlFor="contact_whatsapp" className="field-label">
          WhatsApp de contacto <span className="font-normal text-[var(--color-ink-faint)]">(opcional)</span>
        </label>
        <input id="contact_whatsapp" name="contact_whatsapp" type="tel" inputMode="tel" className="input" placeholder="+58 412 000 0000" />
      </div>

      <button type="submit" className="btn btn-block" style={{ background: "var(--color-ayuda)", color: "#fff" }} disabled={sending}>
        {sending ? "Enviando…" : "Publicar (irá a revisión)"}
      </button>
    </form>
  );
}
