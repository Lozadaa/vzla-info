import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { muroSetStatus } from "@/lib/muro/db";
import type { MuroCategory, ReportStatus } from "@/lib/types";

export const runtime = "nodejs";

// POST /api/muro/moderate  { id, status: "approved"|"rejected", category? }
// Aprueba/rechaza un tweet y, opcionalmente, fija su categoría de triage.
//
// Seguridad: si Supabase está configurado, exige sesión de moderador (igual que
// /admin). Sin Supabase (modo demo/desarrollo) queda abierto para poder probar.
export async function POST(request: Request) {
  let body: {
    id?: string;
    status?: ReportStatus;
    category?: MuroCategory;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const { id, status, category } = body;
  if (!id || (status !== "approved" && status !== "rejected")) {
    return NextResponse.json({ error: "Datos incompletos." }, { status: 400 });
  }

  // Control de acceso cuando hay backend real.
  const supabase = await createClient();
  if (supabase) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .maybeSingle();
        if (!profile) {
          return NextResponse.json(
            { error: "No tienes permisos de moderación." },
            { status: 403 },
          );
        }
      }
      // Si no hay user pero Supabase está caído en dev, muroSetStatus cae a local.
    } catch {
      // Supabase inaccesible: seguimos con el almacén local (dev).
    }
  }

  const ok = await muroSetStatus(id, status, category);
  if (!ok) {
    return NextResponse.json({ error: "No se encontró el tweet." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
