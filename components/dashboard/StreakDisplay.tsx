"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Flame, Award } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  className?: string;
}

export function StreakDisplay({
  currentStreak,
  longestStreak,
  className = "",
}: StreakDisplayProps) {
  const isSuperStreak = currentStreak >= 7;

  return (
    <Card
      interactive
      className={cn(
        "relative overflow-hidden border bg-zinc-900/60",
        isSuperStreak
          ? "border-amber-500/20 shadow-[0_0_25px_rgba(245,158,11,0.08)] bg-gradient-to-br from-zinc-900/80 via-zinc-900 to-amber-950/20"
          : "border-border",
        className
      )}
    >
      {/* Efectos decorativos de fondo si es súper racha */}
      {isSuperStreak && (
        <div className="absolute right-[-20px] bottom-[-20px] opacity-5 pointer-events-none select-none">
          <Flame className="h-40 w-40 text-amber-500 fill-amber-500" />
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <motion.div
              animate={
                isSuperStreak
                  ? {
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    }
                  : {}
              }
              transition={{
                repeat: Infinity,
                duration: 2.5,
                ease: "easeInOut",
              }}
              className={cn(
                "p-3 rounded-2xl border flex items-center justify-center",
                isSuperStreak
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                  : "bg-zinc-800/60 border-white/5 text-zinc-400"
              )}
            >
              <Flame className={cn("h-6 w-6", isSuperStreak ? "fill-amber-500/20" : "")} />
            </motion.div>
            {isSuperStreak && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
            )}
          </div>

          <div className="space-y-0.5">
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Racha Activa</h4>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-zinc-100">{currentStreak} días</span>
              {isSuperStreak && (
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-md uppercase tracking-wide">
                  ¡Imparable!
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="text-right border-l border-border/60 pl-6 space-y-1">
          <div className="flex items-center gap-1 text-zinc-500 justify-end">
            <Award className="h-3.5 w-3.5" />
            <span className="text-[10px] font-semibold uppercase tracking-wider">Récord</span>
          </div>
          <p className="text-lg font-bold text-zinc-300">{longestStreak} días</p>
        </div>
      </div>
    </Card>
  );
}

export default StreakDisplay;
