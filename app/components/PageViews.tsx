"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Identificador anónimo del navegador (no es personal; sirve para contar
// visitantes únicos sin cuentas ni datos sensibles). Persiste en localStorage.
function visitorId(): string {
  try {
    let id = localStorage.getItem("vu_vid");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("vu_vid", id);
    }
    return id;
  } catch {
    return "anon";
  }
}

// Registra una visita en cada carga y cada cambio de ruta (client-side nav).
export function PageViews() {
  const pathname = usePathname();

  useEffect(() => {
    const body = JSON.stringify({
      path: pathname,
      visitor_id: visitorId(),
      referrer: document.referrer || null,
    });
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
      } else {
        fetch("/api/track", {
          method: "POST",
          body,
          headers: { "Content-Type": "application/json" },
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      /* sin analítica si el navegador la bloquea; la web sigue igual */
    }
  }, [pathname]);

  return null;
}
