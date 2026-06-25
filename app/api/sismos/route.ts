import { NextResponse } from "next/server";
import { getQuakeSummary } from "@/lib/sismos";

export const runtime = "nodejs";

// GET /api/sismos?days=7&minmag=2.5 → sismos de Venezuela (USGS), para el
// refresco "en vivo" de la página /sismos. La respuesta de USGS se cachea 2 min
// dentro de getQuakes(); aquí dejamos que el cliente revalide cuando quiera.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const days = clamp(Number(searchParams.get("days")), 1, 365, 7);
  const minmag = clamp(Number(searchParams.get("minmag")), 0, 9, 2.5);

  const summary = await getQuakeSummary({ days, minmag, limit: 300 });

  return NextResponse.json(summary, {
    headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=120" },
  });
}

function clamp(v: number, min: number, max: number, fallback: number): number {
  if (!Number.isFinite(v)) return fallback;
  return Math.min(max, Math.max(min, v));
}
