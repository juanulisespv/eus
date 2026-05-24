-- =============================================================================
-- user_preferences: preferencias de UI del usuario (idioma, dialecto, objetivo)
-- Ejecutar en el editor SQL de Supabase (Database > SQL Editor)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id            UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  interface_language TEXT        NOT NULL DEFAULT 'es'
                                 CHECK (interface_language IN ('es', 'en', 'eu')),
  dialect            TEXT        NOT NULL DEFAULT 'batua'
                                 CHECK (dialect IN ('batua', 'bizkaiera', 'gipuzkera', 'lapurtera', 'otro')),
  daily_goal         SMALLINT    NOT NULL DEFAULT 10
                                 CHECK (daily_goal BETWEEN 1 AND 200),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.user_preferences IS
  'Preferencias de interfaz y estudio del usuario. Una fila por usuario.';

-- Trigger updated_at reutilizando la función ya creada en el schema principal
CREATE TRIGGER trg_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS: solo el propio usuario puede leer y escribir sus preferencias
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_preferences: select own"
  ON public.user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_preferences: insert own"
  ON public.user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_preferences: update own"
  ON public.user_preferences FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
