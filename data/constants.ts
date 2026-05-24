export const WORD_CATEGORIES = [
  { id: "sustantivo", label: "Sustantivo" },
  { id: "verbo", label: "Verbo" },
  { id: "adjetivo", label: "Adjetivo" },
  { id: "adverbio", label: "Adverbio" },
  { id: "preposicion", label: "Preposición" },
  { id: "conjuncion", label: "Conjunción" },
  { id: "pronombre", label: "Pronombre" },
  { id: "frase_hecha", label: "Frase Hecha" },
  { id: "numero", label: "Número" },
  { id: "saludo", label: "Saludo" },
  { id: "otro", label: "Otro" },
] as const;

export const DIALECTS = [
  { id: "batua", label: "Batua (Estándar)" },
  { id: "bizkaiera", label: "Bizkaiera (Vizcaíno)" },
  { id: "gipuzkera", label: "Gipuzkera (Guipuzcoano)" },
  { id: "lapurtera", label: "Lapurtera" },
  { id: "otro", label: "Otro" },
] as const;

export const LEVEL_LABELS = {
  A1: "A1 - Inicial",
  A2: "A2 - Básico",
  B1: "B1 - Pre-intermedio",
  B2: "B2 - Intermedio",
  C1: "C1 - Avanzado",
  C2: "C2 - Nativo/Maestría",
} as const;

export const XP_REWARDS = {
  CARD_REVIEW_CORRECT: 10,
  CARD_REVIEW_PERFECT: 15,
  NEW_CARD_LEARNED: 20,
  SESSION_COMPLETED: 50,
} as const;
