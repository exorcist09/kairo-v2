import { GoogleGenerativeAI } from "@google/generative-ai";

import type { NodeExecutor } from "./node_context.schema";
import type { GeminiNodeData } from "./node-data.types";

import { prisma } from "../../lib/prisma";

export const executeGemini: NodeExecutor = async (node, context) => {
  const data = node.data as GeminiNodeData;

  const credential = await prisma.credential.findUnique({
    where: {
      id: data.credentialId,
    },
  });

  if (!credential) {
    throw new Error("Gemini credential not found");
  }

  const genAI = new GoogleGenerativeAI(credential.value);

  const model = genAI.getGenerativeModel({
    model: data.model,
  });

  const result = await model.generateContent(data.prompt);

  return {
    response: result.response.text(),
  };
};
