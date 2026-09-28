import { create } from "zustand";
import { getProfile } from "@/api/profile.api";

export interface ProfileUser {
  id: string;
  avatar: string;
  username: string;
  name: string | null;
  email: string;
  phone: string | null;
  country: string | null;
}

interface ProfileState {
  user: ProfileUser | null;
  loading: boolean;
  hasLoaded: boolean;
  error: string | null;
  fetchProfile: (force?: boolean) => Promise<void>;
  setUser: (user: ProfileUser | null) => void;
  updateUserFields: (fields: Partial<ProfileUser>) => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  user: null,
  loading: false,
  hasLoaded: false,
  error: null,
  fetchProfile: async (force = false) => {
    if (get().hasLoaded && !force) return;
    try {
      set({ loading: !get().hasLoaded, error: null });
      const res = await getProfile();
      if (res?.user) {
        set({ user: res.user, loading: false, hasLoaded: true });
      } else {
        set({ loading: false, hasLoaded: true });
      }
    } catch (err: any) {
      set({ error: err.message || "Failed to load profile", loading: false });
    }
  },
  setUser: (user) => set({ user, hasLoaded: true }),
  updateUserFields: (fields) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...fields } : null,
    })),
}));
