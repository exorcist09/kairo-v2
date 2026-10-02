import OpenAI from "openai";
import { prisma } from "../../lib/prisma";
import type { OpenAINodeData } from "./node-data.types";
import type { NodeExecutor } from "./node_context.schema";

export const executeOpenai: NodeExecutor = async (node, context) => {
  const data = node.data as OpenAINodeData;

  const credential = await prisma.credential.findUnique({
    where: { id: data.credentialId },
  });
  if (!credential) {
    throw new Error("Open AI credentails not found");
  }

  const openai = new OpenAI({
    apiKey: credential.value,
  });

  const response = await openai.chat.completions.create({
    model: data.model,
    messages: [
      {
        role: "user",
        content: data.prompt,
      },
    ],
    temperature: data.temperature ?? 0.7,
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error("OpenAI did not return a response");
  }

  return {
    response: content,
  };
};
