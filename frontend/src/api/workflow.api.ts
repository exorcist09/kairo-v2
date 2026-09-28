import axiosInstance from "./axios";

interface WorkflowData {
  workflowName: string;
  workflowDescription?: string;
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

export const saveWorkflow = async (data: WorkflowData) => {
  const response = await axiosInstance.post("/workflows/", data);

  return response.data;
};

export const getByIdWorkflow = async (id: string) => {
  const response = await axiosInstance.get(`/workflows/${id}`);

  return response.data;
};

export const deleteWorkflow = async (id: string) => {
  const response = await axiosInstance.delete(`/workflows/${id}`);

  return response.data;
};
