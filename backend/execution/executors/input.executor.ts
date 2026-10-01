import type { NodeExecutor } from "./node_context.schema";

export const executeInput: NodeExecutor = async (node, context) => {
  const prompt = node.data?.prompt;

  if (!prompt) {
    throw new Error("Input node requires a value");
  }

  return {
    prompt,
  };
};
