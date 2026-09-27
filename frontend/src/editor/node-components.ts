import type { NodeTypes } from "@xyflow/react";
import { NodeType } from "@/utils/constants";
import CustomNode from "./CustomNode";

// Map each NodeType to its React Flow component
export const nodeComponents = {
  [NodeType.OPENAI]: CustomNode,
  [NodeType.GEMINI]: CustomNode,
  [NodeType.SLACK]: CustomNode,
  [NodeType.MANUAL_TRIGGER]: CustomNode,
  [NodeType.WEBHOOK]: CustomNode,
  [NodeType.HTTP_TRIGGER]: CustomNode,
  [NodeType.EMAIL]: CustomNode,
  [NodeType.POSTGRES]: CustomNode,
  [NodeType.OUTPUT]: CustomNode,
  [NodeType.TEXT]: CustomNode,
  [NodeType.GOOGLE_FORM]: CustomNode,
  [NodeType.HTTP_REQUEST]: CustomNode,
} as const satisfies NodeTypes;

export type RegisteredNodeType = keyof typeof nodeComponents;
