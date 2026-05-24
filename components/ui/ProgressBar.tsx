"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type ProgressColor = "brand" | "purple" | "blue" | "orange" | "red";
type ProgressSize = "sm" | "md";

interface ProgressBarProps {
  value: number; // 0-100
  color?: ProgressColor;
  size?: ProgressSize;
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  color = "brand",
  size = "md",
  showLabel = false,
  className = "",
}: ProgressBarProps) {
  // Asegurar rango 0-100
  const clampedValue = Math.min(100, Math.max(0, value));

  const colors = {
    brand: "bg-brand shadow-[0_0_10px_rgba(0,229,117,0.3)]",
    purple: "bg-violet-500 shadow-[0_0_10px_rgba(124,58,237,0.3)]",
    blue: "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]",
    orange: "bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.3)]",
    red: "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]",
  };

  const sizes = {
    sm: "h-1.5",
    md: "h-2.5",
  };

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-semibold text-zinc-400">
          <span>Progreso</span>
          <span className="font-mono text-zinc-200">{Math.round(clampedValue)}%</span>
        </div>
      )}
      <div className={cn("w-full bg-zinc-800/80 rounded-full overflow-hidden border border-white/5", sizes[size])}>
        <motion.div
          className={cn("h-full rounded-full transition-all duration-300", colors[color])}
          initial={{ width: 0 }}
          animate={{ width: `${clampedValue}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
