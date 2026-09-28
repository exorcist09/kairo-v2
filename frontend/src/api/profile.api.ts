import axiosInstance from "./axios";

interface ProfileData {
  name: string;
  phone: string;
  country: string;
}

export const getProfile = async () => {
  const response = await axiosInstance.get("/me");

  return response.data;
};

export const updateProfile = async (data: ProfileData) => {
  const response = await axiosInstance.patch("/updateprofile", data);

  return response.data;
};

export const updateEmail = async (data: { email: string }) => {
  const response = await axiosInstance.patch("/updateemail", data);

  return response.data;
};

export const updateAvatar = async (data: { avatar: string }) => {
  const response = await axiosInstance.patch("/updateavatar", data);

  return response.data;
};

export const updatePassword = async (data: {
  currentPassword: string;
  newPassword: string;
}) => {
  const response = await axiosInstance.put("/updatepassword", data);

  return response.data;
};

