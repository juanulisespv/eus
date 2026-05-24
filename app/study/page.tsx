"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FlashCard } from "@/components/flashcard/FlashCard";
import { Button } from "@/components/ui/Button";
import { calculateSM2, getStudyQueue } from "@/lib/srs/engine";
import type { UserWordProgress, ReviewResult, SM2Result } from "@/lib/srs/types";
import type { WordData } from "@/components/flashcard/FlashCard";
import { CheckCircle2, RotateCcw, Home, Zap, Target, Clock } from "lucide-react";

interface ProgressWithWord extends UserWordProgress {
  words: WordData;
}

// Estado de la sesión de estudio
type StudyState = "loading" | "studying" | "finished" | "empty";

export default function StudyPage() {
  const router = useRouter();
  const supabase = createClient();

  const [state, setState] = useState<StudyState>("loading");
  const [queue, setQueue] = useState<ProgressWithWord[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [results, setResults] = useState<ReviewResult[]>([]);
  const [sessionStats, setSessionStats] = useState<{ correct: number; total: number; accuracy: number } | null>(null);
  const cardStartTime = useRef(Date.now());

  const loadQueue = useCallback(async () => {
    setState("loading");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth/login"); return; }

    // ── Leer objetivo diario del usuario ────────────────────────
    const { data: prefs } = await supabase
      .from("user_preferences")
      .select("daily_goal")
      .eq("user_id", user.id)
      .maybeSingle();
    const dailyGoal = prefs?.daily_goal ?? 10;

    // Cargar progreso con datos de la palabra unida
    let { data: progress, error } = await supabase
      .from("user_word_progress")
      .select(`
        *,
        words (
          id, word_eu, translation_es, translation_en,
          category, difficulty, pronunciation, definition_simple,
          uso_habitual,
          examples ( sentence_eu, sentence_es )
        )
      `)
      .eq("user_id", user.id);

    if (error) { setState("empty"); return; }

    // ── AUTO-ENROLL / TOP-UP: Límite estricto diario ────────────────────────
    // 1. Calcular cuántas palabras nuevas se han estudiado HOY
    const todayStr = new Date().toISOString().split('T')[0];
    const { data: todaySessions } = await supabase
      .from("sessions")
      .select("new_cards")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .gte("started_at", todayStr);
      
    const newCardsStudiedToday = (todaySessions ?? []).reduce((sum, s) => sum + (s.new_cards ?? 0), 0);
    
    // 2. Calcular cuántas quedan permitidas hoy
    const remainingNewToday = Math.max(0, dailyGoal - newCardsStudiedToday);

    // 3. Ver cuántas palabras "nuevas" sin empezar tiene en su cola
    const existingIds = new Set((progress ?? []).map(p => p.word_id));
    const currentNew = (progress ?? []).filter(p => !p.next_review_at).length;
    
    // 4. Si tiene menos de las que aún puede estudiar hoy, enrolamos la diferencia
    const needed = remainingNewToday - currentNew;

    if (needed > 0) {
      // Obtener palabras del catálogo que el usuario aún no tiene asignadas
      const { data: moreWords } = await supabase
        .from("words")
        .select("id")
        .eq("is_active", true)
        .order("frequency_rank", { ascending: true })
        .limit(needed + existingIds.size); // pedir más de lo necesario para filtrar

      const toEnroll = (moreWords ?? [])
        .filter(w => !existingIds.has(w.id))
        .slice(0, needed);

      if (toEnroll.length > 0) {
        const newRows = toEnroll.map(w => ({
          user_id: user.id,
          word_id: w.id,
          ease_factor: 2.5,
          interval_days: 1,
          repetitions: 0,
          mastery_score: 0,
          total_reviews: 0,
          correct_reviews: 0,
          next_review_at: null,
        }));
        await supabase.from("user_word_progress").insert(newRows);

        // Recargar con las nuevas palabras incluidas
        const reloaded = await supabase
          .from("user_word_progress")
          .select(`
            *,
            words (
              id, word_eu, translation_es, translation_en,
              category, difficulty, pronunciation, definition_simple,
              uso_habitual,
              examples ( sentence_eu, sentence_es )
            )
          `)
          .eq("user_id", user.id);
        progress = reloaded.data ?? [];
      }
    }

    if (!progress || progress.length === 0) { setState("empty"); return; }

    const now = new Date();
    const due = progress.filter(p =>
      p.next_review_at && new Date(p.next_review_at) <= now
    ) as ProgressWithWord[];
    const newWords = progress.filter(p => !p.next_review_at) as ProgressWithWord[];

    const { cards } = getStudyQueue({
      dueWords: due as UserWordProgress[],
      newWords: newWords as UserWordProgress[],
      maxNew: remainingNewToday,
      limit: remainingNewToday + 20, // repasos vencidos + nuevas del objetivo
    });

    let orderedQueue: ProgressWithWord[];

    if (cards.length === 0) {
      // ── MODO PRÁCTICA LIBRE ──────────────────────────────────────
      // No hay tarjetas pendientes según SRS. En lugar de mostrar "vacío",
      // ofrecemos todas las palabras del usuario en orden aleatorio para
      // seguir practicando sin afectar el algoritmo SRS.
      
      const searchParams = new URLSearchParams(window.location.search);
      const categoryFilter = searchParams.get("categories") || searchParams.get("category");
      
      let practicePool = progress;
      if (categoryFilter && categoryFilter !== "all") {
        const selectedCategories = categoryFilter.split(',').map(c => c.trim());
        practicePool = progress.filter(p => 
          p.words?.tags?.some((tag: string) => selectedCategories.includes(tag))
        );
      }
      
      const shuffled = [...practicePool].sort(() => Math.random() - 0.5).slice(0, 20);
      if (shuffled.length === 0) { setState("empty"); return; }
      orderedQueue = shuffled as ProgressWithWord[];
    } else {
      // Reordenar la queue manteniendo los datos de la palabra
      orderedQueue = cards.map(c =>
        progress!.find(p => p.word_id === c.progress.word_id)
      ).filter(Boolean) as ProgressWithWord[];
    }

    setQueue(orderedQueue);
    setCurrentIdx(0);
    setResults([]);
    cardStartTime.current = Date.now();
    setState("studying");
  }, [supabase, router]);

  useEffect(() => { loadQueue(); }, [loadQueue]);

  const handleQualitySelect = useCallback(async (quality: 0 | 1 | 2 | 3 | 4 | 5) => {
    const current = queue[currentIdx];
    if (!current) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const responseTime = Math.round((Date.now() - cardStartTime.current) / 1000);
    const sm2Result: SM2Result = calculateSM2(current as UserWordProgress, quality);

    // Guardar en Supabase (upsert)
    await supabase
      .from("user_word_progress")
      .upsert({
        user_id: user.id,
        word_id: current.word_id,
        ...sm2Result,
      }, { onConflict: "user_id,word_id" });

    const result: ReviewResult = {
      word_id: current.word_id,
      quality,
      response_time_seconds: responseTime,
      reviewed_at: new Date().toISOString(),
    };
    const newResults = [...results, result];
    setResults(newResults);

    const nextIdx = currentIdx + 1;
    if (nextIdx >= queue.length) {
      // Sesión terminada — calcular stats
      const correct = newResults.filter(r => r.quality >= 3).length;
      setSessionStats({
        correct,
        total: newResults.length,
        accuracy: Math.round((correct / newResults.length) * 100),
      });
      setState("finished");

      // Guardar sesión — columnas según el schema SQL
      await supabase.from("sessions").insert({
        user_id: user.id,
        mode: "review",
        status: "completed",
        cards_reviewed: newResults.length,
        new_cards: newResults.filter(r => !queue.find(q => q.word_id === r.word_id)?.last_reviewed_at).length,
        correct_count: correct,
        duration_seconds: newResults.reduce((s, r) => s + r.response_time_seconds, 0),
        ended_at: new Date().toISOString(),
      });
    } else {
      setCurrentIdx(nextIdx);
      cardStartTime.current = Date.now();
    }
  }, [queue, currentIdx, results, supabase]);

  // ── ESTADOS DE PANTALLA ──────────────────────────────────────

  if (state === "loading") {
    return (
      <main className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-zinc-500">Preparando tu sesión...</p>
        </div>
      </main>
    );
  }

  if (state === "empty") {
    return (
      <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="text-center max-w-sm space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-zinc-100">¡Todo al día!</h2>
            <p className="text-zinc-500 text-sm mt-2">No hay palabras pendientes ahora mismo. Vuelve más tarde.</p>
          </div>
          <Button onClick={() => router.push("/dashboard")} variant="secondary" className="w-full">
            Volver al Dashboard
          </Button>
        </div>
      </main>
    );
  }

  if (state === "finished" && sessionStats) {
    return (
      <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-violet-400" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-100">¡Sesión completada!</h2>
            <p className="text-zinc-500 text-sm mt-1">Aquí tienes tu resumen</p>
          </div>

          {/* Stats card */}
          <div className="bg-zinc-900/60 border border-white/[0.06] rounded-2xl p-5 space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-zinc-100">{sessionStats.total}</p>
                <p className="text-xs text-zinc-500 mt-0.5">Revisadas</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-400">{sessionStats.correct}</p>
                <p className="text-xs text-zinc-500 mt-0.5">Correctas</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-violet-400">{sessionStats.accuracy}%</p>
                <p className="text-xs text-zinc-500 mt-0.5">Precisión</p>
              </div>
            </div>

            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-emerald-500 rounded-full transition-all duration-1000"
                style={{ width: `${sessionStats.accuracy}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button onClick={loadQueue} variant="secondary" className="flex items-center gap-2 justify-center">
              <RotateCcw className="w-4 h-4" /> Otra sesión
            </Button>
            <Button onClick={() => router.push("/dashboard")} className="flex items-center gap-2 justify-center">
              <Home className="w-4 h-4" /> Dashboard
            </Button>
          </div>
        </div>
      </main>
    );
  }

  // ── PANTALLA DE ESTUDIO PRINCIPAL ────────────────────────────
  const currentCard = queue[currentIdx];
  if (!currentCard?.words) return null;

  const progress = currentIdx + 1;
  const total = queue.length;

  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Header */}
      <div className="border-b border-white/[0.06] px-4 py-3 flex items-center justify-between max-w-2xl mx-auto w-full">
        <button
          onClick={() => router.push("/dashboard")}
          className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          ← Salir
        </button>
        <span className="text-sm font-medium text-zinc-400">
          {progress} de {total}
        </span>
        <div className="flex items-center gap-1.5 text-zinc-500">
          <Target className="w-3.5 h-3.5" />
          <span className="text-xs">{results.filter(r => r.quality >= 3).length} correctas</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-zinc-900">
        <div
          className="h-full bg-violet-500 transition-all duration-500"
          style={{ width: `${((currentIdx) / total) * 100}%` }}
        />
      </div>

      {/* Card */}
      <div className="flex-1 flex items-center justify-center p-4">
        <FlashCard
          key={currentCard.word_id}
          word={currentCard.words}
          onQualitySelect={handleQualitySelect}
        />
      </div>
    </main>
  );
}
