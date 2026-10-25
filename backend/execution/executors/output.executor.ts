import type { NodeExecutor } from "./node_context.schema";

export const executeOutput: NodeExecutor = async (node, context) => {
  const connection = context.connections.find(
    (connection) => connection.toNodeId === node.id,
  );

  if (!connection) {
    throw new Error("Output has no incoming connection");
  }

  const previousResult = context.results[connection.fromNodeId];

  return previousResult;
};
