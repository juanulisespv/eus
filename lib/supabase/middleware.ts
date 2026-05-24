import { createServerClient } from "@supabase/ssr";
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
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const user = session?.user ?? null;

  // Añadir cabeceras de depuración para ver en las herramientas de desarrollo
  const cookiesList = request.cookies.getAll();
  response.headers.set("x-debug-user", user ? user.email || "yes" : "null");
  response.headers.set("x-debug-session", session ? "exists" : "null");
  response.headers.set("x-debug-cookies-count", String(cookiesList.length));
  response.headers.set("x-debug-cookies-names", cookiesList.map(c => c.name).join(", "));
  response.headers.set("x-debug-env-url", supabaseUrl || "undefined");
  response.headers.set("x-debug-env-anon-len", String(supabaseAnonKey?.length || 0));

  return { supabase, user, response };
}
