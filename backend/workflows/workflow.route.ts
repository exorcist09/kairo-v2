import { Router } from "express";
import * as workflowController from "./workflow.controller";
const workflowRouter = Router();
import * as executionController from "../execution/execution.controller";

// getallWorkflow -OK
workflowRouter.get("/", workflowController.getAllWorkflowsController);

// create workflow -OK
workflowRouter.post("/", workflowController.createWorkflowController);

// get a particualr workflow to open editor -OK
workflowRouter.get("/:id", workflowController.getWorkflowByIdController);

// delete workflow - OK
workflowRouter.delete("/:id", workflowController.deleteWorkflowController);

// save/update workflow inside the editor
workflowRouter.post("/:id/save", workflowController.saveController);

// execute workflow
workflowRouter.post(
  "/:id/execute",
  executionController.executeWorkflowController,
);

export default workflowRouter;
