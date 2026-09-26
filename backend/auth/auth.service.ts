import dotenv from "dotenv"
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";
import jwt from "jsonwebtoken";
import { type Response } from "express";



dotenv.config()


export const login = async (email: string, password: string) => {
    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        throw new Error("Invalid credentails")
    }

    // compare password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
        throw new Error("Invalid email or password");
    }

    const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
        expiresIn: "15m",
    });

    const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
        expiresIn: "7d",
    });

    return { user, accessToken, refreshToken }
}


export const register = async (avatar: String, username: string, name: string, email: string, password: string) => {

    const userAlreadyExists = await prisma.user.findFirst({
        where: {
            OR: [{ email }, { username }],
        },
    });

    if (userAlreadyExists) {
        throw new Error("Email or Username already exist")
    }

    const hashPassword = await bcrypt.hash(password, 10);


    // stroing the user
    const newUser = await prisma.user.create({
        data: {
            avatar,
            username,
            name,
            email,
            password: hashPassword,
        },
    });

    return (newUser.avatar, newUser.name, newUser.email, newUser.username)
}

export const logout = async (res: Response) => {
    res.clearCookie("refreshToken", {
        httpOnly: true,
        sameSite: "strict"
    })

    return { message: "Logged out successfully" }
}