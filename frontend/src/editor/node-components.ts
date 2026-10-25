import type { NodeTypes } from "@xyflow/react";
import { NodeType } from "@/utils/constants";
import CustomNode from "./CustomNode";

// Map each NodeType to its React Flow component
export const nodeComponents = {
  [NodeType.INPUT_TRIGGER]: CustomNode,
  [NodeType.BROWSER_TRIGGER]: CustomNode,
  [NodeType.HTTP_TRIGGER]: CustomNode,
  [NodeType.WEBHOOK_TRIGGER]: CustomNode,
  [NodeType.OUTPUT]: CustomNode,
  [NodeType.CLAUDE_EXECUTER]: CustomNode,
  [NodeType.OPENAI_EXECUTER]: CustomNode,
  [NodeType.GEMINI_EXECUTER]: CustomNode,
  [NodeType.POSTGRES_EXECUTER]: CustomNode,
  [NodeType.EMAIL_EXECUTER]: CustomNode,
  [NodeType.GOOGLE_FORM_EXECUTER]: CustomNode,
  [NodeType.SLACK_EXECUTER]: CustomNode,
} as const satisfies NodeTypes;

export type RegisteredNodeType = keyof typeof nodeComponents;

