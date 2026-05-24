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

  // Helper para redireccionar preservando las cookies de sesión actualizadas
  const redirectWithCookies = (targetUrl: URL) => {
    const redirectResponse = NextResponse.redirect(targetUrl);
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, {
        path: cookie.path,
        domain: cookie.domain,
        maxAge: cookie.maxAge,
        secure: cookie.secure,
        sameSite: cookie.sameSite,
        expires: cookie.expires,
        httpOnly: cookie.httpOnly,
      });
    });
    return redirectResponse;
  };

  // 1. Redirección si no está autenticado
  if (isProtectedRoute && !user) {
    url.pathname = "/auth/login";
    url.searchParams.set("redirectedFrom", pathname);
    return redirectWithCookies(url);
  }

  // 2. Redirección para usuarios autenticados que intentan ir al login
  if (pathname === "/auth/login" && user) {
    url.pathname = "/dashboard";
    return redirectWithCookies(url);
  }

  // 3. Protección de ruta de administración (/admin)
  if (pathname.startsWith("/admin") && user) {
    const role = user.app_metadata?.role || user.user_metadata?.role;
    const isAdmin = role === "admin";

    if (!isAdmin) {
      url.pathname = "/dashboard";
      return redirectWithCookies(url);
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
