/**
 * Punto de entrada público del módulo SRS.
 * Re-exporta todos los tipos, constantes y funciones del motor.
 *
 * Uso recomendado en el resto de la app:
 * ```ts
 * import { calculateSM2, getDueWords, type UserWordProgress } from '@/lib/srs'
 * ```
 */

// Tipos
export type {
  CardType,
  QueueCard,
  ReviewQuality,
  ReviewResult,
  SM2Result,
  SessionStats,
  StudyQueue,
  StudyQueueOptions,
  UserWordProgress,
} from "./types";

// Constantes
export {
  DEFAULT_EASE_FACTOR,
  DEFAULT_SESSION_LIMIT,
  INITIAL_INTERVAL_DAYS,
  MASTERY_ACCURACY_WEIGHT,
  MASTERY_EASE_WEIGHT,
  MASTERY_INTERVAL_WEIGHT,
  MAX_INTERVAL_FOR_MASTERY,
  MAX_NEW_PER_DAY,
  MIN_EASE_FACTOR,
  MIN_PASSING_QUALITY,
  SECOND_INTERVAL_DAYS,
  XP_CORRECT_REVIEW,
  XP_NEW_WORD_LEARNED,
  XP_PERFECT_REVIEW,
  XP_SESSION_COMPLETED,
} from "./constants";

// Motor SRS
export {
  calculateMasteryScore,
  calculateSM2,
  getDueWords,
  getNextReviewDate,
  getSessionStats,
  getStudyQueue,
  shouldShowWord,
} from "./engine";
