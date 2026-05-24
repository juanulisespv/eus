import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function createClient(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const supabase = createServerClient(
    supabaseUrl!,
    supabaseAnonKey!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set(name, value);
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.delete(name);
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.delete(name);
        },
      },
    }
  );

  // Usar getUser() para refrescar correctamente la sesión y validar el token
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Añadir cabeceras de depuración para ver en las herramientas de desarrollo
  const cookiesList = request.cookies.getAll();
  response.headers.set("x-debug-user", user ? user.email || "yes" : "null");
  response.headers.set("x-debug-cookies-count", String(cookiesList.length));
  response.headers.set("x-debug-cookies-names", cookiesList.map(c => c.name).join(", "));

  return { supabase, user, response };
}
