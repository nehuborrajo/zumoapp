import { create } from "zustand";

interface UserStats {
  level: number;
  totalXp: number;
  coins: number;
  currentStreak: number;
  longestStreak: number;
  currentLeague: string;
  isPremium: boolean;
}

interface UserState {
  // User data
  userId: string | null;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  stats: UserStats | null;

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: Partial<UserState>) => void;
  updateStats: (stats: Partial<UserStats>) => void;
  addXp: (amount: number) => void;
  addCoins: (amount: number) => void;
  incrementStreak: () => void;
  reset: () => void;
}

const initialStats: UserStats = {
  level: 1,
  totalXp: 0,
  coins: 100,
  currentStreak: 0,
  longestStreak: 0,
  currentLeague: "BRONZE",
  isPremium: false,
};

export const useUserStore = create<UserState>((set, get) => ({
  // Initial state
  userId: null,
  username: null,
  displayName: null,
  avatarUrl: null,
  stats: null,
  isLoading: false,
  error: null,

  // Actions
  setUser: (user) =>
    set((state) => ({
      ...state,
      ...user,
    })),

  updateStats: (newStats) =>
    set((state) => ({
      stats: state.stats ? { ...state.stats, ...newStats } : { ...initialStats, ...newStats },
    })),

  addXp: (amount) =>
    set((state) => {
      if (!state.stats) return state;
      const newXp = state.stats.totalXp + amount;
      const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1;
      return {
        stats: {
          ...state.stats,
          totalXp: newXp,
          level: newLevel,
        },
      };
    }),

  addCoins: (amount) =>
    set((state) => {
      if (!state.stats) return state;
      return {
        stats: {
          ...state.stats,
          coins: state.stats.coins + amount,
        },
      };
    }),

  incrementStreak: () =>
    set((state) => {
      if (!state.stats) return state;
      const newStreak = state.stats.currentStreak + 1;
      return {
        stats: {
          ...state.stats,
          currentStreak: newStreak,
          longestStreak: Math.max(state.stats.longestStreak, newStreak),
        },
      };
    }),

  reset: () =>
    set({
      userId: null,
      username: null,
      displayName: null,
      avatarUrl: null,
      stats: null,
      isLoading: false,
      error: null,
    }),
}));
