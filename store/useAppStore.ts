import { create } from "zustand";
import { type SRSState } from "@/lib/srs";

interface StudySessionState {
  currentSessionId: string | null;
  isActive: boolean;
  cardsQueue: string[]; // List of word IDs left in current session
  currentIndex: number;
  xpEarnedThisSession: number;
  
  // Actions
  startSession: (sessionId: string, wordIds: string[]) => void;
  advanceCard: () => void;
  addXP: (amount: number) => void;
  endSession: () => void;
}

interface AppState {
  study: StudySessionState;
  streak: number;
  setStreak: (days: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  streak: 0,
  setStreak: (days) => set({ streak: days }),
  
  study: {
    currentSessionId: null,
    isActive: false,
    cardsQueue: [],
    currentIndex: 0,
    xpEarnedThisSession: 0,

    startSession: (sessionId, wordIds) =>
      set((state) => ({
        study: {
          ...state.study,
          currentSessionId: sessionId,
          isActive: true,
          cardsQueue: wordIds,
          currentIndex: 0,
          xpEarnedThisSession: 0,
        },
      })),

    advanceCard: () =>
      set((state) => ({
        study: {
          ...state.study,
          currentIndex: state.study.currentIndex + 1,
        },
      })),

    addXP: (amount) =>
      set((state) => ({
        study: {
          ...state.study,
          xpEarnedThisSession: state.study.xpEarnedThisSession + amount,
        },
      })),

    endSession: () =>
      set((state) => ({
        study: {
          ...state.study,
          currentSessionId: null,
          isActive: false,
          cardsQueue: [],
          currentIndex: 0,
        },
      })),
  },
}));
