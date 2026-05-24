import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Crea un cliente de Supabase para su uso en el Servidor (Server Components, Route Handlers, Server Actions).
 * Utiliza cookies para mantener el contexto de sesión de forma segura.
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch (error) {
            // El método setAll puede arrojar error si se llama desde un Server Component puro.
            // Esto es normal en Next.js y se puede ignorar si el middleware ya refresca la sesión.
          }
        },
      },
    }
  );
}
