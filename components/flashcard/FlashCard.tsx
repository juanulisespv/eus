"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { QualityButtons } from "./QualityButtons";
import { Volume2, ThumbsUp, ThumbsDown } from "lucide-react";

export interface WordData {
  id: string;
  word_eu: string;
  translation_es: string;
  translation_en?: string | null;
  category: "sustantivo" | "verbo" | "adjetivo" | "adverbio" | "preposicion" | "conjuncion" | "pronombre" | "frase_hecha" | "numero" | "saludo" | "otro";
  difficulty: number;
  pronunciation?: string | null;
  audio_url?: string | null;
  definition_simple?: string | null;
  uso_habitual?: string | null;
  examples?: Array<{
    sentence_eu: string;
    sentence_es: string;
  }>;
}

interface FlashCardProps {
  word: WordData;
  onQualitySelect: (quality: 0 | 1 | 2 | 3 | 4 | 5) => void;
  className?: string;
}

// Umbral en píxeles para activar el swipe
const SWIPE_THRESHOLD = 80;

export function FlashCard({
  word,
  onQualitySelect,
  className = "",
}: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Valores de movimiento para tracking en tiempo real (sin re-renders)
  const x = useMotionValue(0);

  // Opacidad de los indicadores de feedback en los extremos
  const rightOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  const leftOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);

  // Color de fondo sutil según dirección del arrastre
  const bgColor = useTransform(
    x,
    [-SWIPE_THRESHOLD * 1.5, 0, SWIPE_THRESHOLD * 1.5],
    ["rgba(239,68,68,0.08)", "rgba(0,0,0,0)", "rgba(34,197,94,0.08)"]
  );

  // Rotación de la tarjeta al arrastrar
  const rotate = useTransform(x, [-200, 0, 200], [-12, 0, 12]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const offsetX = info.offset.x;

    if (offsetX > SWIPE_THRESHOLD) {
      // Swipe derecha → Bien (4)
      onQualitySelect(4);
    } else if (offsetX < -SWIPE_THRESHOLD) {
      // Swipe izquierda → Mal (0)
      onQualitySelect(0);
    }
    // Si no supera el umbral, Framer Motion vuelve la tarjeta al centro (spring)
  };

  const handleTap = () => {
    // Solo voltear si el arrastre fue mínimo (un tap real)
    if (Math.abs(x.get()) < 5) {
      setIsFlipped((prev) => !prev);
    }
  };

  // Reproducir audio si está disponible
  const playAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (word.audio_url) {
      const audio = new Audio(word.audio_url);
      audio.play().catch((err) => console.log("Audio play failed", err));
    }
  };

  const currentExample = word.examples?.[0];

  return (
    <div className={cn("w-full max-w-md select-none", className)} style={{ perspective: "1000px" }}>
      {/* Capa de feedback de swipe (← Mal | Bien →) */}
      <div className="relative w-full h-[460px]">

        {/* Indicador izquierdo: Mal */}
        <motion.div
          style={{ opacity: leftOpacity }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex items-center gap-2 bg-red-500/20 border border-red-500/40 text-red-400 font-bold text-lg px-4 py-2 rounded-2xl pointer-events-none"
        >
          <ThumbsDown className="w-5 h-5" /> Mal
        </motion.div>

        {/* Indicador derecho: Bien */}
        <motion.div
          style={{ opacity: rightOpacity }}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-lg px-4 py-2 rounded-2xl pointer-events-none"
        >
          Bien <ThumbsUp className="w-5 h-5" />
        </motion.div>

        {/* Tarjeta arrastrable */}
        <motion.div
          style={{ x, rotate, backgroundColor: bgColor, rotateY: isFlipped ? 180 : 0 }}
          drag={isFlipped ? false : "x"}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.15}
          onDragEnd={handleDragEnd}
          onClick={handleTap}
          whileTap={{ scale: isFlipped ? 1 : 0.98 }}
          className="absolute inset-0 w-full h-full rounded-3xl cursor-grab active:cursor-grabbing preserve-3d"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          {/* ── CARA FRONTAL (Euskera) ─────────────────────── */}
          <div
            className={cn(
              "absolute inset-0 w-full h-full backface-hidden rounded-3xl p-6 flex flex-col justify-between",
              "bg-zinc-900/95 border border-white/[0.08] shadow-xl",
              isFlipped ? "pointer-events-none" : ""
            )}
          >
            {/* Header */}
            <div className="flex justify-between items-center">
              <Badge type="category" label={word.category} />
              <Badge type="difficulty" label={`Dificultad ${word.difficulty}`} />
            </div>

            {/* Palabra central */}
            <div className="flex-1 flex flex-col justify-center items-center text-center space-y-3 py-4">
              <h2 className="text-5xl font-extrabold text-zinc-100 tracking-tighter">
                {word.word_eu}
              </h2>
              {word.pronunciation && (
                <span className="text-zinc-500 font-mono text-sm">
                  [{word.pronunciation}]
                </span>
              )}
              {word.audio_url && (
                <button
                  onClick={playAudio}
                  aria-label="Escuchar pronunciación"
                  className="p-3 bg-zinc-800/80 rounded-full hover:bg-zinc-700 text-zinc-300 hover:text-violet-400 transition-colors mt-2"
                >
                  <Volume2 className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Pista de interacción */}
            <div className="text-center space-y-1">
              <p className="text-xs text-zinc-600 font-medium">
                Toca para ver la respuesta
              </p>
              <div className="flex items-center justify-center gap-3 text-[11px] text-zinc-700">
                <span>← Desliza si fallaste</span>
                <span>·</span>
                <span>Desliza si acertaste →</span>
              </div>
            </div>
          </div>

          {/* ── CARA POSTERIOR (Traducción) ─────────────────── */}
          <div
            className={cn(
              "absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-3xl p-6 flex flex-col justify-between",
              "bg-zinc-900/95 border border-white/[0.08] shadow-xl",
              !isFlipped ? "pointer-events-none" : ""
            )}
          >
            {/* Contenido de la traducción */}
            <div className="space-y-4 overflow-y-auto flex-1 pr-1">
              <div className="border-b border-white/[0.06] pb-3">
                <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Traducción</span>
                <h3 className="text-3xl font-bold text-zinc-100 mt-1">{word.translation_es}</h3>
              </div>

              {word.definition_simple && (
                <div>
                  <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Definición simple</span>
                  <p className="text-sm text-zinc-300 mt-1 leading-relaxed">{word.definition_simple}</p>
                </div>
              )}

              {currentExample && (
                <div className="bg-zinc-950/60 p-4 rounded-2xl border border-white/[0.05]">
                  <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Ejemplo</span>
                  <p className="font-semibold text-zinc-200 text-sm mt-1">{currentExample.sentence_eu}</p>
                  <p className="text-xs text-zinc-400 mt-1">{currentExample.sentence_es}</p>
                </div>
              )}

              {word.uso_habitual && (
                <div>
                  <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Contexto de uso</span>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{word.uso_habitual}</p>
                </div>
              )}
            </div>

            {/* Botones de calidad */}
            <div className="pt-3 border-t border-white/[0.06] mt-3 shrink-0">
              <p className="text-[11px] text-zinc-600 text-center mb-2">¿Cómo te fue?</p>
              <QualityButtons onSelect={(q) => onQualitySelect(q)} />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default FlashCard;
