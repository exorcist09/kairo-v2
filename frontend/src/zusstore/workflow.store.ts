import { create } from "zustand";
import {
  getallWorkflow,
  saveWorkflow as apiSaveWorkflow,
  deleteWorkflow as apiDeleteWorkflow,
} from "@/api/workflow.api";

export interface WorkflowItem {
  id: string;
  name: string;
  description?: string;
  status: "draft" | "ongoing" | "completed" | "failed";
  updatedAt: string;
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

interface WorkflowState {
  workflows: WorkflowItem[];
  loading: boolean;
  error: string | null;
  hasLoaded: boolean;
  fetchWorkflows: (force?: boolean) => Promise<void>;
  setWorkflows: (workflows: WorkflowItem[]) => void;
  addWorkflow: (name: string, description: string) => Promise<any>;
  deleteWorkflow: (id: string) => Promise<void>;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  workflows: [],
  loading: false,
  error: null,
  hasLoaded: false,
  fetchWorkflows: async (force = false) => {
    if (get().hasLoaded && !force) return;
    try {
      set({ loading: !get().hasLoaded, error: null });
      const res = await getallWorkflow();
      const list = res?.result?.workflows || [];
      const mapped: WorkflowItem[] = list.map((w: any) => ({
        id: w.id,
        name: w.workflowName,
        description: w.workflowDescription || "",
        status: (w.workflowStatus?.toLowerCase() || "draft") as WorkflowItem["status"],
        updatedAt: formatDate(w.updatedAt),
      }));
      set({ workflows: mapped, loading: false, hasLoaded: true });
    } catch (err: any) {
      set({ error: err.message || "Failed to load workflows", loading: false });
    }
  },
  setWorkflows: (workflows) => set({ workflows }),
  addWorkflow: async (name: string, description: string) => {
    const res = await apiSaveWorkflow({
      workflowName: name,
      workflowDescription: description,
    });
    if (res?.workflow) {
      const w = res.workflow;
      const newItem: WorkflowItem = {
        id: w.id,
        name: w.workflowName,
        description: w.workflowDescription || "",
        status: (w.workflowStatus?.toLowerCase() || "draft") as WorkflowItem["status"],
        updatedAt: formatDate(w.updatedAt || new Date().toISOString()),
      };
      set((state) => ({
        workflows: [newItem, ...state.workflows.filter((item) => item.id !== newItem.id)],
      }));
    }
    // Background refresh
    get().fetchWorkflows(true);
    return res?.workflow;
  },
  deleteWorkflow: async (id: string) => {
    await apiDeleteWorkflow(id);
    set((state) => ({
      workflows: state.workflows.filter((w) => w.id !== id),
    }));
  },
}));
