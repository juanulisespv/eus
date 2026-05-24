export default function ProgressPage() {
  return (
    <main className="min-h-screen p-6 max-w-4xl mx-auto space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Aurrerapena (Progreso)</h1>
        <p className="text-text-secondary text-sm">Visualiza tus estadísticas de estudio y logros desbloqueados.</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="font-bold text-text-primary">Racha de estudio</h3>
          <div className="flex items-center gap-4">
            <span className="text-4xl">🔥</span>
            <div>
              <p className="text-2xl font-extrabold text-accent-orange">0 días seguidos</p>
              <p className="text-xs text-text-secondary">Racha más larga histórica: 0 días</p>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="font-bold text-text-primary">Estadísticas de acierto</h3>
          <div className="flex items-center gap-4">
            <span className="text-4xl">🎯</span>
            <div>
              <p className="text-2xl font-extrabold text-brand">0% de aciertos</p>
              <p className="text-xs text-text-secondary">De un total de 0 revisiones realizadas.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="font-bold text-text-primary">Garaipenak (Logros)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel p-4 rounded-xl flex flex-col items-center text-center space-y-2 opacity-50">
            <span className="text-3xl">🌱</span>
            <h4 className="text-sm font-semibold text-text-primary">Primeros pasos</h4>
            <p className="text-xs text-text-dim">Estudia tu primera palabra vasca.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
