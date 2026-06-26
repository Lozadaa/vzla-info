import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Sitio retirado: dejamos una única página pública (el comunicado en "/").
// Cualquier otra ruta redirige a la raíz. El código del resto de la app sigue
// en el repo/historial; solo no se sirve.
// (Next 16 renombró el convenio "middleware" → "proxy").
export function proxy(request: NextRequest) {
  return NextResponse.redirect(new URL("/", request.url));
}

export const config = {
  // Excluye la raíz (el `.+` exige al menos un carácter tras "/"), los estáticos
  // de Next y los archivos públicos habituales.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|icon-maskable.svg|manifest.webmanifest|sw.js|robots.txt|sitemap.xml|.*\\.(?:png|jpe?g|gif|webp|svg|ico)).+)",
  ],
};
