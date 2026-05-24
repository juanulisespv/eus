"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface CategorySelectorProps {
  categories: string[];
}

export function CategorySelector({ categories }: CategorySelectorProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleCategory = (cat: string) => {
    const newSet = new Set(selected);
    if (newSet.has(cat)) {
      newSet.delete(cat);
    } else {
      newSet.add(cat);
    }
    setSelected(newSet);
  };

  const handleStart = () => {
    if (selected.size === 0) {
      router.push("/study?categories=all");
    } else {
      router.push(`/study?categories=${Array.from(selected).join(',')}`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Contenedor scrolleable con altura máxima para ahorrar espacio */}
      <div className="max-h-40 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => {
            const isSelected = selected.has(c);
            return (
              <button
                key={c}
                onClick={() => toggleCategory(c)}
                className={cn(
                  "px-3 py-1.5 rounded-lg font-medium text-sm transition-all border capitalize",
                  isSelected
                    ? "bg-violet-600 text-white border-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                    : "bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 border-white/[0.06] hover:bg-zinc-700 hover:border-white/[0.12]"
                )}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>
      
      <Button onClick={handleStart} className="w-full py-6 text-base font-bold shadow-[0_0_20px_rgba(139,92,246,0.15)]">
        {selected.size === 0 ? "Repasar todo mezclado" : `Repasar ${selected.size} categorí${selected.size === 1 ? "a" : "as"}`}
      </Button>
    </div>
  );
}
