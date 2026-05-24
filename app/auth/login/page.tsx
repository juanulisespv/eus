"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Mail, Lock, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen w-full flex items-center justify-center p-6 bg-[#08090a]">
        <div className="w-full max-w-md glass-panel p-8 rounded-3xl text-center text-text-secondary">
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Kargatzen / Cargando...</p>
        </div>
      </main>
    }>
      <LoginFormContent />
    </Suspense>
  );
}

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Obtener parámetros de redirección y posibles errores de callback
  const redirectedFrom = searchParams.get("redirectedFrom") || "/dashboard";
  const callbackError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(callbackError ? "Hubo un error de autenticación. Inténtalo de nuevo." : null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const supabase = createClient();

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${redirectedFrom}`,
          },
        });

        if (signUpError) {
          setError(signUpError.message);
        } else {
          setSuccess("¡Registro iniciado! Por favor revisa tu correo electrónico para confirmar la cuenta.");
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setError(signInError.message);
        } else {
          router.push(redirectedFrom);
          router.refresh();
        }
      }
    } catch (err: any) {
      setError(err.message || "Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    const supabase = createClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${redirectedFrom}`,
      },
    });

    if (oauthError) {
      setError(oauthError.message);
    }
  };

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center p-6 bg-[#08090a] overflow-hidden">
      {/* Luces y fondos decorativos de fondo (Mesh Gradients / Blobs) */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand/10 blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }}></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent-purple/10 blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '12s' }}></div>
      <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] rounded-full bg-accent-blue/5 blur-[100px] pointer-events-none"></div>

      {/* Tarjeta de Login Premium */}
      <div className="relative w-full max-w-md glass-panel p-8 md:p-10 rounded-3xl space-y-8 glow-border shadow-glass z-10 transition-all duration-300">
        
        {/* Cabecera / Logo y Título */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand/20 to-brand-hover/10 border border-brand/30 shadow-glow mb-2">
            <span className="text-2xl font-black text-brand tracking-tighter">Eu</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tightest bg-gradient-to-b from-text-primary via-text-primary to-text-secondary bg-clip-text text-transparent">
            {isSignUp ? "Sortu Kontua" : "Saioa Hasi"}
          </h2>
          <p className="text-text-secondary text-sm font-medium">
            {isSignUp
              ? "Regístrate para comenzar con tu repetición espaciada"
              : "Inicia sesión para continuar con tus repasos"}
          </p>
        </div>

        {/* Notificaciones de Error/Éxito */}
        {error && (
          <div className="flex items-center gap-2.5 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-medium text-left">{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2.5 p-4 bg-green-500/10 border border-green-500/20 text-green-400 text-xs rounded-xl">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="font-medium text-left">{success}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleAuth} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-text-dim">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                placeholder="ikasle@euskara.eus"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[#0d1012] border border-border rounded-xl focus:outline-none focus:border-brand/40 focus:ring-1 focus:ring-brand/40 text-text-primary text-sm transition-all placeholder:text-text-dim"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Contraseña</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-text-dim">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[#0d1012] border border-border rounded-xl focus:outline-none focus:border-brand/40 focus:ring-1 focus:ring-brand/40 text-text-primary text-sm transition-all placeholder:text-text-dim"
                required
                disabled={loading}
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full py-3.5 font-bold text-background bg-brand rounded-xl hover:bg-brand-hover transition-all duration-300 shadow-glow mt-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 overflow-hidden"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin"></span>
                Procesando...
              </span>
            ) : (
              <>
                <span>{isSignUp ? "Crear cuenta gratuita" : "Entrar a la app"}</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Login/Sign Up */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
              setSuccess(null);
            }}
            className="text-sm text-text-secondary hover:text-brand font-medium transition-colors"
          >
            {isSignUp ? (
              <span>¿Ya eres estudiante? <strong className="text-brand font-semibold hover:underline">Inicia sesión</strong></span>
            ) : (
              <span>¿Nuevo en Euskara SRS? <strong className="text-brand font-semibold hover:underline">Crea una cuenta</strong></span>
            )}
          </button>
        </div>

        {/* Separador */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-border"></div>
          <span className="flex-shrink mx-4 text-text-dim text-xs uppercase tracking-wider font-semibold">o continuar con</span>
          <div className="flex-grow border-t border-border"></div>
        </div>

        {/* Login de Proveedores Externos */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3 text-sm font-semibold text-text-primary bg-background-subtle border border-border rounded-xl hover:border-brand/40 hover:bg-[#121518] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Google</span>
          </button>
        </div>
      </div>
    </main>
  );
}
