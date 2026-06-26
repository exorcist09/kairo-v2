import { Router } from "express";
import * as authController from "../controllers/auth.controller";
const authRouter = Router();

authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);
authRouter.post("/refresh-token", authController.refreshToken);
authRouter.post("/logout", authController.logout);
authRouter.post("/verify-email", authController.verifyEmail);
// authRouter.post("/google/callback", authController.googleLogin);


export default authRouter;
