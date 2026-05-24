export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          ui_language: "es" | "en" | "eu"
          daily_goal: number
          level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2"
          dialect_preference: "batua" | "bizkaiera" | "gipuzkera" | "lapurtera" | "otro"
          current_streak: number
          longest_streak: number
          last_session_date: string | null
          total_xp: number
          timezone: string
          avatar_url: string | null
          display_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          ui_language?: "es" | "en" | "eu"
          daily_goal?: number
          level?: "A1" | "A2" | "B1" | "B2" | "C1" | "C2"
          dialect_preference?: "batua" | "bizkaiera" | "gipuzkera" | "lapurtera" | "otro"
          current_streak?: number
          longest_streak?: number
          last_session_date?: string | null
          total_xp?: number
          timezone?: string
          avatar_url?: string | null
          display_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          ui_language?: "es" | "en" | "eu"
          daily_goal?: number
          level?: "A1" | "A2" | "B1" | "B2" | "C1" | "C2"
          dialect_preference?: "batua" | "bizkaiera" | "gipuzkera" | "lapurtera" | "otro"
          current_streak?: number
          longest_streak?: number
          last_session_date?: string | null
          total_xp?: number
          timezone?: string
          avatar_url?: string | null
          display_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      words: {
        Row: {
          id: string
          word_eu: string
          translation_es: string
          translation_en: string | null
          category: "sustantivo" | "verbo" | "adjetivo" | "adverbio" | "preposicion" | "conjuncion" | "pronombre" | "frase_hecha" | "numero" | "saludo" | "otro"
          difficulty: number
          frequency_rank: number | null
          pronunciation: string | null
          audio_url: string | null
          image_url: string | null
          definition_simple: string | null
          uso_habitual: string | null
          tags: string[]
          related_words: string[]
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          word_eu: string
          translation_es: string
          translation_en?: string | null
          category: "sustantivo" | "verbo" | "adjetivo" | "adverbio" | "preposicion" | "conjuncion" | "pronombre" | "frase_hecha" | "numero" | "saludo" | "otro"
          difficulty?: number
          frequency_rank?: number | null
          pronunciation?: string | null
          audio_url?: string | null
          image_url?: string | null
          definition_simple?: string | null
          uso_habitual?: string | null
          tags?: string[]
          related_words?: string[]
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          word_eu?: string
          translation_es?: string
          translation_en?: string | null
          category?: "sustantivo" | "verbo" | "adjetivo" | "adverbio" | "preposicion" | "conjuncion" | "pronombre" | "frase_hecha" | "numero" | "saludo" | "otro"
          difficulty?: number
          frequency_rank?: number | null
          pronunciation?: string | null
          audio_url?: string | null
          image_url?: string | null
          definition_simple?: string | null
          uso_habitual?: string | null
          tags?: string[]
          related_words?: string[]
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      examples: {
        Row: {
          id: string
          word_id: string
          sentence_eu: string
          sentence_es: string
          sentence_en: string | null
          audio_url: string | null
          difficulty: number | null
          source: string
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          word_id: string
          sentence_eu: string
          sentence_es: string
          sentence_en?: string | null
          audio_url?: string | null
          difficulty?: number | null
          source?: string
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          word_id?: string
          sentence_eu?: string
          sentence_es?: string
          sentence_en?: string | null
          audio_url?: string | null
          difficulty?: number | null
          source?: string
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "examples_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "words"
            referencedColumns: ["id"]
          }
        ]
      }
      user_word_progress: {
        Row: {
          user_id: string
          word_id: string
          ease_factor: number
          interval_days: number
          repetitions: number
          next_review_at: string | null
          mastery_score: number
          last_quality: number | null
          total_reviews: number
          correct_reviews: number
          first_seen_at: string
          last_reviewed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          word_id: string
          ease_factor?: number
          interval_days?: number
          repetitions?: number
          next_review_at?: string | null
          mastery_score?: number
          last_quality?: number | null
          total_reviews?: number
          correct_reviews?: number
          first_seen_at?: string
          last_reviewed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          word_id?: string
          ease_factor?: number
          interval_days?: number
          repetitions?: number
          next_review_at?: string | null
          mastery_score?: number
          last_quality?: number | null
          total_reviews?: number
          correct_reviews?: number
          first_seen_at?: string
          last_reviewed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_word_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_word_progress_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "words"
            referencedColumns: ["id"]
          }
        ]
      }
      sessions: {
        Row: {
          id: string
          user_id: string
          mode: "review" | "learn" | "practice" | "test"
          status: "in_progress" | "completed" | "abandoned"
          started_at: string
          ended_at: string | null
          duration_seconds: number | null
          cards_reviewed: number
          new_cards: number
          correct_count: number
          xp_earned: number
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          mode?: "review" | "learn" | "practice" | "test"
          status?: "in_progress" | "completed" | "abandoned"
          started_at?: string
          ended_at?: string | null
          duration_seconds?: number | null
          cards_reviewed?: number
          new_cards?: number
          correct_count?: number
          xp_earned?: number
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          mode?: "review" | "learn" | "practice" | "test"
          status?: "in_progress" | "completed" | "abandoned"
          started_at?: string
          ended_at?: string | null
          duration_seconds?: number | null
          cards_reviewed?: number
          new_cards?: number
          correct_count?: number
          xp_earned?: number
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      achievements: {
        Row: {
          id: string
          slug: string
          name_eu: string
          name_es: string
          name_en: string
          description_eu: string | null
          description_es: string | null
          description_en: string | null
          category: "streak" | "mastery" | "speed" | "volume" | "milestone"
          icon_url: string | null
          xp_reward: number
          display_order: number
          threshold_value: number | null
          is_hidden: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          name_eu: string
          name_es: string
          name_en: string
          description_eu?: string | null
          description_es?: string | null
          description_en?: string | null
          category: "streak" | "mastery" | "speed" | "volume" | "milestone"
          icon_url?: string | null
          xp_reward?: number
          display_order?: number
          threshold_value?: number | null
          is_hidden?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name_eu?: string
          name_es?: string
          name_en?: string
          description_eu?: string | null
          description_es?: string | null
          description_en?: string | null
          category?: "streak" | "mastery" | "speed" | "volume" | "milestone"
          icon_url?: string | null
          xp_reward?: number
          display_order?: number
          threshold_value?: number | null
          is_hidden?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          unlocked_at: string
          progress: number
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          unlocked_at?: string
          progress?: number
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          unlocked_at?: string
          progress?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      word_category: "sustantivo" | "verbo" | "adjetivo" | "adverbio" | "preposicion" | "conjuncion" | "pronombre" | "frase_hecha" | "numero" | "saludo" | "otro"
      session_status: "in_progress" | "completed" | "abandoned"
      session_mode: "review" | "learn" | "practice" | "test"
      achievement_category: "streak" | "mastery" | "speed" | "volume" | "milestone"
    }
  }
}
