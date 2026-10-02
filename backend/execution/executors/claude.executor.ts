import Anthropic from "@anthropic-ai/sdk";

import type { NodeExecutor } from "../executors/node_context.schema";
import type { ClaudeNodeData } from "./node-data.types";

import { prisma } from "../../lib/prisma";

export const executeClaude: NodeExecutor = async (node, context) => {
  const data = node.data as ClaudeNodeData;

  const credential = await prisma.credential.findUnique({
    where: {
      id: data.credentialId,
    },
  });

  if (!credential) {
    throw new Error("Claude credential not found");
  }

  const anthropic = new Anthropic({
    apiKey: credential.value,
  });

  const message = await anthropic.messages.create({
    model: data.model,

    max_tokens: 1024,

    messages: [
      {
        role: "user",
        content: data.prompt,
      },
    ],
  });

  return {
    response: message.content[0],
  };
};
