import { NextResponse } from "next/server";
import { muroIngest } from "@/lib/muro/db";

export const runtime = "nodejs"; // usa fs/Buffer para el screenshot

// POST /api/muro/ingest  { "url": "https://x.com/.../status/123" }
// Reconstruye el tweet (oEmbed) + guarda su screenshot + lo deja "pending"
// en la cola de moderación.
export async function POST(request: Request) {
  let url: string | undefined;
  try {
    url = (await request.json())?.url;
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  if (!url || typeof url !== "string") {
    return NextResponse.json(
      { error: "Falta el enlace del tweet." },
      { status: 400 },
    );
  }

  try {
    const post = await muroIngest(url);
    return NextResponse.json({ post }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "No se pudo procesar el tweet." },
      { status: 422 },
    );
  }
}
