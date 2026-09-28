import axiosInstance from "./axios";

export interface RegisterData {
  avatar: string;
  username: string;
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const register = async (data: RegisterData) => {
  const response = await axiosInstance.post("/auth/register", data);

  return response.data;
};

export const login = async (data: LoginData) => {
  const response = await axiosInstance.post("/auth/login", data);

  return response.data;
};

export const logout = async () => {
  const response = await axiosInstance.post("/auth/logout");

  return response.data;
};
