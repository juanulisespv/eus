"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Mail, Lock, AlertCircle, CheckCircle2 } from "lucide-react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
    });
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    setSuccess(true);
  };

  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-violet-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 mb-4">
            <span className="text-xl font-black text-violet-400">E</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Crear cuenta</h1>
          <p className="text-sm text-zinc-500 mt-1">Empieza a aprender euskera hoy</p>
        </div>

        <div className="bg-zinc-900/60 border border-white/[0.06] rounded-2xl p-6 backdrop-blur-sm shadow-xl">
          {success ? (
            <div className="text-center py-4 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h2 className="text-lg font-semibold text-zinc-100">¡Revisa tu email!</h2>
              <p className="text-sm text-zinc-400">
                Hemos enviado un enlace de confirmación a <strong className="text-zinc-200">{email}</strong>.
              </p>
              <a href="/auth/login" className="inline-block text-sm text-violet-400 hover:text-violet-300 mt-2">
                Volver al login →
              </a>
            </div>
          ) : (
            <>
              {error && (
                <div className="flex items-start gap-2.5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl mb-5 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSignup} className="space-y-4">
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

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      required
                      disabled={loading}
                      minLength={6}
                      className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/80 border border-white/[0.06] rounded-xl text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20 transition-all disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Confirmar contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input
                      type="password"
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      placeholder="Repite la contraseña"
                      required
                      disabled={loading}
                      className={`w-full pl-10 pr-4 py-2.5 bg-zinc-950/80 border rounded-xl text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 transition-all disabled:opacity-50 ${
                        confirm && confirm !== password
                          ? "border-red-500/40 focus:border-red-500/40 focus:ring-red-500/20"
                          : "border-white/[0.06] focus:border-violet-500/40 focus:ring-violet-500/20"
                      }`}
                    />
                  </div>
                  {confirm && confirm !== password && (
                    <p className="text-xs text-red-400 pl-1">Las contraseñas no coinciden</p>
                  )}
                </div>

                <Button type="submit" isLoading={loading} className="w-full" size="lg">
                  Crear cuenta
                </Button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-sm text-zinc-600 mt-5">
          ¿Ya tienes cuenta?{" "}
          <a href="/auth/login" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
            Inicia sesión
          </a>
        </p>
      </div>
    </main>
  );
}
