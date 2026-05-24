/**
 * Lógica del motor de Repetición Espaciada SM-2 (SuperMemo 2).
 */

export interface SRSState {
  easeFactor: number;    // Factor de facilidad
  intervalDays: number;  // Días hasta el próximo repaso
  repetitions: number;   // Racha de repeticiones consecutivas exitosas
}

export type SRSQuality = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * Calcula el siguiente estado del algoritmo SM-2 según la calidad de respuesta.
 * 
 * Calificaciones de calidad:
 * 0: "Olvido total" - sin reconocimiento.
 * 1: "Respuesta incorrecta" - tras pensarlo, se recuerda mal.
 * 2: "Respuesta incorrecta" - se reconoce la palabra con ayuda.
 * 3: "Respuesta correcta" - recordado con mucha dificultad.
 * 4: "Respuesta correcta" - recordado con una breve pausa.
 * 5: "Respuesta correcta" - recordado perfectamente al instante.
 */
export function calculateSM2(
  currentState: SRSState,
  quality: SRSQuality
): SRSState {
  let { easeFactor, intervalDays, repetitions } = currentState;

  if (quality < 3) {
    // Si la respuesta es incorrecta, se reinicia el intervalo a 1 día
    // y se reinician las repeticiones consecutivas exitosas.
    return {
      easeFactor, // El factor de facilidad no baja inmediatamente por debajo del mínimo de 1.3
      intervalDays: 1,
      repetitions: 0,
    };
  }

  // Si la respuesta es correcta, calculamos el nuevo factor de facilidad (Ease Factor)
  // Fórmula estándar SM-2: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  const newEaseFactor =
    easeFactor +
    (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  // Limitar el factor de facilidad a un mínimo absoluto de 1.3
  const finalEaseFactor = Math.max(1.3, newEaseFactor);

  let nextInterval: number;
  if (repetitions === 0) {
    nextInterval = 1;
  } else if (repetitions === 1) {
    nextInterval = 6;
  } else {
    nextInterval = Math.round(intervalDays * finalEaseFactor);
  }

  return {
    easeFactor: Math.round(finalEaseFactor * 100) / 100, // Redondear a 2 decimales
    intervalDays: nextInterval,
    repetitions: repetitions + 1,
  };
}
