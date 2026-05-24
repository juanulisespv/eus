"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Check, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface UserPreferences {
  interface_language: "es" | "en" | "eu";
  dialect: "batua" | "bizkaiera" | "gipuzkera" | "lapurtera" | "otro";
  daily_goal: number;
}

const DEFAULTS: UserPreferences = {
  interface_language: "es",
  dialect: "batua",
  daily_goal: 10,
};

// ─── Estado del guardado ──────────────────────────────────────────────────────

type SaveStatus = "idle" | "saving" | "saved" | "error";

// ─── Componente ───────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const supabase = createClient();
  const router = useRouter();

  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULTS);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // ── Carga inicial de preferencias ──────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }

      const { data, error } = await supabase
        .from("user_preferences")
        .select("interface_language, dialect, daily_goal")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        setLoadError("No se pudieron cargar las preferencias.");
        return;
      }

      if (data) {
        setPrefs({
          interface_language: data.interface_language as UserPreferences["interface_language"],
          dialect: data.dialect as UserPreferences["dialect"],
          daily_goal: data.daily_goal,
        });
      }
      // Si no hay fila todavía, se usan los DEFAULTS (se crearán al primer guardado)
    }
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Persistencia inmediata al cambiar cualquier campo ──────────────────────
  const save = useCallback(async (updated: UserPreferences) => {
    setStatus("saving");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setStatus("error"); return; }

    const { error } = await supabase
      .from("user_preferences")
      .upsert(
        { user_id: user.id, ...updated },
        { onConflict: "user_id" }
      );

    if (error) {
      setStatus("error");
      // Vuelve a idle tras 3 s para que el usuario pueda reintentar
      setTimeout(() => setStatus("idle"), 3000);
    } else {
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    }
  }, [supabase]);

  // Helper: actualiza estado local + dispara guardado
  function update<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    startTransition(() => { save(updated); });
  }

  // ── Indicador de estado ───────────────────────────────────────────────────
  const StatusIndicator = () => {
    if (status === "saving" || isPending) {
      return (
        <span className="flex items-center gap-1.5 text-sm text-zinc-500">
          <Loader2 className="w-4 h-4 animate-spin" /> Guardando…
        </span>
      );
    }
    if (status === "saved") {
      return (
        <span className="flex items-center gap-1.5 text-sm text-emerald-400 animate-in fade-in duration-300">
          <Check className="w-4 h-4" /> Guardado
        </span>
      );
    }
    if (status === "error") {
      return (
        <span className="text-sm text-red-400">Error al guardar. Inténtalo de nuevo.</span>
      );
    }
    return null;
  };

  // ─── UI ──────────────────────────────────────────────────────────────────────

  const selectClass =
    "w-full px-4 py-3 bg-zinc-900 border border-white/[0.08] rounded-xl text-zinc-100 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition-colors text-base";

  const labelClass = "text-sm font-medium text-zinc-400 mb-2 block";

  return (
    <main className="min-h-screen bg-zinc-950 pb-24">
      {/* Header */}
      <div className="border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-2 rounded-xl hover:bg-zinc-800/60 text-zinc-500 hover:text-zinc-300 transition-colors"
              aria-label="Volver al dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-bold text-zinc-100 leading-tight">Ezarpenak</h1>
              <p className="text-xs text-zinc-500">Ajustes</p>
            </div>
          </div>
          <StatusIndicator />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {loadError && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {loadError}
          </div>
        )}

        {/* Sección: Perfil de Estudio */}
        <section className="bg-zinc-900/60 border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.06]">
            <h2 className="font-semibold text-zinc-100">Perfil de Estudio</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Los cambios se guardan automáticamente.</p>
          </div>

          <div className="px-6 py-5 space-y-6">
            {/* Idioma de la interfaz */}
            <div>
              <label htmlFor="interface_language" className={labelClass}>
                Idioma de la interfaz
              </label>
              <select
                id="interface_language"
                value={prefs.interface_language}
                onChange={(e) =>
                  update("interface_language", e.target.value as UserPreferences["interface_language"])
                }
                className={selectClass}
              >
                <option value="es">🇪🇸 Español</option>
                <option value="en">🇬🇧 English</option>
                <option value="eu">🏴 Euskara</option>
              </select>
            </div>

            {/* Dialecto preferido */}
            <div>
              <label htmlFor="dialect" className={labelClass}>
                Dialecto preferido (Euskalki)
              </label>
              <select
                id="dialect"
                value={prefs.dialect}
                onChange={(e) =>
                  update("dialect", e.target.value as UserPreferences["dialect"])
                }
                className={selectClass}
              >
                <option value="batua">Batua — Euskera estándar unificado</option>
                <option value="bizkaiera">Bizkaiera — Dialecto de Bizkaia</option>
                <option value="gipuzkera">Gipuzkera — Dialecto de Gipuzkoa</option>
                <option value="lapurtera">Lapurtera — Dialecto de Lapurdi</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            {/* Objetivo diario */}
            <div>
              <label htmlFor="daily_goal" className={labelClass}>
                Objetivo diario de palabras nuevas
              </label>
              <div className="flex items-center gap-4">
                <input
                  id="daily_goal"
                  type="range"
                  min={1}
                  max={50}
                  step={1}
                  value={prefs.daily_goal}
                  onChange={(e) => update("daily_goal", parseInt(e.target.value, 10))}
                  className="flex-1 accent-violet-500"
                />
                <span className="text-xl font-bold text-violet-400 w-10 text-right tabular-nums">
                  {prefs.daily_goal}
                </span>
              </div>
              <div className="flex justify-between text-xs text-zinc-600 mt-1 px-0.5">
                <span>1</span>
                <span>25</span>
                <span>50</span>
              </div>
            </div>
          </div>
        </section>

        {/* Sección: Sesión */}
        <section className="bg-zinc-900/60 border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.06]">
            <h2 className="font-semibold text-zinc-100">Sesión</h2>
          </div>
          <div className="px-6 py-5">
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                router.push("/auth/login");
              }}
              className="w-full py-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-colors text-sm font-medium"
            >
              Cerrar sesión
            </button>
          </div>
        </section>

        <p className="text-center text-xs text-zinc-700">
          Euskara SRS · Versión 0.1.0
        </p>
      </div>
    </main>
  );
}
