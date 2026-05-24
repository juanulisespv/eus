import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { user, response } = await createClient(request);

  const url = request.nextUrl.clone();
  const { pathname } = url;

  // Definición de rutas protegidas
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/study") ||
    pathname.startsWith("/vocabulary") ||
    pathname.startsWith("/progress") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/admin");

  // 1. Redirección si no está autenticado
  if (isProtectedRoute && !user) {
    url.pathname = "/auth/login";
    // Preservar la URL a la que intentaba acceder como query parameter
    url.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(url);
  }

  // 2. Redirección para usuarios autenticados que intentan ir al login
  if (pathname === "/auth/login" && user) {
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // 3. Protección de ruta de administración (/admin)
  if (pathname.startsWith("/admin") && user) {
    // Verificación de rol en los metadatos de Supabase Auth
    const role = user.app_metadata?.role || user.user_metadata?.role;
    const isAdmin = role === "admin";

    if (!isAdmin) {
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Coincidir con todas las rutas excepto:
     * - api (rutas de la API)
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico, sitemap.xml, robots.txt (archivos de metadatos)
     * - manifest.json o iconos PWA
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|manifest.json|icons/).*)",
  ],
};
