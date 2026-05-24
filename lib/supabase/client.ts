import { createBrowserClient } from "@supabase/ssr";

/**
 * Crea un cliente de Supabase para su uso exclusivo en el cliente (Browser).
 * Utiliza variables de entorno públicas y maneja automáticamente la sesión local.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
