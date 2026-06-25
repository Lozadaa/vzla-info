import { NextResponse } from "next/server";
import { muroListApproved } from "@/lib/muro/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/muro → tweets aprobados (para el refresco "en vivo" del muro).
export async function GET() {
  const posts = await muroListApproved();
  return NextResponse.json(
    { posts },
    { headers: { "Cache-Control": "no-store" } },
  );
}
