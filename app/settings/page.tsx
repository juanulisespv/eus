export default function SettingsPage() {
  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Ezarpenak (Ajustes)</h1>
        <p className="text-text-secondary text-sm">Gestiona tus preferencias de cuenta y del algoritmo de aprendizaje.</p>
      </header>

      <form className="space-y-6">
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="font-bold text-text-primary border-b border-border pb-3">Perfil de Estudio</h3>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm text-text-secondary">Idioma de la interfaz</label>
            <select className="px-3 py-2 bg-background-subtle border border-border rounded-xl focus:border-brand/50 text-text-primary text-sm focus:outline-none">
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="eu">Euskara</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-text-secondary">Dialecto preferido (Euskalki)</label>
            <select className="px-3 py-2 bg-background-subtle border border-border rounded-xl focus:border-brand/50 text-text-primary text-sm focus:outline-none">
              <option value="batua">Batua (Estándar)</option>
              <option value="bizkaiera">Bizkaiera (Vizcaíno)</option>
              <option value="gipuzkera">Gipuzkera (Guipuzcoano)</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-text-secondary">Objetivo diario (palabras nuevas)</label>
            <input 
              type="number" 
              defaultValue={10} 
              min={1} 
              max={200}
              className="px-3 py-2 bg-background-subtle border border-border rounded-xl focus:border-brand/50 text-text-primary text-sm focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            type="submit" 
            className="px-6 py-3 font-semibold text-background bg-brand rounded-xl hover:bg-brand-hover transition-colors shadow-glow text-sm"
          >
            Guardar Cambios
          </button>
        </div>
      </form>
    </main>
  );
}
