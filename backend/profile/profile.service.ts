import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";

export const profile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User Not Found");
  }
  return user;
};

export const updateProfile = async (
  userId: string,
  data: { name?: string; country?: string; phone?: string },
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    throw new Error("User not found");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data,
  });

  return updatedUser;
};

export const updateEmail = async (userId: string, newEmail: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }
  const existingEmail = await prisma.user.findUnique({
    where: { email: newEmail },
  });

  if (existingEmail && existingEmail.id !== userId) {
    throw new Error("Email already in use");
  }

  const updateUserEmail = prisma.user.update({
    where: { id: userId },
    data: {
      email: newEmail,
    },
  });

  return updateUserEmail;
};

export const updatePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string,
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    throw new Error("User not found");
  }

  const isPasswordCorrect = await bcrypt.compare(
    currentPassword,
    user.password,
  );

  if (!isPasswordCorrect) {
    throw new Error("Current password is incorrect");
  }

  const hashPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: {
      password: newPassword,
    },
  });

  return {
    message: "Password updated successfully",
  };
};
