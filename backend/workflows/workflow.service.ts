import { prisma } from "../lib/prisma";
import { NodeType, WorkflowStatus } from "../generated/prisma/enums";

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
  return await prisma.workflow.create({
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

  const workflow = await prisma.workflow.findFirst({
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
  const skip = (page - 1) * limit; //skips the first obtained number page=2 limit 10 then =(2-1)*10 = 10(means skips first 10 then return next 10)

  // this is what we give to prisma
  const where = {
    userId,

    // only add status to the query if provided, if provided like DRAFT it gets added to the query of postgres
    ...(status && {
      workflowStatus: status,
    }),

    // same as status
    ...(search && {
      workflowName: {
        contains: search, //actual value the user woudl search
        mode: "insensitive" as const, //case insensitive
      },
    }),
  };

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

// save workflow in order to store node and edges when user has created the workflow

type SaveNode = {
  id: string;
  name?: string;
  type: NodeType;
  position: Record<string, any>;
  data: Record<string, any>;
};

type SaveConnection = {
  fromNodeId: string;
  toNodeId: string;
  fromOutput?: string;
  toInput?: string;
};

export const saveWorkflow = async (
  workflowId: string,
  userId: string,
  nodes: SaveNode[],
  connections: SaveConnection[],
) => {
  // First make sure this workflow belongs to
  // the user making the request.
  const workflow = await prisma.workflow.findFirst({
    where: {
      id: workflowId,
      userId,
    },
  });

  if (!workflow) {
    throw new Error("Workflow not found");
  }

  // Save the complete workflow atomically.
  //
  // Either everything succeeds,
  // or nothing is changed.
  await prisma.$transaction(async (tx) => {
    // Remove the old connections first because
    // they reference the existing nodes.
    await tx.connection.deleteMany({
      where: {
        workflowId,
      },
    });

    // Remove the old nodes.
    await tx.node.deleteMany({
      where: {
        workflowId,
      },
    });

    // Insert the nodes currently present
    // on the React Flow canvas.
    await tx.node.createMany({
      data: nodes.map((node) => ({
        id: node.id,
        workflowId,

        // React Flow's node type must match
        // your Prisma NodeType enum.
        type: node.type,

        // Use the node name if you have one.
        name: node.name ?? node.type,

        // React Flow position.
        position: node.position,

        // Node-specific configuration.
        //
        // Example:
        // Browser:
        // { url: "https://google.com" }
        //
        // Input:
        // { prompt: "Go search dolphins" }
        data: node.data,
      })),
    });

    // Insert all connections between nodes.
    await tx.connection.createMany({
      data: connections.map((connection) => ({
        workflowId,

        fromNodeId: connection.fromNodeId,
        toNodeId: connection.toNodeId,

        fromOutput: connection.fromOutput ?? "main",
        toInput: connection.toInput ?? "main",
      })),
    });
  });

  return {
    message: "Workflow saved successfully",
  };
};
