import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

// Bots, crawlers y pre-visualizadores de enlaces (WhatsApp/Telegram/redes): no
// son "gente real". Como además casi ninguno ejecuta JS, este filtro + el hecho
// de registrar solo desde el navegador descarta la mayoría del ruido.
const BOT =
  /bot|crawl|spider|slurp|bing|google|yandex|baidu|duckduck|facebookexternalhit|whatsapp|telegram|discord|twitterbot|preview|monitor|lighthouse|headless|pingdom|uptime/i;

// POST /api/track  { path, visitor_id, referrer? }  → registra una visita.
export async function POST(request: Request) {
  const ua = request.headers.get("user-agent") ?? "";
  if (BOT.test(ua)) return NextResponse.json({ ok: true });

  let body: { path?: string; visitor_id?: string; referrer?: string | null };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const path = typeof body.path === "string" ? body.path.slice(0, 300) : null;
  const visitor_id =
    typeof body.visitor_id === "string" ? body.visitor_id.slice(0, 64) : null;
  const referrer =
    typeof body.referrer === "string" && body.referrer ? body.referrer.slice(0, 300) : null;

  if (!path || !visitor_id) return NextResponse.json({ ok: true });

  const supabase = await createClient();
  if (supabase) {
    // Si la tabla aún no existe (migración sin aplicar), el error se ignora.
    await supabase.from("page_views").insert({ path, visitor_id, referrer });
  }
  return NextResponse.json({ ok: true });
}
