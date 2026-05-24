import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ArrowLeft, BookOpen, Mic, Brain, Star } from "lucide-react";

interface PageProps {
  params: { id: string };
}

export default async function WordDetailPage({ params }: PageProps) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: word, error } = await supabase
    .from("words")
    .select(`
      *,
      examples ( sentence_eu, sentence_es, display_order )
    `)
    .eq("id", params.id)
    .single();

  if (error || !word) notFound();

  // Progreso del usuario para esta palabra
  const { data: progress } = await supabase
    .from("user_word_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("word_id", params.id)
    .single();

  const examples = (word.examples ?? []).sort(
    (a: any, b: any) => a.display_order - b.display_order
  );

  const DIFFICULTY_LABELS = ["", "Básico", "Elemental", "Intermedio", "Avanzado", "Experto"];

  const nextReview = progress?.next_review_at
    ? new Date(progress.next_review_at).toLocaleDateString("es-ES", {
        day: "numeric", month: "long",
      })
    : null;

  const accuracy =
    progress && progress.total_reviews > 0
      ? Math.round((progress.correct_reviews / progress.total_reviews) * 100)
      : null;

  return (
    <main className="min-h-screen bg-zinc-950 pb-24">
      {/* Header */}
      <div className="border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link
            href="/vocabulary"
            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-bold text-zinc-100 text-lg leading-tight">{word.word_eu}</h1>
            <p className="text-xs text-zinc-500">{word.translation_es}</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        {/* Hero card */}
        <div className="bg-zinc-900/60 border border-white/[0.06] rounded-2xl p-6 text-center space-y-3">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <Badge type="category" label={word.category} />
            {word.difficulty && (
              <Badge type="difficulty" label={DIFFICULTY_LABELS[word.difficulty] ?? `D${word.difficulty}`} />
            )}
          </div>

          <div>
            <h2 className="text-4xl font-black text-zinc-100 tracking-tighter">{word.word_eu}</h2>
            {word.pronunciation && (
              <p className="text-zinc-500 font-mono text-sm mt-1">[{word.pronunciation}]</p>
            )}
          </div>

          <div className="border-t border-white/[0.06] pt-3">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Traducción</p>
            <p className="text-xl font-semibold text-zinc-200">{word.translation_es}</p>
            {word.translation_en && (
              <p className="text-sm text-zinc-500 mt-0.5">{word.translation_en}</p>
            )}
          </div>
        </div>

        {/* Definition */}
        {word.definition_simple && (
          <div className="bg-zinc-900/40 border border-white/[0.06] rounded-2xl p-5 space-y-1.5">
            <div className="flex items-center gap-2 text-zinc-400 mb-2">
              <BookOpen className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Definición</span>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">{word.definition_simple}</p>
          </div>
        )}

        {/* Uso habitual */}
        {word.uso_habitual && (
          <div className="bg-zinc-900/40 border border-white/[0.06] rounded-2xl p-5">
            <div className="flex items-center gap-2 text-zinc-400 mb-2">
              <Mic className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Uso habitual</span>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">{word.uso_habitual}</p>
          </div>
        )}

        {/* Examples */}
        {examples.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-zinc-400 px-1">
              <Star className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Frases de ejemplo</span>
            </div>
            {examples.map((ex: any, i: number) => (
              <div
                key={i}
                className="bg-zinc-900/40 border border-white/[0.06] rounded-xl p-4 space-y-1"
              >
                <p className="text-sm font-semibold text-zinc-200">{ex.sentence_eu}</p>
                <p className="text-xs text-zinc-500">{ex.sentence_es}</p>
              </div>
            ))}
          </div>
        )}

        {/* User progress */}
        {progress ? (
          <div className="bg-zinc-900/40 border border-white/[0.06] rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-zinc-400">
              <Brain className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Tu progreso</span>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-zinc-500">Dominio</span>
                <span className="text-xs font-semibold text-violet-400">{progress.mastery_score}%</span>
              </div>
              <ProgressBar value={progress.mastery_score} />
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-lg font-bold text-zinc-100">{progress.total_reviews}</p>
                <p className="text-xs text-zinc-600">Revisiones</p>
              </div>
              <div>
                <p className="text-lg font-bold text-emerald-400">{accuracy !== null ? `${accuracy}%` : "—"}</p>
                <p className="text-xs text-zinc-600">Precisión</p>
              </div>
              <div>
                <p className="text-lg font-bold text-zinc-100">{progress.repetitions}</p>
                <p className="text-xs text-zinc-600">Racha</p>
              </div>
            </div>

            {nextReview && (
              <p className="text-xs text-zinc-600 text-center border-t border-white/[0.04] pt-3">
                Próximo repaso: <span className="text-zinc-400 font-medium">{nextReview}</span>
              </p>
            )}
          </div>
        ) : (
          <div className="bg-zinc-900/40 border border-white/[0.06] rounded-2xl p-5 text-center">
            <p className="text-sm text-zinc-500">Aún no has practicado esta palabra.</p>
          </div>
        )}

        {/* Practice CTA */}
        <Link href="/study">
          <div className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-violet-500/10 border border-violet-500/20 hover:bg-violet-500/15 hover:border-violet-500/30 transition-all text-violet-300 font-semibold">
            Practicar esta palabra →
          </div>
        </Link>
      </div>
    </main>
  );
}
