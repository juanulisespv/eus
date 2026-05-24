"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Loguear el error en servicios de telemetría o consola
    console.error("Runtime error caught:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-zinc-100 tracking-tight">Ceba egin du / Algo salió mal</h1>
          <p className="text-zinc-500 text-sm max-w-xs mx-auto">
            Ha ocurrido un error inesperado al procesar la solicitud. Intenta recargar la vista o vuelve al panel.
          </p>
          {error.digest && (
            <p className="text-[10px] font-mono text-zinc-600 bg-zinc-900/60 py-1 px-2 rounded border border-white/5 inline-block select-all">
              ID del error: {error.digest}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button onClick={reset} variant="secondary" className="flex items-center gap-2 justify-center">
            <RotateCcw className="w-4 h-4" /> Reintentar
          </Button>
          <Link href="/dashboard" className="w-full">
            <Button className="w-full flex items-center gap-2 justify-center">
              <Home className="w-4 h-4" /> Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
