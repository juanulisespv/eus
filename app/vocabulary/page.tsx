import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/Badge";
import { Search } from "lucide-react";

const CATEGORIES = [
  "todas", "sustantivo", "verbo", "adjetivo", "adverbio",
  "pronombre", "numero", "saludo", "conjuncion", "otro"
] as const;

type Category = typeof CATEGORIES[number];

interface PageProps {
  searchParams: { category?: string; q?: string };
}

export default async function VocabularyPage({ searchParams }: PageProps) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const activeCategory = (searchParams.category ?? "todas") as Category;
  const searchQuery = searchParams.q ?? "";

  // Query de palabras
  let query = supabase
    .from("words")
    .select("id, word_eu, translation_es, category, difficulty, tags")
    .eq("is_active", true)
    .order("frequency_rank", { ascending: true });

  if (activeCategory !== "todas") {
    query = query.eq("category", activeCategory);
  }

  if (searchQuery.trim()) {
    query = query.or(
      `word_eu.ilike.%${searchQuery}%,translation_es.ilike.%${searchQuery}%`
    );
  }

  const { data: words, error } = await query.limit(200);

  // Progreso del usuario para badges de dominio
  const { data: progress } = await supabase
    .from("user_word_progress")
    .select("word_id, mastery_score")
    .eq("user_id", user.id);

  const progressMap = new Map(
    (progress ?? []).map(p => [p.word_id, p.mastery_score])
  );

  const DIFFICULTY_LABELS = ["", "Básico", "Elemental", "Intermedio", "Avanzado", "Experto"];

  return (
    <main className="min-h-screen bg-zinc-950 pb-24">
      {/* Header */}
      <div className="border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-bold text-zinc-100">Vocabulario</h1>
            <Link href="/dashboard" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
              ← Dashboard
            </Link>
          </div>

          {/* Search */}
          <form method="get" action="/vocabulary">
            {activeCategory !== "todas" && (
              <input type="hidden" name="category" value={activeCategory} />
            )}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input
                type="text"
                name="q"
                defaultValue={searchQuery}
                placeholder="Buscar en euskera o español..."
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/60 border border-white/[0.06] rounded-xl text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/40 transition-all"
              />
            </div>
          </form>
        </div>

        {/* Category tabs */}
        <div className="max-w-2xl mx-auto px-4 pb-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {CATEGORIES.map(cat => (
              <Link
                key={cat}
                href={`/vocabulary?category=${cat}${searchQuery ? `&q=${searchQuery}` : ""}`}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
                  activeCategory === cat
                    ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                    : "text-zinc-500 hover:text-zinc-300 border border-transparent hover:border-white/[0.06]"
                }`}
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4">
        {error && (
          <p className="text-sm text-red-400 text-center py-8">Error al cargar el vocabulario.</p>
        )}

        {!error && words && words.length === 0 && (
          <div className="text-center py-16">
            <p className="text-zinc-500">No se encontraron palabras</p>
            {searchQuery && (
              <Link href="/vocabulary" className="text-sm text-violet-400 hover:underline mt-2 block">
                Limpiar búsqueda
              </Link>
            )}
          </div>
        )}

        {words && words.length > 0 && (
          <>
            <p className="text-xs text-zinc-600 mb-3">{words.length} palabras</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {words.map(word => {
                const mastery = progressMap.get(word.id);
                const hasMastery = mastery !== undefined;

                return (
                  <Link key={word.id} href={`/vocabulary/${word.id}`}>
                    <div className="group flex items-center justify-between p-4 rounded-xl border border-white/[0.06] bg-zinc-900/40 hover:bg-zinc-900/70 hover:border-white/[0.12] transition-all">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-zinc-100 text-sm">{word.word_eu}</span>
                          <Badge type="category" label={word.category} />
                        </div>
                        <p className="text-xs text-zinc-500 mt-1 truncate">{word.translation_es}</p>
                      </div>

                      <div className="flex flex-col items-end gap-1 ml-3 shrink-0">
                        {word.difficulty && (
                          <Badge type="difficulty" label={`D${word.difficulty}`} />
                        )}
                        {hasMastery && (
                          <Badge
                            type="mastery"
                            label={`${mastery}%`}
                          />
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
