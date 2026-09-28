import axiosInstance from "./axios";

interface CredentialData {
  type: string;
  name: string;
  value: string;
}

export const getCredentials = async () => {
  const response = await axiosInstance.get("/credentials/");

  return response.data;
};

export const saveCredentials = async (data: CredentialData) => {
  const response = await axiosInstance.post("/credentials/save", data);

  return response.data;
};

export const deleteCredential = async (id: string) => {
  const response = await axiosInstance.delete(`/credentials/${id}`);

  return response.data;
};

