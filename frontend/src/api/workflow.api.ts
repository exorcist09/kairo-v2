import axiosInstance from "./axios";

export interface WorkflowData {
  workflowName: string;
  workflowDescription?: string;
}

export interface CanvasNodePayload {
  id: string;
  name?: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, any>;
}

export interface CanvasConnectionPayload {
  fromNodeId: string;
  toNodeId: string;
  fromOutput?: string;
  toInput?: string;
}

export const getallWorkflow = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) => {
  const response = await axiosInstance.get("/workflows/", {
    params,
  });

  return response.data;
};

export const createWorkflow = async (data: WorkflowData) => {
  const response = await axiosInstance.post("/workflows/", data);

  return response.data;
};

// Kept for backward compatibility with existing store calls
export const saveWorkflow = createWorkflow;

export const getByIdWorkflow = async (id: string) => {
  const response = await axiosInstance.get(`/workflows/${id}`);

  return response.data;
};

export const deleteWorkflow = async (id: string) => {
  const response = await axiosInstance.delete(`/workflows/${id}`);

  return response.data;
};

export const saveWorkflowCanvas = async (
  id: string,
  payload: {
    nodes: CanvasNodePayload[];
    connections: CanvasConnectionPayload[];
  },
) => {
  const response = await axiosInstance.post(`/workflows/${id}/save`, payload);

  return response.data;
};

export const executeWorkflow = async (id: string) => {
  const response = await axiosInstance.post(`/workflows/${id}/execute`);

  return response.data;
};

