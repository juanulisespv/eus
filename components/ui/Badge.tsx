import React from "react";
import { cn } from "@/lib/utils";

type BadgeType = "category" | "difficulty" | "mastery" | "due";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  label: string;
  type?: BadgeType;
}

export function Badge({ label, type = "category", className = "", ...props }: BadgeProps) {
  const types = {
    category: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    difficulty: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    mastery: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    due: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border tracking-wide uppercase select-none",
        types[type],
        className
      )}
      {...props}
    >
      {label}
    </span>
  );
}

export default Badge;
