import { request, type Request, type Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";
import jwt, { type JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import { sendEmail } from "../services/mail.service";
import { generateOTP, getOtpHTML } from "../utils/otp";

dotenv.config();



export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, name, password } = req.body;

    //   is userAlready exisits
    const userAlreadyRegistered = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (userAlreadyRegistered) {
      return res.status(400).json({
        message: "Email or Username already exists",
      });
    }

    //   making the normal password to hash
    const hashPassword = await bcrypt.hash(password, 10);

    //   storing the user
    const registerUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashPassword,
        name,
      },
    });
    return res.status(201).json({
      message: "User Registered Successfully",
      registerUser,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body();

  // finding user
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    return res.status(401).json({
      message: "Invalid email or password",
    });
  }

  if (!user.verified) {
    return res.status(401).json({
      message: "Email not verified",
    });
  }

  // compare password
  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    return res.status(401).json({
      message: "Invalid email or password",
    });
  }

  const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, //7days
  });

  const otp = generateOTP();
  const otpHTML = getOtpHTML(otp);

  const OTPHash = await bcrypt.hash(otp, 10);
  await prisma.otp.create({
    data: {
      email,
      otpHash: OTPHash,
    },
  });

  await sendEmail({
    to: email,
    subject: "OTP Verification",
    text: `Your OTP code is ${otp}`,
    html: otpHTML,
  });

  return res.status(200).json({
    message: "Login Successful",
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      verified: user.verified,
    },
    token: accessToken,
  });
};

export const refreshToken = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      message: "Refresh token not found",
    });
  }

  const decoded = jwt.verify(
    refreshToken,
    process.env.JWT_SECRET!,
  ) as JwtPayload;

  const newAccessToken = jwt.sign(
    {
      id: decoded.id,
    },
    process.env.JWT_SECRET!,
    { expiresIn: "15m" },
  );

  // generateing a new refresh token in order to have more security
  const newRefreshToken = jwt.sign(
    { id: decoded.id },
    process.env.JWT_SECRET!,
    {
      expiresIn: "7d",
    },
  );
  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, //7days
  });

  res.status(200).json({
    message: "Access token refresh successfully",
    token: newAccessToken,
  });
};

export const logout = async (req: Request, res: Response) => {};

export const verifyEmail = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      message: "Email and OTP are required",
    });
  }

  const otpRecord = await prisma.otp.findUnique({
    where: {
      email,
    },
  });

  if (!otpRecord) {
    return res.status(400).json({
      message: "Invalid OTP",
    });
  }

  // compare otp
  const isOtpValid = await bcrypt.compare(otp, otpRecord.otpHash);

  if (!isOtpValid) {
    return res.status(400).json({
      message: "Invalid or expired OTP",
    });
  }

  // verify user
  const user = await prisma.user.update({
    where: {
      email,
    },
    data: {
      verified: true,
    },
  });

  // delete Opt record of that user in the OTP table
  await prisma.otp.delete({
    where: {
      email,
    },
  });

  return res.status(200).json({
    message: "Email verified Successfully",
    user: {
      username: user.username,
      email: user.email,
      verified: user.verified,
    },
  });
};
