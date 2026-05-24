"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled = false,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:pointer-events-none select-none";

  const variants = {
    primary: "bg-brand text-zinc-950 hover:bg-brand-hover shadow-glow focus:ring-brand",
    secondary: "glass-panel border-border text-zinc-100 hover:bg-zinc-800/80 focus:ring-zinc-700",
    ghost: "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50 focus:ring-zinc-800",
    danger: "bg-red-500 text-zinc-950 hover:bg-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15)] focus:ring-red-500",
  };

  const sizes = {
    sm: "px-3.5 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3 text-base",
  };

  return (
    <motion.button
      whileHover={!disabled && !isLoading ? { scale: 1.015 } : undefined}
      whileTap={!disabled && !isLoading ? { scale: 0.985 } : undefined}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...(props as any)}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          <span>Cargando...</span>
        </>
      ) : (
        children
      )}
    </motion.button>
  );
}

export default Button;
