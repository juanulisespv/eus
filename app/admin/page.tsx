export default function AdminPage() {
  return (
    <main className="min-h-screen p-6 max-w-4xl mx-auto space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Kudeaketa (Administración)</h1>
        <p className="text-text-secondary text-sm">Gestiona el catálogo de palabras, frases de ejemplo y logros de la plataforma.</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="font-bold text-text-primary">Vocabulario</h3>
          <p className="text-text-secondary text-sm">Carga nuevas palabras en el mazo común o modifica traducciones.</p>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-brand text-background text-sm font-semibold rounded-xl hover:bg-brand-hover transition-colors">
              + Añadir Palabra
            </button>
            <button className="px-4 py-2 border border-border text-text-primary text-sm font-semibold rounded-xl hover:border-active transition-all">
              Importar CSV
            </button>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="font-bold text-text-primary">Logros y Niveles</h3>
          <p className="text-text-secondary text-sm">Configura los umbrales de puntos y objetivos de la gamificación.</p>
          <button className="px-4 py-2 border border-border text-text-primary text-sm font-semibold rounded-xl hover:border-active transition-all">
            Editar Catálogo de Logros
          </button>
        </div>
      </section>
    </main>
  );
}
