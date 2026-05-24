"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type QualityValue = 0 | 2 | 4 | 5;

interface QualityOption {
  label: string;
  value: QualityValue;
  colorClass: string;
  hoverClass: string;
  bgGlowClass: string;
  description: string;
}

const QUALITY_OPTIONS: QualityOption[] = [
  {
    label: "Mal",
    value: 0,
    colorClass: "text-red-400 border-red-500/20 bg-red-950/20",
    hoverClass: "hover:bg-red-500 hover:text-zinc-950",
    bgGlowClass: "group-hover:bg-red-500/10",
    description: "Repetir pronto",
  },
  {
    label: "Difícil",
    value: 2,
    colorClass: "text-amber-400 border-amber-500/20 bg-amber-950/20",
    hoverClass: "hover:bg-amber-500 hover:text-zinc-950",
    bgGlowClass: "group-hover:bg-amber-500/10",
    description: "Con esfuerzo",
  },
  {
    label: "Bien",
    value: 4,
    colorClass: "text-blue-400 border-blue-500/20 bg-blue-950/20",
    hoverClass: "hover:bg-blue-500 hover:text-zinc-950",
    bgGlowClass: "group-hover:bg-blue-500/10",
    description: "Buen recuerdo",
  },
  {
    label: "Fácil",
    value: 5,
    colorClass: "text-emerald-400 border-emerald-500/20 bg-emerald-950/20",
    hoverClass: "hover:bg-emerald-500 hover:text-zinc-950",
    bgGlowClass: "group-hover:bg-emerald-500/10",
    description: "Perfecto",
  },
];

interface QualityButtonsProps {
  onSelect: (quality: 0 | 2 | 4 | 5) => void;
  className?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const buttonVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.2 } },
};

export function QualityButtons({ onSelect, className = "" }: QualityButtonsProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={cn("grid grid-cols-4 gap-2 w-full", className)}
    >
      {QUALITY_OPTIONS.map((opt) => (
        <motion.button
          key={opt.value}
          variants={buttonVariants}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(opt.value);
          }}
          className={cn(
            "group flex flex-col items-center justify-center py-2.5 px-1 border rounded-xl transition-all duration-200",
            opt.colorClass,
            opt.hoverClass
          )}
        >
          <span className="text-sm font-bold tracking-tight">{opt.label}</span>
          <span className="text-[10px] opacity-75 mt-0.5 hidden sm:inline-block">
            {opt.description}
          </span>
        </motion.button>
      ))}
    </motion.div>
  );
}

export default QualityButtons;
