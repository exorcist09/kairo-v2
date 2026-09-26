import { prisma } from "../lib/prisma";
import dotenv from "dotenv";

// createWorkflow

export const create = async (
  userId: string,
  workflowName: string,
  workflowDescription?: string,
) => {
  return await prisma.workflow.create({
    data: {
      workflowName,
      workflowDescription,
      userId,
      status: "DRAFT",
    },
  });
};

// getAllWorkflows
export const getAll = async (userId: string) => {
  return await prisma.workflow.findMany({
    where: { id: userId },
    orderBy: {
      updatedAt: "desc",
    },
  });
};

// get Workflow by Id
export const getbyId = async (userId: string, workflowId: string) => {
  const workflow = await prisma.workflow.findFirst({
    where: { id: workflowId, userId },
  });

  if (!workflow) {
    throw new Error("Workflow not found");
  }
  return workflow;
};

// deleteWorkflow
export const remove = async (workflowId: string, userId: string) => {
  const workflow = await prisma.workflow.findFirst({
    where: {
      id: workflowId,
      userId,
    },
  });
  if (!workflow) {
    throw new Error("Workflow not found");
  }

  return await prisma.workflow.delete({
    where: {
      id: workflowId,
    },
  });
};
