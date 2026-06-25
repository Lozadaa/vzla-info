"use client";

import { useEffect, useRef, useState } from "react";
import {
  EMERGENCY_GROUPS,
  EMERGENCY_PRIMARY,
  EMERGENCY_TIP,
} from "@/lib/emergency";

/**
 * Botón flotante de emergencias, presente en todas las páginas.
 * Late para llamar la atención y abre un panel deslizante con los números
 * importantes. Cada número es un enlace tel: tocable. Pensado para usarse bajo
 * estrés: texto grande, objetivos amplios y accesible (teclado + lectores).
 */
export function EmergencyButton() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Bloquea el scroll del fondo y permite cerrar con Escape mientras está abierto.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      {/* Botón flotante (FAB) */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="emergency-fab"
        aria-label="Abrir números de emergencia"
      >
        <span className="emergency-fab__pulse" aria-hidden="true" />
        <span aria-hidden="true" className="text-[1.35rem] leading-none">
          🚨
        </span>
        <span className="emergency-fab__label">Emergencias</span>
      </button>

      {/* Panel deslizante */}
      {open && (
        <div
          className="emergency-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="emergency-title"
            className="emergency-sheet"
          >
            {/* Encabezado fijo */}
            <div className="emergency-sheet__head">
              <div className="flex items-center gap-2 min-w-0">
                <span aria-hidden="true" className="text-xl">🚨</span>
                <h2
                  id="emergency-title"
                  className="text-lg font-bold truncate"
                  style={{ color: "var(--color-alert)" }}
                >
                  Números de emergencia
                </h2>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                className="emergency-close"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            {/* Contenido desplazable */}
            <div className="emergency-sheet__body">
              {/* 911 destacado */}
              <a
                href={`tel:${EMERGENCY_PRIMARY.tel}`}
                className="emergency-primary"
              >
                <div className="flex items-baseline gap-3">
                  <span className="emergency-primary__num">
                    {EMERGENCY_PRIMARY.label}
                  </span>
                  <span className="emergency-primary__tag">Número único</span>
                </div>
                <p className="emergency-primary__desc">
                  {EMERGENCY_PRIMARY.description}
                </p>
                <span className="emergency-primary__cta" aria-hidden="true">
                  Toca para llamar →
                </span>
              </a>

              {/* Grupos */}
              {EMERGENCY_GROUPS.map((group) => (
                <section key={group.title} className="mt-5">
                  <h3 className="emergency-group__title">
                    <span aria-hidden="true">{group.emoji}</span>
                    {group.title}
                  </h3>
                  <ul className="mt-2 grid gap-2">
                    {group.contacts.map((c) => (
                      <li key={c.name} className="emergency-contact">
                        <p className="emergency-contact__name">{c.name}</p>
                        {c.note && (
                          <p className="emergency-contact__note">{c.note}</p>
                        )}
                        <div className="mt-1.5 flex flex-wrap gap-2">
                          {c.phones.map((p) => (
                            <a
                              key={p.tel}
                              href={`tel:${p.tel}`}
                              className="emergency-phone"
                            >
                              <span aria-hidden="true">📞</span>
                              {p.label}
                            </a>
                          ))}
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}

              {/* Consejo */}
              <p className="emergency-tip">
                <span aria-hidden="true">💡</span> {EMERGENCY_TIP}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
