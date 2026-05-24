"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Mail, Lock, Zap, AlertCircle, CheckCircle2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectedFrom") || "/dashboard";
  const callbackError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "magic">("signin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    callbackError ? "Error de autenticación. Inténtalo de nuevo." : null
  );
  const [success, setSuccess] = useState<string | null>(null);

  const supabase = createClient();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(signInError.message === "Invalid login credentials"
        ? "Email o contraseña incorrectos."
        : signInError.message);
      setLoading(false);
      return;
    }

    window.location.href = redirectTo;
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError("Introduce tu email para recibir el enlace."); return; }
    setLoading(true);
    setError(null);

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}` },
    });

    setLoading(false);
    if (otpError) { setError(otpError.message); return; }
    setSuccess(`Enlace enviado a ${email}. Revisa tu bandeja de entrada.`);
  };

  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      {/* Glow backgrounds */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-violet-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 mb-4">
            <span className="text-xl font-black text-violet-400">E</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Saioa Hasi</h1>
          <p className="text-sm text-zinc-500 mt-1">Continúa aprendiendo euskera</p>
        </div>

        {/* Card */}
        <div className="bg-zinc-900/60 border border-white/[0.06] rounded-2xl p-6 backdrop-blur-sm shadow-xl">
          {/* Error / Success */}
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl mb-5 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-start gap-2.5 p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-5 text-emerald-400 text-sm">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={mode === "signin" ? handleSignIn : handleMagicLink} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="ikasle@euskara.eus"
                  required
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/80 border border-white/[0.06] rounded-xl text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password (only in signin mode) */}
            {mode === "signin" && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    minLength={6}
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/80 border border-white/[0.06] rounded-xl text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20 transition-all disabled:opacity-50"
                  />
                </div>
              </div>
            )}

            <Button type="submit" isLoading={loading} className="w-full" size="lg">
              {mode === "signin" ? "Entrar" : "Enviar enlace mágico"}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-xs text-zinc-600 uppercase tracking-wider">o</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          {/* Magic link toggle */}
          <button
            type="button"
            onClick={() => { setMode(mode === "signin" ? "magic" : "signin"); setError(null); setSuccess(null); }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-white/[0.06] bg-zinc-900/50 text-sm text-zinc-400 hover:text-zinc-200 hover:border-white/[0.12] transition-all"
          >
            <Zap className="w-4 h-4 text-violet-400" />
            {mode === "signin" ? "Entrar con Magic Link (sin contraseña)" : "Volver al login con contraseña"}
          </button>
        </div>

        {/* Signup link */}
        <p className="text-center text-sm text-zinc-600 mt-5">
          ¿Aún no tienes cuenta?{" "}
          <a href="/auth/signup" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
            Regístrate gratis
          </a>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </main>
    }>
      <LoginForm />
    </Suspense>
  );
}
