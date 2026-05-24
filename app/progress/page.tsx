import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft, Flame, Target, Trophy, Brain, Award, BookOpen, CheckCircle } from "lucide-react";

export default async function ProgressPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // 1. Obtener perfil de usuario para las rachas
  const { data: profile } = await supabase
    .from("users")
    .select("current_streak, longest_streak, total_xp")
    .eq("id", user.id)
    .single();

  // 2. Obtener progreso de palabras
  const { data: progress } = await supabase
    .from("user_word_progress")
    .select("*")
    .eq("user_id", user.id);

  // 3. Obtener el total de palabras activas en el catálogo
  const { count: totalCatalog } = await supabase
    .from("words")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true);

  const allProgress = progress ?? [];
  const totalCatalogCount = totalCatalog ?? 0;

  // Cálculos de vocabulario
  const totalSeen = allProgress.length;
  const learned = allProgress.filter((p) => p.mastery_score >= 80).length;
  const learning = allProgress.filter((p) => p.mastery_score > 0 && p.mastery_score < 80).length;
  const notStarted = Math.max(0, totalCatalogCount - totalSeen);

  // Precisión
  const totalReviews = allProgress.reduce((s, p) => s + (p.total_reviews ?? 0), 0);
  const totalCorrect = allProgress.reduce((s, p) => s + (p.correct_reviews ?? 0), 0);
  const accuracy = totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0;

  // Porcentaje general estudiado
  const studiedPercentage = totalCatalogCount > 0 ? Math.round((totalSeen / totalCatalogCount) * 100) : 0;

  // Datos de usuario
  const currentStreak = profile?.current_streak ?? 0;
  const longestStreak = profile?.longest_streak ?? 0;
  const totalXp = profile?.total_xp ?? 0;

  // Anillo de progreso SVG (Circunferencia = 2 * PI * r = 2 * PI * 40 = 251.3)
  const radius = 40;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (studiedPercentage / 100) * circumference;

  // Logros dinámicos basados en estadísticas reales
  const achievementsList = [
    {
      id: "first_word",
      title: "Lehen Urratsak (Primeros pasos)",
      description: "Estudia tu primera palabra vasca en el sistema.",
      icon: "🌱",
      progress: totalSeen > 0 ? 100 : 0,
      unlocked: totalSeen > 0,
    },
    {
      id: "explorer_50",
      title: "Esploratzailea (Explorador)",
      description: "Empieza a aprender 50 palabras en total.",
      icon: "🗺️",
      progress: Math.min(Math.round((totalSeen / 50) * 100), 100),
      unlocked: totalSeen >= 50,
    },
    {
      id: "master_10",
      title: "Gogo sendoa (Mente de acero)",
      description: "Domina 10 palabras con puntuación de maestría >= 80%.",
      icon: "🧠",
      progress: Math.min(Math.round((learned / 10) * 100), 100),
      unlocked: learned >= 10,
    },
    {
      id: "streak_3",
      title: "Gar handia (Gran constancia)",
      description: "Consigue una racha activa de 3 días seguidos estudiando.",
      icon: "🔥",
      progress: Math.min(Math.round((currentStreak / 3) * 100), 100),
      unlocked: currentStreak >= 3,
    },
  ];

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 pb-24">
      {/* Header con botón Volver */}
      <div className="border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="w-10 h-10 rounded-xl border border-white/[0.06] bg-zinc-900/50 hover:bg-zinc-900 flex items-center justify-center transition-all text-zinc-400 hover:text-zinc-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-100">Progreso de Estudio</h1>
            <p className="text-xs text-zinc-500">Tus estadísticas de aprendizaje acumuladas</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        
        {/* Fichas de Resumen de Racha y Precisión */}
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-900/40 border border-white/[0.06] p-5 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
              <Flame className="w-6 h-6 fill-current" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 font-medium">Racha de estudio</p>
              <p className="text-xl font-extrabold text-orange-400">{currentStreak} días</p>
              <p className="text-[10px] text-zinc-600">Racha máx: {longestStreak} d</p>
            </div>
          </div>

          <div className="bg-zinc-900/40 border border-white/[0.06] p-5 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 font-medium">Precisión de acierto</p>
              <p className="text-xl font-extrabold text-emerald-400">{accuracy}%</p>
              <p className="text-[10px] text-zinc-600">{totalReviews} revisiones totales</p>
            </div>
          </div>
        </section>

        {/* Sección del Gráfico de Progreso */}
        <section className="bg-zinc-900/40 border border-white/[0.06] p-6 rounded-3xl space-y-6">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Distribución del Vocabulario</h2>
          
          <div className="flex flex-col sm:flex-row items-center gap-8 justify-center sm:justify-start">
            {/* Anillo de Progreso Donut SVG */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                {/* Círculo de fondo */}
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  className="stroke-zinc-800"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                />
                {/* Círculo de progreso */}
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  className="stroke-violet-500 transition-all duration-500"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              {/* Texto dentro de la rosquilla */}
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-zinc-100">{studiedPercentage}%</span>
                <span className="text-[10px] text-zinc-500 font-medium">Estudiado</span>
              </div>
            </div>

            {/* Leyenda y Datos numéricos */}
            <div className="flex-1 w-full space-y-3">
              {/* Total palabras del catálogo */}
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-zinc-400" />
                  <span className="text-sm text-zinc-300 font-medium">Catálogo completo</span>
                </div>
                <span className="text-sm font-bold text-zinc-100">{totalCatalogCount} palabras</span>
              </div>

              {/* Dominadas */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs text-zinc-400">Dominadas (Maestría &ge; 80%)</span>
                </div>
                <span className="text-xs font-semibold text-emerald-400">{learned} palabras</span>
              </div>

              {/* En aprendizaje */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-violet-500" />
                  <span className="text-xs text-zinc-400">En aprendizaje</span>
                </div>
                <span className="text-xs font-semibold text-violet-400">{learning} palabras</span>
              </div>

              {/* Sin empezar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  <span className="text-xs text-zinc-400">Por aprender</span>
                </div>
                <span className="text-xs font-semibold text-zinc-500">{notStarted} palabras</span>
              </div>
            </div>
          </div>
        </section>

        {/* Sección de Logros (Garaipenak) */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <h2 className="text-base font-bold text-zinc-200">Garaipenak (Logros)</h2>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {achievementsList.map((item) => (
              <div
                key={item.id}
                className={`border p-4 rounded-2xl flex gap-4 transition-all duration-300 ${
                  item.unlocked
                    ? "bg-zinc-900/60 border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.05)]"
                    : "bg-zinc-900/10 border-white/[0.04] opacity-50"
                }`}
              >
                {/* Icono del logro */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                  item.unlocked ? "bg-yellow-500/10 border border-yellow-500/20" : "bg-zinc-800/40 border border-white/[0.02]"
                }`}>
                  {item.icon}
                </div>

                {/* Detalles y barra de progreso */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 justify-between">
                      <h4 className="text-sm font-bold text-zinc-200 truncate">{item.title}</h4>
                      {item.unlocked && (
                        <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest bg-yellow-500/10 px-2 py-0.5 rounded-full border border-yellow-500/10">
                          Desbloqueado
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500">{item.description}</p>
                  </div>

                  {/* Barra de progreso visual si no está desbloqueado */}
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex-1 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.unlocked ? "bg-yellow-500" : "bg-zinc-600"
                        }`}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-zinc-400 shrink-0 min-w-8 text-right">
                      {item.progress}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}
