"use client";

import React, { useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend = "neutral",
  className = "",
}: StatsCardProps) {
  // Animación del número en mount
  const textRef = useRef<HTMLSpanElement>(null);
  
  // Extraer valor numérico y sufijo (ej: "85%" -> value = 85, suffix = "%")
  const valueStr = String(value);
  const numericMatch = valueStr.match(/^(\d+(?:\.\d+)?)(.*)$/);
  const numericVal = numericMatch ? parseFloat(numericMatch[1]) : null;
  const suffix = numericMatch ? numericMatch[2] : "";

  const motionValue = useMotionValue(0);
  const roundedValue = useTransform(motionValue, (latest) => {
    // Si tiene decimales en el original, conservar un decimal, si no redondear
    const hasDecimals = valueStr.includes(".");
    const formatted = hasDecimals ? latest.toFixed(1) : Math.round(latest).toString();
    return `${formatted}${suffix}`;
  });

  useEffect(() => {
    if (numericVal !== null) {
      const controls = animate(motionValue, numericVal, {
        duration: 1.2,
        ease: "easeOut",
      });
      return () => controls.stop();
    }
  }, [numericVal, motionValue]);

  // Suscribirse al cambio de valor para actualizar directamente el DOM (evita re-renders)
  useEffect(() => {
    if (numericVal !== null && textRef.current) {
      return roundedValue.on("change", (latest) => {
        if (textRef.current) textRef.current.textContent = latest;
      });
    }
  }, [roundedValue, numericVal]);

  const trends = {
    up: { icon: TrendingUp, color: "text-emerald-400" },
    down: { icon: TrendingDown, color: "text-red-400" },
    neutral: { icon: Minus, color: "text-zinc-500" },
  };

  const TrendIcon = trends[trend].icon;

  return (
    <Card interactive padding="md" className={cn("flex flex-col justify-between min-h-[140px]", className)}>
      <div className="flex justify-between items-start">
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{title}</span>
        <div className="p-2 bg-zinc-800/60 border border-white/5 rounded-xl text-brand">
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-4 space-y-1">
        <h3 className="text-3xl font-extrabold tracking-tightest text-zinc-100 flex items-baseline">
          {numericVal !== null ? (
            <span ref={textRef}>0{suffix}</span>
          ) : (
            <span>{value}</span>
          )}
        </h3>
        <div className="flex items-center gap-1.5">
          <TrendIcon className={cn("h-3.5 w-3.5", trends[trend].color)} />
          <span className="text-xs text-zinc-500 font-medium">{subtitle}</span>
        </div>
      </div>
    </Card>
  );
}

export default StatsCard;
