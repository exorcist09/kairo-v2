import { Router } from "express";
import * as authController from "../auth/auth.controller";
const authRouter = Router();

authRouter.post("/register", authController.registerController);
authRouter.post("/login", authController.loginController);
authRouter.post("/logout", authController.logoutController);
// authRouter.post("/verify-email", authController.verifyEmail);
// authRouter.post("/google/callback", authController.googleLogin);


export default authRouter;
