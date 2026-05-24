/**
 * Constantes del motor de Repetición Espaciada (SRS).
 * Basadas en el algoritmo SM-2 de SuperMemo.
 */

// ── Algoritmo SM-2 ────────────────────────────────────────────

/** Factor de facilidad mínimo absoluto (límite inferior del SM-2). */
export const MIN_EASE_FACTOR = 1.3;

/** Factor de facilidad por defecto para tarjetas nuevas. */
export const DEFAULT_EASE_FACTOR = 2.5;

/** Intervalo inicial (días) en la primera revisión exitosa. */
export const INITIAL_INTERVAL_DAYS = 1;

/** Intervalo (días) en la segunda revisión exitosa consecutiva. */
export const SECOND_INTERVAL_DAYS = 6;

/** Calidad mínima para contar una revisión como acierto (SM-2 estándar). */
export const MIN_PASSING_QUALITY = 3;

// ── Sesión de estudio ─────────────────────────────────────────

/** Número máximo de palabras nuevas por día por defecto. */
export const MAX_NEW_PER_DAY = 10;

/** Tamaño por defecto de la cola de revisión (tarjetas vencidas). */
export const DEFAULT_SESSION_LIMIT = 20;

/** Límite de días de intervalo para el cálculo de mastery_score. */
export const MAX_INTERVAL_FOR_MASTERY = 30;

// ── Cálculo de mastery_score (0-100) ──────────────────────────

/**
 * Pesos del mastery_score:
 *  - ease_factor normalizado:       0-40 puntos
 *  - tasa de aciertos (accuracy):   0-30 puntos
 *  - intervalo actual normalizado:  0-30 puntos
 */
export const MASTERY_EASE_WEIGHT = 40;
export const MASTERY_ACCURACY_WEIGHT = 30;
export const MASTERY_INTERVAL_WEIGHT = 30;

// ── XP y gamificación ─────────────────────────────────────────

/** XP otorgado por cada revisión correcta (quality >= 3). */
export const XP_CORRECT_REVIEW = 10;

/** XP otorgado por respuesta perfecta (quality === 5). */
export const XP_PERFECT_REVIEW = 15;

/** XP otorgado por aprender una palabra nueva (primera vez). */
export const XP_NEW_WORD_LEARNED = 20;

/** XP otorgado al completar una sesión de estudio. */
export const XP_SESSION_COMPLETED = 50;
