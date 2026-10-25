import { create } from "zustand";
import { getHomeAnalytics, HomeAnalyticsData } from "@/api/analytics.api";

interface AnalyticsState {
  data: HomeAnalyticsData | null;
  loading: boolean;
  hasLoaded: boolean;
  error: string | null;
  fetchAnalytics: (force?: boolean) => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  data: null,
  loading: false,
  hasLoaded: false,
  error: null,
  fetchAnalytics: async (force = false) => {
    if (get().hasLoaded && !force) return;
    try {
      set({ loading: !get().hasLoaded, error: null });
      const data = await getHomeAnalytics();
      set({
        data,
        loading: false,
        hasLoaded: true,
      });
    } catch (err: any) {
      set({
        error: err?.response?.data?.message || err?.message || "Failed to load analytics",
        loading: false,
      });
    }
  },
}));
