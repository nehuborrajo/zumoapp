"use client";

import { useState, useEffect, useCallback } from "react";
import { leaguesAPI, CurrentLeagueResponse } from "@/lib/api";

export function useLeague() {
  const [data, setData] = useState<CurrentLeagueResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeague = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await leaguesAPI.getCurrent();
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading league");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeague();
  }, [fetchLeague]);

  return {
    league: data?.league || null,
    currentUser: data?.currentUser || null,
    participants: data?.participants || [],
    zones: data?.zones || null,
    loading,
    error,
    refetch: fetchLeague,
  };
}
