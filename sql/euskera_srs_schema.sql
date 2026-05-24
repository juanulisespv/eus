-- ============================================================
-- SCHEMA: Euskera SRS Learning App
-- Compatibilidad: Supabase (PostgreSQL 15+)
-- Algoritmo: SM-2 (SuperMemo 2)
-- ============================================================


-- ============================================================
-- 1. TIPOS ENUM
-- ============================================================

CREATE TYPE word_category AS ENUM (
  'sustantivo','verbo','adjetivo','adverbio','preposicion',
  'conjuncion','pronombre','frase_hecha','numero','saludo','otro'
);

CREATE TYPE session_status AS ENUM ('in_progress','completed','abandoned');

CREATE TYPE session_mode AS ENUM ('review','learn','practice','test');

CREATE TYPE achievement_category AS ENUM ('streak','mastery','speed','volume','milestone');


-- ============================================================
-- 2. TABLAS
-- ============================================================

-- 2.1 USERS — extiende auth.users
CREATE TABLE public.users (
  id                UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  ui_language       TEXT        NOT NULL DEFAULT 'es' CHECK (ui_language IN ('es','en','eu')),
  daily_goal        SMALLINT    NOT NULL DEFAULT 10 CHECK (daily_goal BETWEEN 1 AND 200),
  -- Nivel MCER del usuario (A1..C2)
  level             TEXT        NOT NULL DEFAULT 'A1' CHECK (level IN ('A1','A2','B1','B2','C1','C2')),
  -- Dialecto preferido: batua = euskera estándar unificado
  dialect_preference TEXT       NOT NULL DEFAULT 'batua'
                                CHECK (dialect_preference IN ('batua','bizkaiera','gipuzkera','lapurtera','otro')),
  -- Racha actual de días consecutivos con al menos 1 sesión
  current_streak    INT         NOT NULL DEFAULT 0,
  longest_streak    INT         NOT NULL DEFAULT 0,
  -- Fecha UTC de última sesión para calcular racha
  last_session_date DATE,
  total_xp          INT         NOT NULL DEFAULT 0,
  -- Zona horaria IANA — crítico para calcular correctamente el cambio de día
  timezone          TEXT        NOT NULL DEFAULT 'UTC',
  avatar_url        TEXT,
  display_name      TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.users IS 'Perfil extendido del usuario. FK a auth.users de Supabase.';
COMMENT ON COLUMN public.users.daily_goal IS 'Número de palabras NUEVAS que el usuario quiere estudiar por día.';
COMMENT ON COLUMN public.users.current_streak IS 'Días consecutivos con sesión completada. Se resetea si se salta un día.';
COMMENT ON COLUMN public.users.timezone IS 'Zona horaria IANA. Crítico para determinar cambio de día correctamente.';


-- 2.2 WORDS — vocabulario euskera (gestionado por admins)
CREATE TABLE public.words (
  id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  word_eu             TEXT          NOT NULL,
  translation_es      TEXT          NOT NULL,
  translation_en      TEXT,
  category            word_category NOT NULL,
  -- Dificultad 1 (muy fácil) → 5 (muy difícil)
  difficulty          SMALLINT      NOT NULL DEFAULT 3 CHECK (difficulty BETWEEN 1 AND 5),
  -- Rango de frecuencia en corpus; 1 = más frecuente. NULL = desconocida
  frequency_rank      INT           CHECK (frequency_rank > 0),
  -- Transcripción IPA o guía de pronunciación simplificada
  pronunciation       TEXT,
  audio_url           TEXT,
  image_url           TEXT,
  -- Definición en euskera simple (para inmersión total)
  definition_simple   TEXT,
  -- Contexto de uso: "Formal", "Común en Bizkaia", etc.
  uso_habitual        TEXT,
  -- Etiquetas temáticas: ['comida','animales','viaje']
  tags                TEXT[]        NOT NULL DEFAULT '{}',
  -- IDs de palabras relacionadas (sinónimos, antónimos, familia léxica)
  related_words       UUID[]        NOT NULL DEFAULT '{}',
  -- Soft-delete: inactivas no aparecen en nuevas sesiones pero conservan historial
  is_active           BOOLEAN       NOT NULL DEFAULT true,
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT now(),
  CONSTRAINT words_word_eu_unique UNIQUE (word_eu)
);

COMMENT ON TABLE public.words IS 'Vocabulario principal en euskera. Gestionado por administradores.';
COMMENT ON COLUMN public.words.frequency_rank IS 'Posición en corpus de frecuencia. Valor menor = más frecuente. NULL = desconocida.';
COMMENT ON COLUMN public.words.related_words IS 'Auto-referencia a otras words. Sin FK explícita para evitar complejidad circular.';
COMMENT ON COLUMN public.words.is_active IS 'Soft-delete. Inactivas no se asignan a nuevas sesiones pero el historial se preserva.';


-- 2.3 EXAMPLES — frases de ejemplo por palabra
CREATE TABLE public.examples (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  word_id         UUID        NOT NULL REFERENCES public.words(id) ON DELETE CASCADE,
  sentence_eu     TEXT        NOT NULL,
  sentence_es     TEXT        NOT NULL,
  sentence_en     TEXT,
  -- Audio de la frase completa (distinto del audio de la palabra suelta)
  audio_url       TEXT,
  difficulty      SMALLINT    CHECK (difficulty BETWEEN 1 AND 5),
  -- Origen: 'manual' | 'corpus' | 'generated'
  source          TEXT        NOT NULL DEFAULT 'manual',
  display_order   SMALLINT    NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.examples IS 'Frases de ejemplo por palabra. Múltiples frases por palabra permitidas.';
COMMENT ON COLUMN public.examples.source IS 'Origen: manual (curado), corpus (extraído), generated (IA).';


-- 2.4 USER_WORD_PROGRESS — estado SRS por usuario+palabra
-- Implementa SM-2:
--   ease_factor: factor de facilidad [1.3, ∞), default 2.5
--   interval_days: días hasta próxima revisión (crece exponencialmente)
--   repetitions: racha de aciertos consecutivos (quality >= 3)
--   last_quality: escala 0-5 → 0-2 fallo, 3-5 éxito
CREATE TABLE public.user_word_progress (
  user_id           UUID          NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  word_id           UUID          NOT NULL REFERENCES public.words(id) ON DELETE CASCADE,
  -- Factor de facilidad SM-2: sube con buenas respuestas, baja con malas
  ease_factor       NUMERIC(4,2)  NOT NULL DEFAULT 2.5 CHECK (ease_factor >= 1.3),
  -- Intervalo: empieza en 1 día, luego 6, luego EF * intervalo_anterior
  interval_days     INT           NOT NULL DEFAULT 1 CHECK (interval_days >= 1),
  -- Racha de revisiones exitosas (quality >= 3). Reset a 0 si quality < 3
  repetitions       INT           NOT NULL DEFAULT 0 CHECK (repetitions >= 0),
  -- NULL = palabra nueva, nunca presentada
  next_review_at    TIMESTAMPTZ,
  -- 0-100: métrica de dominio calculada por la app (no parte del SM-2 estándar)
  mastery_score     SMALLINT      NOT NULL DEFAULT 0 CHECK (mastery_score BETWEEN 0 AND 100),
  -- NULL = nunca revisada. 0-2: fallo. 3-5: éxito con distintos grados de confianza
  last_quality      SMALLINT      CHECK (last_quality BETWEEN 0 AND 5),
  total_reviews     INT           NOT NULL DEFAULT 0 CHECK (total_reviews >= 0),
  -- Revisiones con quality >= 3
  correct_reviews   INT           NOT NULL DEFAULT 0 CHECK (correct_reviews >= 0),
  first_seen_at     TIMESTAMPTZ   NOT NULL DEFAULT now(),
  last_reviewed_at  TIMESTAMPTZ,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, word_id),
  CONSTRAINT correct_lte_total CHECK (correct_reviews <= total_reviews)
);

COMMENT ON TABLE public.user_word_progress IS 'Estado SM-2 por par (usuario, palabra). Una fila = una tarjeta en el mazo del usuario.';
COMMENT ON COLUMN public.user_word_progress.ease_factor IS 'Factor de facilidad SM-2. Mínimo 1.3, default 2.5. Sube con buenas respuestas, baja con malas.';
COMMENT ON COLUMN public.user_word_progress.interval_days IS 'Días hasta próxima revisión. Crece exponencialmente con revisiones correctas.';
COMMENT ON COLUMN public.user_word_progress.repetitions IS 'Racha de revisiones exitosas (quality >= 3). Se resetea a 0 en cualquier fallo.';
COMMENT ON COLUMN public.user_word_progress.next_review_at IS 'NULL indica que la palabra es nueva y aún no ha sido presentada al usuario.';
COMMENT ON COLUMN public.user_word_progress.mastery_score IS 'Métrica 0-100 calculada por la app. 0=nueva, 100=dominada. Extensión propia del SM-2.';


-- 2.5 SESSIONS — sesiones de estudio
CREATE TABLE public.sessions (
  id                UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID           NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  mode              session_mode   NOT NULL DEFAULT 'review',
  status            session_status NOT NULL DEFAULT 'in_progress',
  started_at        TIMESTAMPTZ    NOT NULL DEFAULT now(),
  ended_at          TIMESTAMPTZ,
  -- Duración activa en segundos. Puede diferir de ended_at - started_at si la app se pausó
  duration_seconds  INT            CHECK (duration_seconds >= 0),
  cards_reviewed    INT            NOT NULL DEFAULT 0 CHECK (cards_reviewed >= 0),
  new_cards         INT            NOT NULL DEFAULT 0 CHECK (new_cards >= 0),
  correct_count     INT            NOT NULL DEFAULT 0 CHECK (correct_count >= 0),
  xp_earned         INT            NOT NULL DEFAULT 0 CHECK (xp_earned >= 0),
  -- JSONB libre: configuración de sesión, filtros, versión de app, etc.
  metadata          JSONB          NOT NULL DEFAULT '{}'::jsonb,
  created_at        TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ    NOT NULL DEFAULT now(),
  CONSTRAINT ended_after_started CHECK (ended_at IS NULL OR ended_at >= started_at),
  CONSTRAINT correct_lte_reviewed CHECK (correct_count <= cards_reviewed)
);

COMMENT ON TABLE public.sessions IS 'Cada fila es una sesión de estudio con sus métricas agregadas.';
COMMENT ON COLUMN public.sessions.duration_seconds IS 'Duración activa. No equivale a ended_at - started_at si la app fue pausada.';
COMMENT ON COLUMN public.sessions.metadata IS 'JSONB libre: configuración, filtros aplicados, versión de app, etc.';


-- 2.6a ACHIEVEMENTS — catálogo de logros
CREATE TABLE public.achievements (
  id              UUID                 PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Identificador legible por código: 'streak_7_days', 'master_100_words'
  slug            TEXT                 NOT NULL UNIQUE,
  name_eu         TEXT                 NOT NULL,
  name_es         TEXT                 NOT NULL,
  name_en         TEXT                 NOT NULL,
  description_eu  TEXT,
  description_es  TEXT,
  description_en  TEXT,
  category        achievement_category NOT NULL,
  icon_url        TEXT,
  xp_reward       INT                  NOT NULL DEFAULT 0 CHECK (xp_reward >= 0),
  display_order   SMALLINT             NOT NULL DEFAULT 0,
  -- Valor umbral interpretado por la app según la categoría (ej: 7 para "7 días racha")
  threshold_value INT,
  -- Oculto hasta desbloquearse (logro sorpresa)
  is_hidden       BOOLEAN              NOT NULL DEFAULT false,
  is_active       BOOLEAN              NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ          NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ          NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.achievements IS 'Catálogo de logros. Administrado por el equipo.';
COMMENT ON COLUMN public.achievements.slug IS 'Identificador legible para referenciar logros en el código sin depender del UUID.';
COMMENT ON COLUMN public.achievements.threshold_value IS 'Valor que la app evalúa para determinar si se cumplió la condición del logro.';
COMMENT ON COLUMN public.achievements.is_hidden IS 'Si true, el logro no aparece hasta desbloquearse (logro sorpresa).';

-- 2.6b USER_ACHIEVEMENTS — logros obtenidos por usuario
CREATE TABLE public.user_achievements (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  achievement_id  UUID        NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- 100 = completado. <100 puede mostrar progreso previo al desbloqueo
  progress        SMALLINT    NOT NULL DEFAULT 100 CHECK (progress BETWEEN 0 AND 100),
  CONSTRAINT user_achievements_unique UNIQUE (user_id, achievement_id)
);

COMMENT ON TABLE public.user_achievements IS 'Logros desbloqueados por usuario. Una fila por (usuario, logro).';
COMMENT ON COLUMN public.user_achievements.progress IS '100 = completado. <100 permite mostrar progreso parcial previo al desbloqueo.';


-- ============================================================
-- 3. ÍNDICES DE RENDIMIENTO
-- ============================================================

-- Query más frecuente: tarjetas del usuario pendientes de revisión
CREATE INDEX idx_uwp_user_next_review
  ON public.user_word_progress (user_id, next_review_at ASC NULLS LAST);

CREATE INDEX idx_uwp_user_mastery
  ON public.user_word_progress (user_id, mastery_score);

-- Filtros de currículo de palabras activas
CREATE INDEX idx_words_category    ON public.words (category)       WHERE is_active = true;
CREATE INDEX idx_words_difficulty  ON public.words (difficulty)     WHERE is_active = true;
CREATE INDEX idx_words_frequency   ON public.words (frequency_rank ASC NULLS LAST)
  WHERE is_active = true AND frequency_rank IS NOT NULL;

-- Full-text search en euskera + español
CREATE INDEX idx_words_fts ON public.words
  USING GIN (to_tsvector('spanish', coalesce(word_eu,'') || ' ' || coalesce(translation_es,'')));

-- Búsqueda por tags (array)
CREATE INDEX idx_words_tags ON public.words USING GIN (tags);

-- Ejemplos de una palabra ordenados
CREATE INDEX idx_examples_word_id ON public.examples (word_id, display_order);

-- Historial de sesiones del usuario
CREATE INDEX idx_sessions_user ON public.sessions (user_id, started_at DESC);

-- Logros del usuario
CREATE INDEX idx_user_achievements_user ON public.user_achievements (user_id, unlocked_at DESC);


-- ============================================================
-- 4. TRIGGERS
-- ============================================================

-- Función genérica para updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.set_updated_at() IS 'Actualiza updated_at = now() antes de cada UPDATE. Reutilizable en cualquier tabla.';

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_words_updated_at
  BEFORE UPDATE ON public.words FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_examples_updated_at
  BEFORE UPDATE ON public.examples FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_uwp_updated_at
  BEFORE UPDATE ON public.user_word_progress FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_sessions_updated_at
  BEFORE UPDATE ON public.sessions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_achievements_updated_at
  BEFORE UPDATE ON public.achievements FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Crea perfil automáticamente al registrar usuario en Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.users (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user() IS 'Inserta perfil en public.users cuando Supabase Auth crea un usuario nuevo.';

CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.words               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.examples            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_word_progress  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements   ENABLE ROW LEVEL SECURITY;

-- users: solo el propio usuario puede leer/editar su perfil
CREATE POLICY "users: select own"  ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users: update own"  ON public.users FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- words: lectura pública para autenticados; escritura solo service_role
CREATE POLICY "words: read active"
  ON public.words FOR SELECT USING (is_active = true);

-- examples: lectura para autenticados; escritura solo service_role
CREATE POLICY "examples: read"
  ON public.examples FOR SELECT TO authenticated USING (true);

-- user_word_progress: CRUD solo para el propio usuario
CREATE POLICY "uwp: select own" ON public.user_word_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "uwp: insert own" ON public.user_word_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "uwp: update own" ON public.user_word_progress FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "uwp: delete own" ON public.user_word_progress FOR DELETE USING (auth.uid() = user_id);

-- sessions: CRUD solo para el propio usuario
CREATE POLICY "sessions: select own" ON public.sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "sessions: insert own" ON public.sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sessions: update own" ON public.sessions FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- achievements: lectura para todos los autenticados (catálogo público)
CREATE POLICY "achievements: read active"
  ON public.achievements FOR SELECT TO authenticated USING (is_active = true);

-- user_achievements: solo el propio usuario ve sus logros
-- Los logros se OTORGAN desde el servidor (service_role / Edge Function)
CREATE POLICY "user_achievements: select own"
  ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- FIN DEL SCHEMA
-- ============================================================
