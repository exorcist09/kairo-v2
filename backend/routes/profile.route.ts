import Router from "express"
import * as ProfileController from "../controllers/profile.controller";

const profileRouter = Router();

profileRouter.get("/me", ProfileController.profile);

export default profileRouter;