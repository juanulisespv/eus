import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { StreakDisplay } from "@/components/dashboard/StreakDisplay";
import { Button } from "@/components/ui/Button";
import { BookOpen, Target, CheckCircle, Brain, ArrowRight, Sparkles } from "lucide-react";

export default async function DashboardPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Obtener progreso del usuario
  const now = new Date().toISOString();

  const { data: progress, error: progressError } = await supabase
    .from("user_word_progress")
    .select("*")
    .eq("user_id", user.id);

  const { data: sessionHistory } = await supabase
    .from("sessions")
    .select("correct_count, total_reviewed, reviewed_at")
    .eq("user_id", user.id)
    .order("reviewed_at", { ascending: false })
    .limit(30);

  const allProgress = progress ?? [];

  // Palabras pendientes hoy (next_review_at <= now)
  const dueNow = allProgress.filter(
    p => p.next_review_at && new Date(p.next_review_at) <= new Date()
  ).length;

  // Palabras nuevas disponibles (nunca revisadas)
  const newAvailable = allProgress.filter(p => !p.next_review_at).length;

  // Total pendientes = vencidas + nuevas (capped a 10 nuevas por sesión)
  const pendingTotal = dueNow + Math.min(newAvailable, 10);

  // Palabras aprendidas (mastery_score >= 80)
  const learned = allProgress.filter(p => p.mastery_score >= 80).length;

  // Precisión total
  const totalReviews = allProgress.reduce((s, p) => s + (p.total_reviews ?? 0), 0);
  const totalCorrect = allProgress.reduce((s, p) => s + (p.correct_reviews ?? 0), 0);
  const accuracy = totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0;

  // Racha: contar días consecutivos con sesiones
  let currentStreak = 0;
  let longestStreak = 0;
  if (sessionHistory && sessionHistory.length > 0) {
    const days = new Set(
      sessionHistory.map(s => new Date(s.reviewed_at).toDateString())
    );
    const today = new Date();
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      if (days.has(d.toDateString())) {
        streak++;
        if (streak > longestStreak) longestStreak = streak;
      } else {
        if (i === 0) { streak = 0; } else break;
      }
    }
    currentStreak = streak;
  }

  const hasPending = pendingTotal > 0;

  return (
    <main className="min-h-screen bg-zinc-950 pb-24">
      {/* Header */}
      <div className="border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <span className="text-sm font-black text-violet-400">E</span>
            </div>
            <span className="font-semibold text-zinc-200">Euskara SRS</span>
          </div>
          <Link href="/settings" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
            Ajustes
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Greeting */}
        <div>
          <h2 className="text-2xl font-bold text-zinc-100">
            {hasPending ? "Tienes palabras pendientes 📚" : "¡Al día! 🎉"}
          </h2>
          <p className="text-zinc-500 text-sm mt-1">
            {hasPending
              ? `${pendingTotal} palabras esperan ser repasadas`
              : "No hay repasos pendientes por ahora. ¡Vuelve más tarde!"}
          </p>
        </div>

        {/* CTA Principal */}
        {hasPending ? (
          <Link href="/study">
            <div className="flex items-center justify-between p-5 rounded-2xl bg-violet-500/10 border border-violet-500/20 hover:bg-violet-500/15 hover:border-violet-500/30 transition-all cursor-pointer group">
              <div>
                <p className="text-xs text-violet-400 font-semibold uppercase tracking-wider mb-1">Sesión de hoy</p>
                <p className="text-xl font-bold text-zinc-100">{pendingTotal} palabras pendientes</p>
                <p className="text-sm text-zinc-400 mt-0.5">{dueNow} repasos · {Math.min(newAvailable, 10)} nuevas</p>
              </div>
              <div className="flex items-center gap-2 text-violet-400 group-hover:translate-x-1 transition-transform">
                <span className="text-sm font-semibold">Estudiar</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-4 p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <Sparkles className="w-8 h-8 text-emerald-400 shrink-0" />
            <div>
              <p className="font-semibold text-zinc-100">¡Excelente trabajo!</p>
              <p className="text-sm text-zinc-400">Has completado todos tus repasos de hoy. Vuelve mañana.</p>
            </div>
          </div>
        )}

        {/* Racha */}
        <StreakDisplay currentStreak={currentStreak} longestStreak={longestStreak} />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatsCard
            title="Pendientes"
            value={pendingTotal}
            subtitle="para hoy"
            icon={BookOpen}
            trend={pendingTotal > 0 ? "down" : "neutral"}
          />
          <StatsCard
            title="Aprendidas"
            value={learned}
            subtitle="de {allProgress.length} totales"
            icon={CheckCircle}
            trend="up"
          />
          <StatsCard
            title="Precisión"
            value={`${accuracy}%`}
            subtitle="aciertos históricos"
            icon={Target}
            trend={accuracy >= 70 ? "up" : accuracy >= 50 ? "neutral" : "down"}
          />
          <StatsCard
            title="Vocabulario"
            value={allProgress.length}
            subtitle="palabras en progreso"
            icon={Brain}
            trend="neutral"
          />
        </div>

        {/* Accesos rápidos */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/vocabulary"
            className="p-4 rounded-xl border border-white/[0.06] bg-zinc-900/50 hover:border-white/[0.12] hover:bg-zinc-900/80 transition-all text-sm font-medium text-zinc-400 hover:text-zinc-200 text-center"
          >
            📖 Ver vocabulario
          </Link>
          <Link
            href="/progress"
            className="p-4 rounded-xl border border-white/[0.06] bg-zinc-900/50 hover:border-white/[0.12] hover:bg-zinc-900/80 transition-all text-sm font-medium text-zinc-400 hover:text-zinc-200 text-center"
          >
            📊 Mi progreso
          </Link>
        </div>
      </div>
    </main>
  );
}
