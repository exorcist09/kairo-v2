import { prisma } from "../lib/prisma";
import { executorRegistry } from "./executor.registry";
import type { ExecutionContext } from "./executors/node_context.schema";
import { emitToWorkflow } from "../lib/socket";

export const executeWorkflow = async (workflowId: string) => {
  // Load the workflow definition from PostgreSQL
  const workflow = await prisma.workflow.findUnique({
    where: {
      id: workflowId,
    },
    include: {
      nodes: true,
      connections: true,
    },
  });

  if (!workflow) {
    throw new Error("Workflow not found");
  }

  // Notify clients via socket that execution has started
  emitToWorkflow(workflowId, "workflow:execution:start", { workflowId });

  // Create temporary execution memory
  const context: ExecutionContext = {
    results: {},
    connections: workflow.connections,
  };

  const nodeMap = new Map(workflow.nodes.map((node) => [node.id, node]));
  const executedNodes = new Set<string>();

  const executeNode = async (nodeId: string) => {
    const node = nodeMap.get(nodeId);

    if (!node) {
      throw new Error(`Node ${nodeId} not found`);
    }

    if (executedNodes.has(node.id)) {
      return;
    }

    const executor = executorRegistry[node.type];
    if (!executor) {
      const err = new Error(`No executor found for node type: ${node.type}`);
      emitToWorkflow(workflowId, "workflow:node:error", {
        workflowId,
        nodeId: node.id,
        nodeType: node.type,
        error: err.message,
      });
      throw err;
    }

    // Collect incoming inputs passed to this node
    const incomingConnections = workflow.connections.filter(
      (connection) => connection.toNodeId === node.id,
    );
    const incomingInputs: Record<string, any> = {};
    for (const connection of incomingConnections) {
      if (context.results[connection.fromNodeId] !== undefined) {
        incomingInputs[connection.fromNodeId] = context.results[connection.fromNodeId];
      }
    }

    const sentPayload = {
      nodeData: node.data,
      incomingInputs: Object.keys(incomingInputs).length > 0 ? incomingInputs : null,
    };

    // Emit node start event -> frontend turns border GREEN
    emitToWorkflow(workflowId, "workflow:node:start", {
      workflowId,
      nodeId: node.id,
      nodeType: node.type,
      nodeTitle: node.name,
      sent: sentPayload,
    });

    try {
      const result = await executor(node, context);
      context.results[node.id] = result;
      executedNodes.add(node.id);

      // Emit node success event -> frontend turns border GREY & updates output data
      emitToWorkflow(workflowId, "workflow:node:success", {
        workflowId,
        nodeId: node.id,
        nodeType: node.type,
        nodeTitle: node.name,
        sent: sentPayload,
        result,
      });

      // Find all connections leaving this node
      const outgoingConnections = workflow.connections.filter(
        (connection) => connection.fromNodeId === node.id,
      );

      // Execute downstream connected nodes
      for (const connection of outgoingConnections) {
        await executeNode(connection.toNodeId);
      }
    } catch (error: any) {
      const errMsg = error instanceof Error ? error.message : "Node execution failed";
      // Emit node error event -> frontend turns border RED
      emitToWorkflow(workflowId, "workflow:node:error", {
        workflowId,
        nodeId: node.id,
        nodeType: node.type,
        nodeTitle: node.name,
        sent: sentPayload,
        error: errMsg,
      });
      throw error;
    }
  };

  try {
    // Find starting nodes (nodes with no incoming connection)
    const startingNodes = workflow.nodes.filter(
      (node) =>
        !workflow.connections.some(
          (connection) => connection.toNodeId === node.id,
        ),
    );

    for (const node of startingNodes) {
      await executeNode(node.id);
    }

    // Emit workflow complete event
    emitToWorkflow(workflowId, "workflow:execution:complete", {
      workflowId,
      results: context.results,
    });

    return context.results;
  } catch (error: any) {
    const errMsg = error instanceof Error ? error.message : "Workflow execution failed";
    emitToWorkflow(workflowId, "workflow:execution:failed", {
      workflowId,
      error: errMsg,
    });
    throw error;
  }
};
