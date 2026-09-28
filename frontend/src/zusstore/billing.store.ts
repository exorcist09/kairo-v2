import { create } from "zustand";
import { getBalance, getHistory, getPlans } from "@/api/billing.api";

export interface PlanItem {
  id: string;
  type: "FREE_TIER" | "SMALL" | "MEDIUM" | "LARGE" | "CUSTOM";
  credits: number | null;
  price: string | number | null;
  pricePerCredit: string | number | null;
  minCredits: number | null;
  maxCredits: number | null;
}

interface BillingState {
  balance: number;
  plan: string;
  plans: PlanItem[];
  history: any[];
  hasLoaded: boolean;
  loading: boolean;
  error: string | null;
  fetchBillingData: (force?: boolean) => Promise<void>;
  setBalance: (balance: number) => void;
  addBalance: (amount: number) => void;
}

export const useBillingStore = create<BillingState>((set, get) => ({
  balance: 0,
  plan: "FREE_TIER",
  plans: [],
  history: [],
  hasLoaded: false,
  loading: false,
  error: null,
  fetchBillingData: async (force = false) => {
    if (get().hasLoaded && !force) return;
    try {
      set({ loading: !get().hasLoaded, error: null });
      const [balRes, histRes, plansRes] = await Promise.allSettled([
        getBalance(),
        getHistory(),
        getPlans(),
      ]);

      let balance = get().balance;
      let plan = get().plan;
      let history = get().history;
      let plans = get().plans;

      if (balRes.status === "fulfilled" && balRes.value) {
        if (typeof balRes.value.balance === "number") balance = balRes.value.balance;
        if (balRes.value.plan) plan = balRes.value.plan;
      }
      if (histRes.status === "fulfilled" && histRes.value?.history) {
        history = histRes.value.history;
      }
      if (plansRes.status === "fulfilled" && plansRes.value?.plans) {
        plans = plansRes.value.plans;
      }

      set({
        balance,
        plan,
        history,
        plans,
        loading: false,
        hasLoaded: true,
      });
    } catch (err: any) {
      set({ error: err.message || "Failed to load billing data", loading: false });
    }
  },
  setBalance: (balance) => set({ balance }),
  addBalance: (amount) => set((state) => ({ balance: state.balance + amount })),
}));
