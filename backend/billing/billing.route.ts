import { Router } from "express";
import * as billingController from "./billling.controller";

const billingRouter = Router();

// fetch all plans _OK
billingRouter.get("/plans", billingController.getPlansController);

// OK
billingRouter.get("/balance", billingController.getBalanceController);

billingRouter.get("/ledger", billingController.getHistoryController);
billingRouter.post("/purchase", billingController.makePurchaseController);

export default billingRouter;
