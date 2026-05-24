import React from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glow?: boolean;
}

export function GlassCard({ children, glow = false, className = "", ...props }: GlassCardProps) {
  return (
    <div
      className={`glass-panel rounded-2xl p-6 shadow-glass transition-all ${
        glow ? "glow-border shadow-glow" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
