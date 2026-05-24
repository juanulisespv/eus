export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl space-y-6 glow-border shadow-glass">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tightest">Saioa Hasi</h2>
          <p className="text-text-secondary text-sm">Entra en tu cuenta para continuar con tus repasos.</p>
        </div>

        <form className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-text-secondary font-semibold">Email</label>
            <input
              type="email"
              placeholder="ikasle@euskara.eus"
              className="w-full px-4 py-2.5 bg-background-subtle border border-border rounded-xl focus:outline-none focus:border-brand/50 text-text-primary text-sm"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-text-secondary font-semibold">Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-background-subtle border border-border rounded-xl focus:outline-none focus:border-brand/50 text-text-primary text-sm"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 font-semibold text-background bg-brand rounded-xl hover:bg-brand-hover transition-colors shadow-glow mt-2 text-sm"
          >
            Iniciar Sesión
          </button>
        </form>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-border"></div>
          <span className="flex-shrink mx-4 text-text-dim text-xs uppercase tracking-wider">o</span>
          <div className="flex-grow border-t border-border"></div>
        </div>

        <div className="space-y-3">
          <button className="w-full py-2.5 text-sm font-semibold text-text-primary bg-background-subtle border border-border rounded-xl hover:border-active transition-all flex items-center justify-center gap-2">
            <span>🌐</span> Continuar con Google
          </button>
        </div>
      </div>
    </main>
  );
}
