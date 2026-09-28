import { Router } from "express";
import * as billingController from "./billling.controller";

const billingRouter = Router();

billingRouter.get("/balance", billingController.getBalanceController);
billingRouter.get("/plans", billingController.getPlansController);
billingRouter.get("/ledger", billingController.getHistoryController);
billingRouter.post("/purchase", billingController.makePurchaseController);

export default billingRouter;
