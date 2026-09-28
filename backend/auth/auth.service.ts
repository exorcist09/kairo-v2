import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";
import jwt from "jsonwebtoken";
import { type Response } from "express";

dotenv.config();

export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Invalid credentails");
  }

  // compare password
  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    throw new Error("Invalid email or password");
  }

  const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });

  const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });

  return { user, accessToken, refreshToken };
};

export const register = async (
  avatar: string,
  username: string,
  email: string,
  name: string,
  password: string,
) => {
  const userAlreadyExists = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  });

  if (userAlreadyExists) {
    throw new Error("Email or Username already exist");
  }

  const hashPassword = await bcrypt.hash(password, 10);

  // storing the user
  const newUser = await prisma.user.create({
    data: {
      avatar: avatar,
      username: username,
      email: email,
      name: name,
      password: hashPassword,
    },
  });

  return {
    avatar: newUser.avatar,
    name: newUser.name,
    email: newUser.email,
    username: newUser.username,
  };
};

export const logout = async (res: Response) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "strict",
  });

  return { message: "Logged out successfully" };
};
