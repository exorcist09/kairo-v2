import {type Request, type Response } from "express";
import dotenv from "dotenv";
import * as authService from "./auth.service"
import { login, logout, register } from "./auth.service";


dotenv.config();



export const registerController = async (req: Request, res: Response) => {
  try {
    const { avatar, username, email, name, password } = req.body;
    const result = await authService.register(avatar, username, email, name, password)
    return res.status(201).json({
      message: "User Registered Successfully",
      result,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const loginController = async (req: Request, res: Response) => {
  const { email, password } = req.body();

  const result = await authService.login(email, password);

  return res.status(200).json({
    message: "Login Successful",
    user: {
      id: result.user.id,
      email: result.user.email,
      username: result.user.username,
      name: result.user.name,
      verified: result.user.verified,
    },
    token: result.accessToken,
    refreshToken: result.refreshToken
  });
};


export const logoutController = async (req: Request, res: Response) => {
  try {

    const result = await authService.logout(res);

    return res.status(200).json(result);

  } catch (error) {
    return res.status(500).json({
      message: "Logout Failed"
    })
  }
};