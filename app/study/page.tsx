export default function StudyPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-between p-6 max-w-2xl mx-auto">
      <header className="w-full flex justify-between items-center py-4 border-b border-border">
        <span className="text-sm font-semibold text-text-secondary">Sesión de Estudio</span>
        <div className="w-32 bg-border h-2 rounded-full overflow-hidden">
          <div className="bg-brand h-full w-[25%]" />
        </div>
        <button className="text-text-secondary hover:text-text-primary text-sm font-medium">Salir</button>
      </header>

      <section className="flex-1 w-full flex flex-col items-center justify-center py-12">
        <div className="w-full max-w-md aspect-[4/3] glass-panel rounded-3xl p-8 flex flex-col items-center justify-between shadow-glass glow-border">
          <span className="text-xs text-text-dim uppercase tracking-wider">Palabra</span>
          <div className="text-center space-y-2">
            <h2 className="text-4xl font-extrabold tracking-tightest">Kaixo</h2>
            <p className="text-sm text-text-dim font-mono">[kai.ʃo]</p>
          </div>
          <button className="px-6 py-2 bg-text-primary text-background text-sm font-semibold rounded-xl hover:bg-white transition-colors">
            Mostrar Respuesta
          </button>
        </div>
      </section>

      <footer className="w-full py-4 border-t border-border flex justify-between gap-4">
        <button className="flex-1 py-3 text-sm font-semibold text-text-secondary bg-background-subtle border border-border rounded-xl hover:border-active transition-all">
          No la sé (0)
        </button>
        <button className="flex-1 py-3 text-sm font-semibold text-text-primary bg-background-subtle border border-border rounded-xl hover:border-active transition-all">
          Dudoso (3)
        </button>
        <button className="flex-1 py-3 text-sm font-semibold text-background bg-brand rounded-xl hover:bg-brand-hover transition-colors shadow-glow">
          Fácil (5)
        </button>
      </footer>
    </main>
  );
}
