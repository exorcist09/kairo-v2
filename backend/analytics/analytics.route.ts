import { Router } from "express";
import * as analyticsController from "./analytics.controller";

const analyticsRouter = Router();

analyticsRouter.get("/", analyticsController.getHomeAnalyticsController);

export default analyticsRouter;
