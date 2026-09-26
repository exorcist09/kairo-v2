import { prisma } from "../lib/prisma";
import { WorkflowStatus } from "@prisma/client";



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

// simple getAllWorkflows
// export const getAll = async (userId: string) => {
//   return await prisma.workflow.findMany({
//     where: { id: userId },
//     orderBy: {
//       updatedAt: "desc",
//     },
//   });
// };

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

// getAllWorfldow with filter/paginationa nd search as well
export const getAll = async (
  userId: string,
  page: number,
  limit: number,
  status?: WorkflowStatus,
  search?: string,
) => {
  const skip = (page-1)*limit; //skips the first obtained number page=2 limit 10 then =(2-1)*10 = 10(means skips first 10 then return next 10)

  // this is what we give to prisma
  const where = {
    userId,

    // only add status to the query if provided, if provided like DRAFT it gets added to the query of postgres
    ...(status &&  {
      status: status,
    }),

    // same as status
    ...(search &&  {
      workflowName: {
        contains:search,  //actual value the user woudl search 
        mode: "insensitive" as const, //case insensitive
      }
    })
  }

    const [workflows, total] = await Promise.all([
    prisma.workflow.findMany({
      where,
      orderBy: {
        updatedAt: "desc",
      },
      skip,
      take: limit,
    }),

    prisma.workflow.count({
      where,
    }),
  ]);


  return {
    workflows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };

};
