import Link from "next/link";

interface PageProps {
  params: {
    id: string;
  };
}

export default function WordDetailPage({ params }: PageProps) {
  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto space-y-6">
      <Link href="/vocabulary" className="text-sm text-text-secondary hover:text-text-primary inline-flex items-center gap-2">
        ← Volver al vocabulario
      </Link>

      <div className="glass-panel p-8 rounded-2xl space-y-6 glow-border">
        <header className="flex justify-between items-start">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">Kaixo</h1>
            <p className="text-sm font-mono text-text-dim">[kai.ʃo]</p>
          </div>
          <span className="text-xs bg-brand-glow text-brand border border-brand/20 px-3 py-1 rounded-full font-medium">
            Sustantivo
          </span>
        </header>

        <section className="space-y-4 border-t border-border pt-6">
          <div>
            <h4 className="text-xs text-text-dim font-semibold uppercase tracking-wider">Traducción</h4>
            <p className="text-text-primary font-medium text-lg">Hola / Saludo</p>
          </div>

          <div>
            <h4 className="text-xs text-text-dim font-semibold uppercase tracking-wider">Definición simple</h4>
            <p className="text-text-secondary">Euskaraz norbait agurtzeko erabiltzen den hitza.</p>
          </div>

          <div>
            <h4 className="text-xs text-text-dim font-semibold uppercase tracking-wider">Uso habitual</h4>
            <p className="text-text-secondary">Es el saludo más universal y común en cualquier dialecto.</p>
          </div>
        </section>

        <section className="space-y-3 border-t border-border pt-6">
          <h4 className="text-xs text-text-dim font-semibold uppercase tracking-wider">Frases de ejemplo</h4>
          <div className="bg-background-subtle p-4 rounded-xl space-y-1">
            <p className="font-semibold text-text-primary">Kaixo, nola zaude?</p>
            <p className="text-xs text-text-secondary">Hola, ¿cómo estás?</p>
          </div>
        </section>
      </div>
    </main>
  );
}
