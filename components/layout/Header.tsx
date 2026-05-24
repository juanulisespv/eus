"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  className?: string;
}

export function Header({
  title,
  showBack = false,
  rightAction = null,
  className = "",
}: HeaderProps) {
  const router = useRouter();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full glass-panel border-b border-border bg-zinc-950/70 backdrop-blur-md px-4 py-3 flex items-center justify-between h-14",
        className
      )}
    >
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={() => router.back()}
            aria-label="Volver atrás"
            className="p-1.5 rounded-lg bg-zinc-900 border border-border text-zinc-400 hover:text-zinc-200 hover:border-active transition-all focus:outline-none focus:ring-1 focus:ring-brand"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
        <h1 className="text-sm font-bold tracking-tight text-zinc-100 uppercase letter-spacing-wide">
          {title}
        </h1>
      </div>

      {rightAction && (
        <div className="flex items-center gap-2">
          {rightAction}
        </div>
      )}
    </header>
  );
}

export default Header;
