import Link from "next/link";
import { HelpCircle, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto">
          <HelpCircle className="w-8 h-8 text-violet-400" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-zinc-100 tracking-tight">404</h1>
          <h2 className="text-xl font-bold text-zinc-200">Ez da aurkitu / No encontrado</h2>
          <p className="text-zinc-500 text-sm max-w-xs mx-auto">
            La página que buscas no existe o ha sido movida. Vuelve al panel para continuar aprendiendo euskera.
          </p>
        </div>

        <Link href="/dashboard" className="block w-full">
          <Button className="w-full flex items-center gap-2 justify-center">
            <Home className="w-4 h-4" /> Volver al Dashboard
          </Button>
        </Link>
      </div>
    </main>
  );
}
