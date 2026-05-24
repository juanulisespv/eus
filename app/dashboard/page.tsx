export default function DashboardPage() {
  return (
    <main className="min-h-screen p-6 max-w-4xl mx-auto space-y-8">
      <header className="flex justify-between items-center border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Kaixo, Ikasle!</h1>
          <p className="text-text-secondary text-sm">Este es tu resumen diario de aprendizaje.</p>
        </div>
        <div className="flex gap-3">
          <div className="text-right">
            <span className="text-xs text-text-dim block">Racha Actual</span>
            <span className="text-lg font-bold text-accent-orange">🔥 0 días</span>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl space-y-2">
          <h2 className="text-text-secondary text-sm font-medium">Pendientes de Revisar</h2>
          <p className="text-3xl font-extrabold text-brand">0</p>
          <p className="text-xs text-text-dim">Tarjetas SRS programadas para hoy.</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl space-y-2">
          <h2 className="text-text-secondary text-sm font-medium">Palabras Nuevas</h2>
          <p className="text-3xl font-extrabold text-accent-blue">0</p>
          <p className="text-xs text-text-dim">Por aprender hoy según tu objetivo diario.</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl space-y-2">
          <h2 className="text-text-secondary text-sm font-medium">Dominio Total</h2>
          <p className="text-3xl font-extrabold text-accent-purple">0%</p>
          <p className="text-xs text-text-dim">Progreso general de tu vocabulario.</p>
        </div>
      </section>

      <div className="flex justify-center pt-8">
        <button className="px-8 py-4 font-semibold text-background bg-brand rounded-xl hover:bg-brand-hover transition-colors shadow-glow">
          Iniciar Sesión de Estudio
        </button>
      </div>
    </main>
  );
}
