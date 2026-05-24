"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { QualityButtons } from "./QualityButtons";
import { Volume2 } from "lucide-react";

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

export function FlashCard({
  word,
  onQualitySelect,
  className = "",
}: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Gestos manuales con punteros para mobile
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    // Solo permitir cierto arrastre visual sutil para feedback
    setSwipeOffset({ x: dx * 0.4, y: dy * 0.1 });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);

    const threshold = 120; // Umbral de swipe en píxeles
    const dx = e.clientX - dragStart.current.x;

    if (dx > threshold) {
      // Swipe Derecha -> Acierto Fácil (5)
      onQualitySelect(5);
    } else if (dx < -threshold) {
      // Swipe Izquierda -> Fallo total (0)
      onQualitySelect(0);
    } else {
      // Si fue solo un tap/click rápido, voltear la tarjeta
      if (Math.abs(dx) < 10) {
        setIsFlipped((prev) => !prev);
      }
    }
    setSwipeOffset({ x: 0, y: 0 });
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
    <div className={cn("w-full max-w-md h-[450px] perspective-1000 select-none", className)}>
      <motion.div
        className="w-full h-full relative preserve-3d cursor-pointer"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        animate={{
          rotateY: isFlipped ? 180 : 0,
          x: swipeOffset.x,
          y: swipeOffset.y,
          rotateZ: swipeOffset.x * 0.05,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {/* Lado Frontal (Euskera) */}
        <div
          className={cn(
            "absolute inset-0 w-full h-full backface-hidden glass-panel rounded-3xl p-8 flex flex-col justify-between border border-border shadow-glass glow-border bg-zinc-900/90",
            isFlipped ? "pointer-events-none" : ""
          )}
        >
          <div className="flex justify-between items-center">
            <Badge type="category" label={word.category} />
            <Badge type="difficulty" label={`Dificultad ${word.difficulty}`} />
          </div>

          <div className="flex-1 flex flex-col justify-center items-center text-center space-y-4">
            <h2 className="text-4xl font-extrabold text-zinc-100 tracking-tightest">
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
                className="p-3 bg-zinc-800/80 rounded-full hover:bg-zinc-700 text-zinc-300 hover:text-brand transition-colors mt-2"
              >
                <Volume2 className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="text-center text-xs text-zinc-500 animate-pulse">
            Toca para voltear o desliza (← Mal | Bien →)
          </div>
        </div>

        {/* Lado Posterior (Traducción + Detalles) */}
        <div
          className={cn(
            "absolute inset-0 w-full h-full backface-hidden glass-panel rounded-3xl p-8 flex flex-col justify-between border border-border shadow-glass bg-zinc-900/95 rotate-y-180",
            !isFlipped ? "pointer-events-none" : ""
          )}
        >
          <div className="space-y-5 overflow-y-auto max-h-[300px] pr-1">
            <div className="border-b border-border pb-3">
              <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Traducción</span>
              <h3 className="text-2xl font-bold text-zinc-100 mt-1">{word.translation_es}</h3>
            </div>

            {word.definition_simple && (
              <div>
                <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Definición simple</span>
                <p className="text-sm text-zinc-300 mt-1">{word.definition_simple}</p>
              </div>
            )}

            {currentExample && (
              <div className="bg-zinc-950/60 p-4 rounded-2xl border border-border/50">
                <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Ejemplo</span>
                <p className="font-semibold text-zinc-200 text-sm mt-1">{currentExample.sentence_eu}</p>
                <p className="text-xs text-zinc-400 mt-1">{currentExample.sentence_es}</p>
              </div>
            )}

            {word.uso_habitual && (
              <div>
                <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Contexto de uso</span>
                <p className="text-xs text-zinc-400 mt-1">{word.uso_habitual}</p>
              </div>
            )}
          </div>

          {/* Botones de calidad para evaluar la tarjeta */}
          <div className="pt-4 border-t border-border mt-auto">
            <QualityButtons onSelect={(q) => onQualitySelect(q)} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default FlashCard;
