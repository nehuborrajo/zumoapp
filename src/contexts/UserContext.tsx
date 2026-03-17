"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { userAPI, type User } from "@/lib/api";

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateUser: (data: Partial<Pick<User, "displayName" | "username" | "avatarUrl">>) => Promise<User>;
  // Computed XP values
  xpProgress: number;
  xpInCurrentLevel: number;
  xpNeededForLevel: number;
  xpForNextLevel: number;
}

const UserContext = createContext<UserContextType | null>(null);

// Helper to calculate total XP needed to reach a level
function getTotalXpForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += Math.floor(100 * Math.pow(i, 1.5));
  }
  return total;
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userAPI.getMe();
      setUser(data);
    } catch (err) {
      setUser(null);
      if (err instanceof Error && err.message !== "Unauthorized") {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const updateUser = async (data: Partial<Pick<User, "displayName" | "username" | "avatarUrl">>) => {
    const updated = await userAPI.updateMe(data);
    setUser(updated);
    return updated;
  };

  // Calculate XP values
  const xpForCurrentLevel = user ? Math.floor(100 * Math.pow(user.level, 1.5)) : 100;
  const xpForNextLevel = user ? Math.floor(100 * Math.pow(user.level + 1, 1.5)) : 150;
  const xpInCurrentLevel = user ? user.totalXp - getTotalXpForLevel(user.level) : 0;
  const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;
  const xpProgress = user ? Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeededForLevel) * 100)) : 0;

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        error,
        refetch: fetchUser,
        updateUser,
        xpProgress,
        xpInCurrentLevel,
        xpNeededForLevel,
        xpForNextLevel,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
