import { Router } from "express";
import * as credentialsController from "./credentials.controller";

const credentialsRouter = Router();

credentialsRouter.get("/", credentialsController.getAllCredentialsController);

credentialsRouter.post(
  "/save",
  credentialsController.savecredentialsController,
);

credentialsRouter.delete(
  "/:id",
  credentialsController.deleteCredentialController,
);

export default credentialsRouter;

