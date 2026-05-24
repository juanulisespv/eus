import Link from "next/link";

export default function VocabularyPage() {
  return (
    <main className="min-h-screen p-6 max-w-4xl mx-auto space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Hiztegia (Vocabulario)</h1>
        <p className="text-text-secondary text-sm">Explora todas las palabras del diccionario y tu nivel de dominio en cada una.</p>
      </header>

      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Buscar palabra o traducción..."
          className="flex-1 px-4 py-3 bg-background-subtle border border-border rounded-xl focus:outline-none focus:border-brand/50 text-text-primary text-sm"
        />
        <select className="px-4 py-3 bg-background-subtle border border-border rounded-xl focus:outline-none focus:border-brand/50 text-text-primary text-sm">
          <option>Todas las categorías</option>
          <option>Sustantivos</option>
          <option>Verbos</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Placeholder word card */}
        <Link href="/vocabulary/dummy-id" className="glass-panel p-4 rounded-xl flex justify-between items-center hover:border-active transition-all group">
          <div>
            <h3 className="font-bold text-text-primary group-hover:text-brand transition-colors">Kaixo</h3>
            <p className="text-xs text-text-secondary">Hola</p>
          </div>
          <span className="text-xs bg-brand-glow text-brand border border-brand/20 px-2.5 py-1 rounded-full font-medium">
            Sustantivo
          </span>
        </Link>
      </div>
    </main>
  );
}
