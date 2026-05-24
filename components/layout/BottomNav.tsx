"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { BookOpen, GraduationCap, BarChart2, Settings } from "lucide-react";

interface NavTab {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TABS: NavTab[] = [
  { label: "Estudiar", href: "/study", icon: GraduationCap },
  { label: "Vocabulario", href: "/vocabulary", icon: BookOpen },
  { label: "Progreso", href: "/progress", icon: BarChart2 },
  { label: "Ajustes", href: "/settings", icon: Settings },
];

interface BottomNavProps {
  className?: string;
}

export function BottomNav({ className = "" }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-border bg-zinc-950/80 backdrop-blur-xl px-4 pb-safe-bottom md:hidden",
        className
      )}
    >
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto relative">
        {TABS.map((tab) => {
          // El dashboard se puede acceder por redirecciones, o si es la subruta de estudio
          const isActive = pathname.startsWith(tab.href);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center justify-center flex-1 h-full relative py-1 text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              {/* Animación del indicador de fondo estilo píldora/pestaña activa */}
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-x-2 inset-y-1.5 bg-zinc-900 rounded-xl -z-10 border border-white/5"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}

              <motion.div
                animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                className={cn("mb-1", isActive ? "text-brand" : "text-zinc-500")}
              >
                <Icon className="h-5 w-5" />
              </motion.div>

              <span
                className={cn(
                  "text-[10px] font-semibold tracking-wide transition-colors",
                  isActive ? "text-zinc-200" : "text-zinc-500"
                )}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;
