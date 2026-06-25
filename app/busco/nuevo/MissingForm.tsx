"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { makeFolio } from "@/lib/utils";
import { SubmittedCard } from "../../components/SubmittedCard";
import { Notice } from "../../components/Notice";

export function MissingForm() {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [done, setDone] = useState<{ folio: string; demo: boolean } | null>(null);

  function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSending(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const folio = makeFolio("missing" + fd.get("full_name") + Math.random());
    const supabase = createClient();

    try {
      // Modo demo
      if (!supabase) {
        await new Promise((r) => setTimeout(r, 500));
        setDone({ folio, demo: true });
        return;
      }

      // 1) Subir foto si la hay
      let photo_url: string | null = null;
      const file = fd.get("photo") as File | null;
      if (file && file.size > 0) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${folio}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("fotos")
          .upload(path, file, { upsert: false });
        if (upErr) throw new Error("No se pudo subir la foto: " + upErr.message);
        photo_url = supabase.storage.from("fotos").getPublicUrl(path).data.publicUrl;
      }

      // 2) Insertar ficha (entra como pending)
      const ageRaw = String(fd.get("age") || "").trim();
      const { error: insErr } = await supabase.from("missing_persons").insert({
        folio,
        full_name: String(fd.get("full_name") || "").trim(),
        age: ageRaw ? Number(ageRaw) : null,
        photo_url,
        last_seen_zone: String(fd.get("last_seen_zone") || "").trim(),
        last_seen_at: String(fd.get("last_seen_at") || "") || null,
        description: String(fd.get("description") || "").trim() || null,
        reporter_relation: String(fd.get("reporter_relation") || "").trim() || null,
        contact_whatsapp: String(fd.get("contact_whatsapp") || "").trim() || null,
      });
      if (insErr) throw new Error(insErr.message);

      setDone({ folio, demo: false });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar el reporte.");
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <SubmittedCard
        folio={done.folio}
        demo={done.demo}
        title="Reporte enviado a revisión"
        accent="var(--color-busco)"
      >
        <p className="mt-3 text-sm text-[var(--color-ink-soft)]">
          Cuando un moderador lo apruebe, aparecerá en la lista pública y podrás
          compartirlo por WhatsApp.
        </p>
      </SubmittedCard>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card p-5 sm:p-6 flex flex-col gap-5">
      {error && <Notice tone="error">{error}</Notice>}

      <div>
        <label htmlFor="full_name" className="field-label">
          Nombre completo de la persona
        </label>
        <input id="full_name" name="full_name" required className="input" placeholder="Ej.: Carlos Pérez Rivas" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="age" className="field-label">
            Edad <span className="font-normal text-[var(--color-ink-faint)]">(opcional)</span>
          </label>
          <input id="age" name="age" type="number" min={0} max={120} inputMode="numeric" className="input" placeholder="Ej.: 34" />
        </div>
        <div>
          <label htmlFor="reporter_relation" className="field-label">
            Tu relación <span className="font-normal text-[var(--color-ink-faint)]">(opcional)</span>
          </label>
          <input id="reporter_relation" name="reporter_relation" className="input" placeholder="Ej.: hermana, vecino" />
        </div>
      </div>

      <div>
        <label htmlFor="last_seen_zone" className="field-label">
          Zona donde fue vista por última vez
        </label>
        <input id="last_seen_zone" name="last_seen_zone" required className="input" placeholder="Ej.: Av. Sucre, Maracay" />
      </div>

      <div>
        <label htmlFor="last_seen_at" className="field-label">
          Fecha aproximada <span className="font-normal text-[var(--color-ink-faint)]">(opcional)</span>
        </label>
        <input id="last_seen_at" name="last_seen_at" type="date" className="input" />
      </div>

      <div>
        <label htmlFor="description" className="field-label">
          Descripción y señas <span className="font-normal text-[var(--color-ink-faint)]">(opcional)</span>
        </label>
        <textarea id="description" name="description" className="textarea" maxLength={600} placeholder="Estatura, ropa que vestía, señas particulares, condición de salud…" />
      </div>

      <div>
        <label htmlFor="photo" className="field-label">
          Foto <span className="font-normal text-[var(--color-ink-faint)]">(opcional, ayuda mucho)</span>
        </label>
        <input id="photo" name="photo" type="file" accept="image/*" capture="environment" onChange={onPickPhoto} className="input" />
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Vista previa de la foto" className="mt-3 h-32 w-28 rounded-lg object-cover" />
        )}
      </div>

      <div>
        <label htmlFor="contact_whatsapp" className="field-label">
          Tu WhatsApp de contacto <span className="font-normal text-[var(--color-ink-faint)]">(opcional)</span>
        </label>
        <input id="contact_whatsapp" name="contact_whatsapp" type="tel" inputMode="tel" className="input" placeholder="+58 412 000 0000" />
        <p className="field-hint">Para que quien tenga información pueda escribirte por WhatsApp.</p>
      </div>

      <button
        type="submit"
        className="btn btn-block"
        style={{ background: "var(--color-busco)", color: "#fff" }}
        disabled={sending}
      >
        {sending ? "Enviando…" : "Publicar reporte (irá a revisión)"}
      </button>
    </form>
  );
}
