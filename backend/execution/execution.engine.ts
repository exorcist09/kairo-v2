import { prisma } from "../lib/prisma";
import { executorRegistry } from "./executor.registry";
import type { ExecutionContext } from "./executors/node_context.schema";

export const executeWorkflow = async (workflowId: string) => {
  // Load the workflow definition from PostgreSQL.
  //
  // This gives us:
  // - nodes
  // - connections

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

  // Create temporary execution memory.
  //
  // This object exists only during this execution.
  const context: ExecutionContext = {
    results: {},
    connections: workflow.connections,
  };

  // Make node lookup easier.
  //
  // Instead of repeatedly searching workflow.nodes,
  // we can directly find a node using its ID.
  const nodeMap = new Map(workflow.nodes.map((node) => [node.id, node]));

  // Keeps track of nodes that have already executed.
  const executedNodes = new Set<string>();

  const executeNode = async (nodeId: string) => {
    // Find the actual Node record.
    const node = nodeMap.get(nodeId);

    if (!node) {
      throw new Error(`Node ${nodeId} not found`);
    }

    // Prevent executing the same node twice.
    if (executedNodes.has(node.id)) {
      return;
    }

    // Find the executor for this node type.
    const executor = executorRegistry[node.type]; //httpexecutor, inputexecutor etc

    if (!executor) {
      throw new Error(`No executor found for node type: ${node.type}`);
    }

    // Execute the actual node logic.
    const result = await executor(node, context); //executor here is ->  httpexecutor, inputexecutor etc

    // Store the result using the node's ID.
    //
    // Example:
    //
    // context.results["previous node id"] = {
    //   url: "...",
    //   title: "...",
    //   text: "..."
    // };
    context.results[node.id] = result;

    // Mark this node as executed.
    executedNodes.add(node.id);

    // Find all connections leaving this node.
    const outgoingConnections = workflow.connections.filter(
      (connection) => connection.fromNodeId === node.id,
    );

    // Execute the connected nodes.
    for (const connection of outgoingConnections) {
      await executeNode(connection.toNodeId);
    }
  };

  // Find nodes that have no incoming connection.
  //
  // These are the starting points of the workflow.
  const startingNodes = workflow.nodes.filter(
    (node) =>
      !workflow.connections.some(
        (connection) => connection.toNodeId === node.id,
      ),
  );

  // Start executing the workflow.
  for (const node of startingNodes) {
    await executeNode(node.id);
  }

  // Return all node results.
  return context.results;
};
