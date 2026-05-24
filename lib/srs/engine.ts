/**
 * Motor SRS — Implementación completa del algoritmo SM-2 (SuperMemo 2).
 *
 * Todas las funciones son puras (sin efectos secundarios) salvo
 * `getNextReviewDate` que accede a `Date.now()` —pero puede recibir
 * una fecha base como argumento opcional para facilitar el testing.
 *
 * Compatible con uso en:
 *  - Client Components (Next.js App Router)
 *  - Server Components (Next.js App Router)
 *  - Edge Functions (Vercel / Supabase)
 *
 * @module lib/srs/engine
 */

import {
  DEFAULT_EASE_FACTOR,
  DEFAULT_SESSION_LIMIT,
  MASTERY_ACCURACY_WEIGHT,
  MASTERY_EASE_WEIGHT,
  MASTERY_INTERVAL_WEIGHT,
  MAX_INTERVAL_FOR_MASTERY,
  MAX_NEW_PER_DAY,
  MIN_EASE_FACTOR,
  MIN_PASSING_QUALITY,
  SECOND_INTERVAL_DAYS,
  INITIAL_INTERVAL_DAYS,
} from "./constants";

import type {
  QueueCard,
  ReviewQuality,
  ReviewResult,
  SM2Result,
  SessionStats,
  StudyQueue,
  StudyQueueOptions,
  UserWordProgress,
} from "./types";

// ────────────────────────────────────────────────────────────────
// 1. calculateSM2
// ────────────────────────────────────────────────────────────────

/**
 * Calcula el nuevo estado SM-2 de una tarjeta tras una revisión.
 *
 * Implementación pura y fiel al algoritmo SM-2 estándar de SuperMemo:
 * - Si quality >= 3 (acierto): actualiza ease_factor, interval y repetitions.
 * - Si quality < 3 (fallo): resetea interval a 1 y repetitions a 0.
 *   El ease_factor NO cambia en un fallo (comportamiento SM-2 estándar).
 *
 * @param progress - Estado actual de la tarjeta.
 * @param quality  - Calidad de la respuesta del usuario (0-5).
 * @param now      - Fecha base para calcular next_review_at. Default: Date.now().
 * @returns        Campos actualizados listos para hacer UPSERT en Supabase.
 */
export function calculateSM2(
  progress: UserWordProgress,
  quality: ReviewQuality,
  now: Date = new Date()
): SM2Result {
  const {
    ease_factor,
    interval_days,
    repetitions,
    total_reviews,
    correct_reviews,
  } = progress;

  const isCorrect = quality >= MIN_PASSING_QUALITY;

  let newRepetitions: number;
  let newIntervalDays: number;
  let newEaseFactor: number;

  if (isCorrect) {
    // ── Acierto: SM-2 estándar ──────────────────────────────
    // 1. Calcular nuevo intervalo
    if (repetitions === 0) {
      newIntervalDays = INITIAL_INTERVAL_DAYS;
    } else if (repetitions === 1) {
      newIntervalDays = SECOND_INTERVAL_DAYS;
    } else {
      newIntervalDays = Math.round(interval_days * ease_factor);
    }

    // 2. Actualizar ease_factor (fórmula SM-2 oficial)
    const rawEF =
      ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    newEaseFactor = Math.max(MIN_EASE_FACTOR, rawEF);
    // Redondear a 2 decimales para evitar drift de punto flotante
    newEaseFactor = Math.round(newEaseFactor * 100) / 100;

    // 3. Incrementar racha
    newRepetitions = repetitions + 1;
  } else {
    // ── Fallo: resetear racha e intervalo ───────────────────
    newRepetitions = 0;
    newIntervalDays = INITIAL_INTERVAL_DAYS;
    newEaseFactor = ease_factor; // No cambia en fallo (SM-2 estándar)
  }

  // Contadores acumulados
  const newTotalReviews = total_reviews + 1;
  const newCorrectReviews = correct_reviews + (isCorrect ? 1 : 0);

  // Construir progreso parcial para calcular mastery
  const partialProgress: UserWordProgress = {
    ...progress,
    ease_factor: newEaseFactor,
    interval_days: newIntervalDays,
    repetitions: newRepetitions,
    total_reviews: newTotalReviews,
    correct_reviews: newCorrectReviews,
    last_quality: quality,
    last_reviewed_at: now.toISOString(),
    // next_review_at y mastery_score los calculamos a continuación
    next_review_at: null,
    mastery_score: 0,
  };

  const nextReviewDate = getNextReviewDate(newIntervalDays, now);
  const newMasteryScore = calculateMasteryScore(partialProgress);

  return {
    ease_factor: newEaseFactor,
    interval_days: newIntervalDays,
    repetitions: newRepetitions,
    next_review_at: nextReviewDate.toISOString(),
    mastery_score: newMasteryScore,
    last_quality: quality,
    total_reviews: newTotalReviews,
    correct_reviews: newCorrectReviews,
    last_reviewed_at: now.toISOString(),
  };
}

// ────────────────────────────────────────────────────────────────
// 2. calculateMasteryScore
// ────────────────────────────────────────────────────────────────

/**
 * Calcula la puntuación de dominio de una tarjeta (0-100).
 *
 * Métrica compuesta con 3 componentes ponderados:
 * - **ease_factor** normalizado [1.3, 2.5] → 0-40 puntos.
 *   Un EF alto indica que la tarjeta se recuerda con facilidad.
 * - **Tasa de aciertos** (correct / total) → 0-30 puntos.
 *   Refleja la fiabilidad histórica del usuario con esta tarjeta.
 * - **Intervalo actual** (capped en 30 días) → 0-30 puntos.
 *   Un intervalo largo indica que la tarjeta lleva mucho tiempo en memoria.
 *
 * @param progress - Estado actual de la tarjeta.
 * @returns Puntuación de dominio entre 0 y 100.
 */
export function calculateMasteryScore(progress: UserWordProgress): number {
  const { ease_factor, interval_days, total_reviews, correct_reviews } =
    progress;

  // ── Componente 1: ease_factor (0-40 puntos) ─────────────
  // Rango [MIN_EASE_FACTOR, DEFAULT_EASE_FACTOR] → [0, 1]
  const efRange = DEFAULT_EASE_FACTOR - MIN_EASE_FACTOR; // 1.2
  const efNormalized = Math.min(
    1,
    Math.max(0, (ease_factor - MIN_EASE_FACTOR) / efRange)
  );
  const easePoints = efNormalized * MASTERY_EASE_WEIGHT;

  // ── Componente 2: tasa de aciertos (0-30 puntos) ────────
  const accuracy =
    total_reviews > 0 ? correct_reviews / total_reviews : 0;
  const accuracyPoints = accuracy * MASTERY_ACCURACY_WEIGHT;

  // ── Componente 3: intervalo actual (0-30 puntos) ─────────
  const intervalNormalized = Math.min(
    1,
    interval_days / MAX_INTERVAL_FOR_MASTERY
  );
  const intervalPoints = intervalNormalized * MASTERY_INTERVAL_WEIGHT;

  const rawScore = easePoints + accuracyPoints + intervalPoints;
  return Math.round(Math.min(100, Math.max(0, rawScore)));
}

// ────────────────────────────────────────────────────────────────
// 3. getNextReviewDate
// ────────────────────────────────────────────────────────────────

/**
 * Calcula la fecha exacta de próxima revisión sumando `intervalDays` a `baseDate`.
 *
 * La hora se conserva de `baseDate` (normalmente la hora actual)
 * para que las revisiones no se acumulen artificialmente a medianoche.
 *
 * @param intervalDays - Número de días hasta la próxima revisión.
 * @param baseDate     - Fecha de referencia. Default: ahora.
 * @returns            Objeto Date con la fecha de próxima revisión.
 */
export function getNextReviewDate(
  intervalDays: number,
  baseDate: Date = new Date()
): Date {
  const next = new Date(baseDate.getTime());
  next.setDate(next.getDate() + intervalDays);
  return next;
}

// ────────────────────────────────────────────────────────────────
// 4. getDueWords
// ────────────────────────────────────────────────────────────────

/**
 * Filtra y ordena las tarjetas que deben ser revisadas ahora.
 *
 * Criterios:
 * 1. `next_review_at` no es `null` (ya fue vista al menos una vez).
 * 2. `next_review_at <= now` (ya es el momento de revisarla).
 *
 * Ordenación:
 * - Primero las más vencidas (menor `next_review_at`).
 * - En caso de empate, las de menor `mastery_score` (más difíciles primero).
 *
 * @param allProgress - Array con todo el progreso del usuario.
 * @param limit       - Límite máximo de tarjetas devueltas. Default: `DEFAULT_SESSION_LIMIT`.
 * @param now         - Fecha de referencia. Default: ahora.
 * @returns           Array de progreso ordenado, listo para la sesión de repaso.
 */
export function getDueWords(
  allProgress: UserWordProgress[],
  limit: number = DEFAULT_SESSION_LIMIT,
  now: Date = new Date()
): UserWordProgress[] {
  const nowMs = now.getTime();

  return allProgress
    .filter(
      (p) =>
        p.next_review_at !== null &&
        new Date(p.next_review_at).getTime() <= nowMs
    )
    .sort((a, b) => {
      // Primero las más vencidas (fecha más antigua primero)
      const timeDiff =
        new Date(a.next_review_at!).getTime() -
        new Date(b.next_review_at!).getTime();
      if (timeDiff !== 0) return timeDiff;
      // En empate, menor mastery_score primero (más difíciles)
      return a.mastery_score - b.mastery_score;
    })
    .slice(0, limit);
}

// ────────────────────────────────────────────────────────────────
// 5. getSessionStats
// ────────────────────────────────────────────────────────────────

/**
 * Calcula las estadísticas agregadas de una sesión de estudio completada.
 *
 * @param results         - Array de resultados individuales de la sesión.
 * @param updatedProgress - Progreso actualizado tras la sesión (para calcular `words_due_tomorrow`).
 * @returns               Estadísticas de la sesión lista para mostrar al usuario y persistir.
 */
export function getSessionStats(
  results: ReviewResult[],
  updatedProgress: SM2Result[]
): SessionStats {
  if (results.length === 0) {
    return {
      total_reviewed: 0,
      correct_count: 0,
      accuracy_percentage: 0,
      average_quality: 0,
      words_due_tomorrow: 0,
      session_duration_seconds: 0,
    };
  }

  const total_reviewed = results.length;
  const correct_count = results.filter(
    (r) => r.quality >= MIN_PASSING_QUALITY
  ).length;
  const accuracy_percentage = Math.round((correct_count / total_reviewed) * 100);
  const average_quality =
    Math.round(
      (results.reduce((sum, r) => sum + r.quality, 0) / total_reviewed) * 10
    ) / 10;

  // Palabras cuyo próximo repaso es mañana (interval = 1 día)
  const words_due_tomorrow = updatedProgress.filter(
    (p) => p.interval_days === INITIAL_INTERVAL_DAYS
  ).length;

  // Duración total: de la primera a la última revisión
  const timestamps = results
    .map((r) => new Date(r.reviewed_at).getTime())
    .sort((a, b) => a - b);
  const session_duration_seconds =
    timestamps.length > 1
      ? Math.round((timestamps[timestamps.length - 1] - timestamps[0]) / 1000) +
        // Añadir el tiempo de la última respuesta como estimación
        (results[results.length - 1]?.response_time_seconds ?? 0)
      : results[0]?.response_time_seconds ?? 0;

  return {
    total_reviewed,
    correct_count,
    accuracy_percentage,
    average_quality,
    words_due_tomorrow,
    session_duration_seconds,
  };
}

// ────────────────────────────────────────────────────────────────
// 6. shouldShowWord
// ────────────────────────────────────────────────────────────────

/**
 * Decide si una palabra nueva debe ser incluida en la sesión actual.
 *
 * Reglas:
 * - Si ya se han mostrado `maxNewPerDay` palabras nuevas hoy → `false`.
 * - Si la palabra ya tiene `next_review_at` (fue vista antes) → `false` (no es "nueva").
 * - En caso contrario → `true`.
 *
 * @param progress      - Progreso de la palabra a evaluar.
 * @param newWordsToday - Número de palabras nuevas ya mostradas hoy en esta sesión.
 * @param maxNewPerDay  - Límite diario de palabras nuevas. Default: `MAX_NEW_PER_DAY`.
 * @returns             `true` si la palabra debe incluirse como nueva; `false` si no.
 */
export function shouldShowWord(
  progress: UserWordProgress,
  newWordsToday: number,
  maxNewPerDay: number = MAX_NEW_PER_DAY
): boolean {
  // Ya se alcanzó el límite diario de palabras nuevas
  if (newWordsToday >= maxNewPerDay) return false;

  // La palabra ya fue vista alguna vez → no es "nueva"
  if (progress.next_review_at !== null) return false;

  return true;
}

// ────────────────────────────────────────────────────────────────
// 7. getStudyQueue
// ────────────────────────────────────────────────────────────────

/**
 * Construye la cola de estudio intercalando repasos y palabras nuevas.
 *
 * Estrategia de intercalación:
 * - Las palabras nuevas se distribuyen uniformemente entre los repasos.
 * - Nunca se colocan palabras nuevas consecutivas si hay repasos disponibles.
 * - Ejemplo con 6 repasos y 2 nuevas: [R, N, R, R, N, R, R, R]
 *
 * @param options - Configuración de la cola (dueWords, newWords, maxNew, limit).
 * @returns       Cola de estudio con posición asignada a cada tarjeta.
 */
export function getStudyQueue(options: StudyQueueOptions): StudyQueue {
  const {
    dueWords,
    newWords,
    maxNew = MAX_NEW_PER_DAY,
    limit = DEFAULT_SESSION_LIMIT,
  } = options;

  // Limitar palabras nuevas al máximo permitido
  const cappedNewWords = newWords.slice(0, maxNew);

  // Total disponible sin exceder el límite de sesión
  const totalAvailable = dueWords.length + cappedNewWords.length;
  const totalCards = Math.min(totalAvailable, limit);

  // Calcular cuántas nuevas caben dentro del límite total
  const maxNewInQueue = Math.min(cappedNewWords.length, totalCards);
  const maxReviewInQueue = Math.min(
    dueWords.length,
    totalCards - maxNewInQueue
  );

  const reviewSlice = dueWords.slice(0, maxReviewInQueue);
  const newSlice = cappedNewWords.slice(0, maxNewInQueue);

  // ── Intercalación uniforme ───────────────────────────────
  // Calcular cada cuántos repasos insertar una palabra nueva.
  // Si hay más repasos que nuevas, el gap es mayor (distribución uniforme).
  const combined: QueueCard[] = [];

  if (newSlice.length === 0) {
    // Sin palabras nuevas: solo repasos
    reviewSlice.forEach((p, i) => {
      combined.push({ progress: p, type: "review", position: i });
    });
  } else if (reviewSlice.length === 0) {
    // Sin repasos: solo nuevas
    newSlice.forEach((p, i) => {
      combined.push({ progress: p, type: "new", position: i });
    });
  } else {
    // Calcular el paso de intercalación
    // Ej: 6 repasos, 2 nuevas → insertar nueva cada ceil(6/2) = 3 repasos
    const step = Math.ceil(reviewSlice.length / newSlice.length);

    let reviewIdx = 0;
    let newIdx = 0;
    let position = 0;
    let reviewsSinceLastNew = 0;

    while (reviewIdx < reviewSlice.length || newIdx < newSlice.length) {
      const canInsertNew =
        newIdx < newSlice.length &&
        reviewsSinceLastNew >= step - 1;
      const mustInsertNew =
        newIdx < newSlice.length && reviewIdx >= reviewSlice.length;

      if (canInsertNew || mustInsertNew) {
        combined.push({
          progress: newSlice[newIdx],
          type: "new",
          position,
        });
        newIdx++;
        reviewsSinceLastNew = 0;
      } else if (reviewIdx < reviewSlice.length) {
        combined.push({
          progress: reviewSlice[reviewIdx],
          type: "review",
          position,
        });
        reviewIdx++;
        reviewsSinceLastNew++;
      }
      position++;
    }
  }

  return {
    cards: combined,
    review_count: reviewSlice.length,
    new_count: newSlice.length,
    total_count: combined.length,
  };
}
