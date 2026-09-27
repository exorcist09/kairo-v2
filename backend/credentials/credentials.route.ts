import { Router } from "express";
import * as credentialsController from "./credentials.controller";

const credentialsRouter = Router();

credentialsRouter.get("/", credentialsController.getAllCredentialsController);

credentialsRouter.get(
  "/savecredentials",
  credentialsController.savecredentialsController,
);

export default credentialsRouter;
