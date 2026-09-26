import { prisma } from "../lib/prisma";
import type { WorkflowStatus } from "@prisma/client";

interface FlowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
}

interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

// createWorkflow
export const create = async (
  userId: string,
  workflowName: string,
  workflowDescription?: string,
) => {
  return await prisma.Workflow.create({
    data: {
      workflowName,
      workflowDescription,
      userId,
      workflowStatus: "DRAFT",
    },
  });
};


// get Workflow by Id
export const getbyId = async (userId: string, workflowId: string) => {

  const workflow = await prisma.Workflow.findFirst({
    where: { id: workflowId, userId },
    include: { nodes: true, connections: true },
  });

  if (!workflow) {
    throw new Error("Workflow not found");
  }

  // Convert server/database nodes to React Flow format casue thats how reactflow needs it 
  const nodes: FlowNode[] = workflow.nodes.map((node: any) => ({
    id: node.id,
    type: node.type,
    position: node.position as { x: number; y: number },
    data: (node.data as Record<string, unknown>) || {},
  }));

  // Convert server/database connections to React Flow edges
  const edges: FlowEdge[] = workflow.connections.map((connection: any) => ({
    id: connection.id,
    source: connection.fromNodeId,
    target: connection.toNodeId,
    sourceHandle: connection.fromOutput,
    targetHandle: connection.toInput,
  }));

  return {
    ...workflow,
    nodes,
    edges,
  };
};

// deleteWorkflow
export const remove = async (workflowId: string, userId: string) => {
  const workflow = await prisma.Workflow.findFirst({
    where: {
      id: workflowId,
      userId,
    },
  });
  if (!workflow) {
    throw new Error("Workflow not found");
  }

  return await prisma.Workflow.delete({
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
    ...(status && {
      workflowStatus: status,
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
    prisma.Workflow.findMany({
      where,
      orderBy: {
        updatedAt: "desc",
      },
      skip,
      take: limit,
    }),

    prisma.Workflow.count({
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
