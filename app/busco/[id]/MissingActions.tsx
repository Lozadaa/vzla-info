"use client";

import { useState } from "react";
import Link from "next/link";
import { MissingPerson } from "@/lib/types";
import { shareMissingMessage, waLink } from "@/lib/utils";

export function MissingActions({ person }: { person: MissingPerson }) {
  const [shared, setShared] = useState(false);

  async function onShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text = shareMissingMessage(person, url);
    // Web Share API si está disponible (móvil); si no, WhatsApp.
    if (navigator.share) {
      try {
        await navigator.share({ title: `Se busca: ${person.full_name}`, text, url });
        return;
      } catch {
        /* el usuario canceló */
      }
    }
    window.open(waLink(null, text), "_blank", "noopener");
    setShared(true);
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <button onClick={onShare} className="btn btn-wa btn-block">
        <span aria-hidden="true">↗</span> Compartir por WhatsApp
      </button>

      <Link href={`/tengo-informacion?caso=${person.id}`} className="btn btn-block" style={{ background: "var(--color-info)", color: "#fff" }}>
        Tengo información
      </Link>

      {person.contact_whatsapp && (
        <a
          href={waLink(person.contact_whatsapp, `Hola, escribo por el reporte de ${person.full_name} (folio ${person.folio}) en Venezuela Unida.`)}
          target="_blank"
          rel="noopener"
          className="btn btn-ghost btn-block sm:col-span-2"
        >
          Escribir a quien reportó
        </a>
      )}

      {shared && (
        <p className="sm:col-span-2 text-center text-sm text-[var(--color-ink-soft)]">
          ¡Gracias por difundir! Cada vez que se comparte, hay más ojos buscando.
        </p>
      )}
    </div>
  );
}
