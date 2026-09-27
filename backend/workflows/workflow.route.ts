import { Router } from "express";
import * as workflowController from "./workflow.controller";
const workflowRouter = Router();

// getallWorkflow
workflowRouter.get("/", workflowController.getAllWorkflowsController);

// create workflow
workflowRouter.post("/", workflowController.createWorkflowController);

// get a particualr workflow to open editor
workflowRouter.get("/:id", workflowController.getWorkflowByIdController);

// update workflow
workflowRouter.post("/:id", workflowController.saveController);

// delete workflow
workflowRouter.delete("/:id", workflowController.deleteWorkflowController);

export default workflowRouter;
