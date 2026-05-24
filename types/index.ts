export * from "@/lib/srs";

export interface UserPreferences {
  uiLanguage: "es" | "en" | "eu";
  dailyGoal: number;
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  dialectPreference: "batua" | "bizkaiera" | "gipuzkera" | "lapurtera" | "otro";
  timezone: string;
}

export interface UserProgressSummary {
  currentStreak: number;
  longestStreak: number;
  totalXp: number;
  masteryPercentage: number;
  reviewsDoneToday: number;
  reviewsPendingToday: number;
}
