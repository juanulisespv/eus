import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full space-y-8">
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center px-3 py-1 text-xs font-medium rounded-full bg-brand-glow text-brand border border-brand/20">
            Aprende Euskera de Forma Inteligente
          </div>
          <h1 className="text-4xl font-extrabold tracking-tightest sm:text-5xl bg-gradient-to-r from-white via-text-primary to-text-secondary bg-clip-text text-transparent">
            Euskara SRS
          </h1>
          <p className="text-text-secondary text-base leading-relaxed">
            Domina el vocabulario vasco mediante el método científico de repetición espaciada. Optimiza tu memoria y aprende más rápido.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/login"
            className="px-6 py-3 font-medium text-background bg-brand rounded-xl hover:bg-brand-hover transition-colors shadow-glow text-center"
          >
            Comenzar a Aprender
          </Link>
          <Link
            href="/auth/login?mode=signup"
            className="px-6 py-3 font-medium text-text-primary glass-panel rounded-xl hover:border-active transition-all text-center"
          >
            Crear una Cuenta
          </Link>
        </div>
      </div>
    </main>
  );
}
