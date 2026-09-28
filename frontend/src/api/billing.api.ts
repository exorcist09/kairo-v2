import axiosInstance from "./axios";

export const getPlans = async () => {
  const response = await axiosInstance.get("/billing/plans");

  return response.data;
};


export const getBalance = async () => {
  const response = await axiosInstance.get("/billing/balance");

  return response.data;
};


export const getHistory = async () => {
  const response = await axiosInstance.get("/billing/ledger");

  return response.data;
};


