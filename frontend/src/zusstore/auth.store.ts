import { create } from "zustand";
import {
  setAuthToken,
  clearAuthToken,
  getAuthToken,
  getStoredUser,
} from "@/utils/auth";

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  name: string;
  avatar?: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (token: string, user?: AuthUser | null) => void;
  logout: () => void;
  init: () => void;
  updateUser: (fields: Partial<AuthUser>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  login: (token: string, user?: AuthUser | null) => {
    setAuthToken(token, user);
    set({ token, user: user || null, isAuthenticated: true });
  },
  logout: () => {
    clearAuthToken();
    set({ token: null, user: null, isAuthenticated: false });
  },
  init: () => {
    const token = getAuthToken();
    const user = getStoredUser();
    set({ token, user, isAuthenticated: !!token });
  },
  updateUser: (fields: Partial<AuthUser>) => {
    const current = get().user;
    if (!current) return;
    const updated = { ...current, ...fields };
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(updated));
    }
    set({ user: updated });
  },
}));
