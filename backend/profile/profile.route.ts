import Router from "express";
import * as ProfileController from "../profile/profile.controller";

const profileRouter = Router();

profileRouter.get("/me", ProfileController.profileController);

profileRouter.patch(
  "/updateprofile",
  ProfileController.updateProfileController,
);

profileRouter.patch(
  "/updateavatar",
  ProfileController.updateAvatarController,
);

profileRouter.patch("/updateemail", ProfileController.updateEmail);

profileRouter.put("/updatepassword", ProfileController.updatePassword);

export default profileRouter;
