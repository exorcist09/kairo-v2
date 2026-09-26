import type { NodeTypes } from "@xyflow/react";
import { NodeType } from "@/utils/constants";
import CustomNode from "./CustomNode";

// when nodetype is this use this node thats it
export const nodeComponents = {
  [NodeType.OPENAI]: CustomNode,
  [NodeType.GEMINI]: CustomNode,
  [NodeType.SLACK]: CustomNode,
} as const satisfies NodeTypes;

export type RegisteredNodeType = keyof typeof nodeComponents;
