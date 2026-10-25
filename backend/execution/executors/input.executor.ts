import type { InputNodeData } from "./node-data.types";
import type { NodeExecutor } from "./node_context.schema";


export const executeInput: NodeExecutor = async (node, context) => {
  const data = node.data as InputNodeData;

  const prompt = data.prompt;

  if (!prompt) {
    throw new Error("Input node requires a value");
  }

  return {
    prompt,
  };
};
