import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import * as profileService from "./profile.service"

dotenv.config();


export const profileController = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Token not found",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
    };

    const result = await profileService.profile(decoded.id)

    return res.status(200).json({
      message: "User retrieved successfully",
      user: {
        id: result.id,
        avatar: result.avatar,
        email: result.email,
        username: result.username,
        name: result.name,
        phone: result.phone,
        country: result.country
      },
    });
  } catch (error) {
    return res.status(401).json({
      message: "Invalid token",
    });
  }
};


export const updateProfileController = async (req: Request, res: Response) => {

  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Token not found",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
    };

    const { name, country, phone } = req.body

    const result = await profileService.updateProfile(decoded.id, {name, country, phone})

    return res.status(200).json({
      message: "User updated successfully",
      user: result
    })
  } catch (error) {
    return res.status(400).json({
      message: error instanceof Error
        ? error.message
        : "Failed to update profile",
    });
  }


}

export const updateEmail = async (req: Request, res: Response) => {

  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Token not found",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
    };

    const { email } = req.body

    const result = await profileService.updateEmail(decoded.id, email)

    return res.status(200).json({
      message: "Email updated successfully",
      email: result.email
    })
  } catch (error) {
    return res.status(400).json({
      message: error instanceof Error
        ? error.message
        : "Failed to update email",
    });
  }

}


export const updatePassword = async (req: Request, res: Response) => {

  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Token not found",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
    };

    const { currentPassword, newPassword } = req.body

    const result = await profileService.updatePassword(decoded.id, currentPassword, newPassword)

    return res.status(200).json(result)
  } catch (error) {
    return res.status(400).json({
      message: error instanceof Error
        ? error.message
        : "Failed to update password",
    });
  }

}
