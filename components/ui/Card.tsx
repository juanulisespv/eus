"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type PaddingSize = "none" | "sm" | "md" | "lg";
type RoundedSize = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  interactive?: boolean;
  padding?: PaddingSize;
  rounded?: RoundedSize;
}

export function Card({
  children,
  interactive = false,
  padding = "md",
  rounded = "2xl",
  className = "",
  ...props
}: CardProps) {
  const paddings = {
    none: "p-0",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  const roundeds = {
    sm: "rounded-lg",
    md: "rounded-xl",
    lg: "rounded-2xl",
    xl: "rounded-xl", // Mapped for consistency with design spec
    "2xl": "rounded-2xl",
    "3xl": "rounded-3xl",
  };

  const Component = interactive ? motion.div : "div";

  const motionProps = interactive
    ? {
        whileHover: { y: -4, borderColor: "rgba(255, 255, 255, 0.12)" },
        whileTap: { scale: 0.99 },
        transition: { type: "spring", stiffness: 400, damping: 25 },
      }
    : {};

  return (
    <Component
      className={cn(
        "glass-panel border border-border bg-zinc-900/60 shadow-glass transition-colors duration-200",
        paddings[padding],
        roundeds[rounded],
        className
      )}
      {...motionProps}
      {...(props as any)}
    >
      {children}
    </Component>
  );
}

export default Card;
