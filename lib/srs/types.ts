/**
 * Tipos del motor SRS para la app de aprendizaje de euskera.
 * Compatible con el schema de Supabase generado.
 */

// ── Escala de calidad SM-2 ────────────────────────────────────

/**
 * Calidad de la respuesta del usuario (escala SM-2 estándar).
 * - 5: Respuesta perfecta, inmediata y sin duda.
 * - 4: Respuesta correcta con una pequeña vacilación.
 * - 3: Respuesta correcta pero con esfuerzo notable.
 * - 2: Fallo, pero la respuesta correcta se reconoció fácilmente al verla.
 * - 1: Fallo, la respuesta correcta fue difícil de recordar incluso al verla.
 * - 0: Fallo total, sin ningún reconocimiento.
 */
export type ReviewQuality = 0 | 1 | 2 | 3 | 4 | 5;

// ── Estado de progreso por tarjeta ───────────────────────────

/**
 * Estado SRS completo de una tarjeta (palabra) para un usuario concreto.
 * Refleja la estructura de la tabla `user_word_progress` en Supabase.
 */
export interface UserWordProgress {
  user_id: string;
  word_id: string;
  /** Factor de facilidad SM-2. Rango: [1.3, ∞). Default: 2.5. */
  ease_factor: number;
  /** Días hasta la próxima revisión programada. */
  interval_days: number;
  /** Número de revisiones consecutivas exitosas (quality >= 3). Se resetea a 0 en cada fallo. */
  repetitions: number;
  /** Fecha/hora ISO 8601 de la próxima revisión. `null` si nunca ha sido revisada. */
  next_review_at: string | null;
  /** Puntuación de dominio 0-100. Métrica compuesta (no parte del SM-2 estándar). */
  mastery_score: number;
  /** Calidad de la última revisión (0-5). `null` si nunca ha sido revisada. */
  last_quality: ReviewQuality | null;
  /** Número total de revisiones realizadas (aciertos + fallos). */
  total_reviews: number;
  /** Número de revisiones con quality >= 3. */
  correct_reviews: number;
  /** Fecha/hora ISO 8601 de la primera vez que se presentó la tarjeta. */
  first_seen_at: string;
  /** Fecha/hora ISO 8601 de la última revisión. `null` si nunca ha sido revisada. */
  last_reviewed_at: string | null;
}

// ── Resultado de calcular SM-2 ────────────────────────────────

/**
 * Campos que se actualizan en `user_word_progress` tras una revisión.
 * Es el subconjunto de `UserWordProgress` que modifica el algoritmo SM-2.
 */
export type SM2Result = Pick<
  UserWordProgress,
  | "ease_factor"
  | "interval_days"
  | "repetitions"
  | "next_review_at"
  | "mastery_score"
  | "last_quality"
  | "total_reviews"
  | "correct_reviews"
  | "last_reviewed_at"
>;

// ── Resultado individual de revisión en sesión ───────────────

/** Resultado de revisar una tarjeta concreta durante una sesión. */
export interface ReviewResult {
  word_id: string;
  quality: ReviewQuality;
  /** Duración en segundos que el usuario tardó en responder. */
  response_time_seconds: number;
  reviewed_at: string; // ISO 8601
}

// ── Estadísticas de sesión ────────────────────────────────────

/** Estadísticas calculadas al finalizar una sesión de estudio. */
export interface SessionStats {
  /** Total de tarjetas revisadas en la sesión. */
  total_reviewed: number;
  /** Tarjetas con quality >= 3 en la sesión. */
  correct_count: number;
  /** Porcentaje de aciertos (0-100). */
  accuracy_percentage: number;
  /** Media de las calidades de respuesta (0.0-5.0). */
  average_quality: number;
  /** Número de tarjetas cuya siguiente revisión será mañana (interval_days = 1). */
  words_due_tomorrow: number;
  /** Duración total de la sesión en segundos. */
  session_duration_seconds: number;
}

// ── Cola de estudio ───────────────────────────────────────────

/**
 * Diferencia entre una tarjeta vencida (repaso) y una nueva (sin revisar nunca).
 */
export type CardType = "review" | "new";

/** Tarjeta en la cola de estudio, con su tipo y posición en la cola. */
export interface QueueCard {
  progress: UserWordProgress;
  type: CardType;
  /** Posición en la cola (0-indexed). */
  position: number;
}

/** Cola de estudio combinando repasos y palabras nuevas. */
export interface StudyQueue {
  cards: QueueCard[];
  /** Total de tarjetas de repaso en la cola. */
  review_count: number;
  /** Total de tarjetas nuevas en la cola. */
  new_count: number;
  /** Total de tarjetas en la cola. */
  total_count: number;
}

// ── Input para getStudyQueue ──────────────────────────────────

/** Opciones para construir la cola de estudio. */
export interface StudyQueueOptions {
  /** Palabras ya vencidas para repaso (next_review_at <= now). */
  dueWords: UserWordProgress[];
  /** Palabras nuevas disponibles (next_review_at === null). */
  newWords: UserWordProgress[];
  /** Máximo de palabras nuevas a incluir en esta sesión. */
  maxNew?: number;
  /** Máximo total de tarjetas en la cola. */
  limit?: number;
}
