import { create } from "zustand";
import { getCredentials, saveCredentials as apiSaveCredentials, deleteCredential as apiDeleteCredential } from "@/api/credentials.api";

export interface CredentialItem {
  id: string;
  name: string;
  provider: string;
  value: string;
  createdAt: string;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "Recently";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

interface CredentialState {
  credentials: CredentialItem[];
  loading: boolean;
  hasLoaded: boolean;
  error: string | null;
  fetchCredentials: (force?: boolean) => Promise<void>;
  addCredential: (data: { type: string; name: string; value: string }) => Promise<void>;
  deleteCredential: (id: string) => Promise<void>;
}

export const useCredentialStore = create<CredentialState>((set, get) => ({
  credentials: [],
  loading: false,
  hasLoaded: false,
  error: null,
  fetchCredentials: async (force = false) => {
    if (get().hasLoaded && !force) return;
    try {
      set({ loading: !get().hasLoaded, error: null });
      const res = await getCredentials();
      if (res?.credentials && Array.isArray(res.credentials)) {
        const mapped = res.credentials.map((c: any) => ({
          id: c.id,
          name: c.name,
          provider: c.type || "OpenAI",
          value: c.value,
          createdAt: formatDate(c.createdAt),
        }));
        set({ credentials: mapped, loading: false, hasLoaded: true });
      } else {
        set({ credentials: [], loading: false, hasLoaded: true });
      }
    } catch (err: any) {
      set({ error: err.message || "Failed to load credentials", loading: false });
    }
  },
  addCredential: async (data) => {
    await apiSaveCredentials(data);
    await get().fetchCredentials(true);
  },
  deleteCredential: async (id: string) => {
    await apiDeleteCredential(id);
    set((state) => ({
      credentials: state.credentials.filter((c) => c.id !== id),
    }));
  },
}));
