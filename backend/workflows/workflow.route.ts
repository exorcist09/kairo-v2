import { Router } from "express";
import * as workflowController from "./workflow.controller";
const workflowRouter = Router();

// getallWorkflow -OK
workflowRouter.get("/", workflowController.getAllWorkflowsController);

// create workflow -OK
workflowRouter.post("/", workflowController.createWorkflowController);

// get a particualr workflow to open editor -OK
workflowRouter.get("/:id", workflowController.getWorkflowByIdController);

// delete workflow - OK
workflowRouter.delete("/:id", workflowController.deleteWorkflowController);


// update workflow inside the editor
workflowRouter.post("/:id", workflowController.saveController);


export default workflowRouter;
