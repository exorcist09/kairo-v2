import nodemailer from "nodemailer";
import type { NodeExecutor } from "./node_context.schema";
import type { EmailNodeData } from "./node-data.types";
import { prisma } from "../../lib/prisma";

export const executeEmail: NodeExecutor = async (node, context) => {
  const data = node.data as EmailNodeData;

  if (!data.credentialId) {
    throw new Error("Email credential is required");
  }

  if (!data.to) {
    throw new Error("Recipient email is required");
  }

  let subject = data.subject;
  let body = data.body;

  // If subject or body is missing, get them from the previous node
  if (!subject || !body) {
    const connection = context.connections.find(
      (connection) => connection.toNodeId === node.id
    );

    if (!connection) {
      throw new Error(
        "Email subject/body is missing and there is no previous node"
      );
    }

    const previousResult = context.results[connection.fromNodeId];

    if (!previousResult) {
      throw new Error("Previous node did not return any result");
    }

    // Use subject from previous node if Email subject was not provided
    if (!subject && typeof previousResult.subject === "string") {
      subject = previousResult.subject;
    }

    // Use body from previous node if Email body was not provided
    if (!body && typeof previousResult.body === "string") {
      body = previousResult.body;
    }

    // If previous node returned { response: "..." },
    // use response as the email body
    if (!body && typeof previousResult.response === "string") {
      body = previousResult.response;
    }
  }

  if (!subject) {
    throw new Error("Email subject is required");
  }

  if (!body) {
    throw new Error("Email body is required");
  }

  // Get user's SMTP credentials
  const credential = await prisma.credential.findUnique({
    where: {
      id: data.credentialId,
    },
  });

  if (!credential) {
    throw new Error("Email credential not found");
  }

  const smtp = JSON.parse(credential.value);

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.port === 465,
    auth: {
      user: smtp.username,
      pass: smtp.password,
    },
  });

  const info = await transporter.sendMail({
    from: data.from,
    to: data.to,
    subject,
    text: body,
  });

  return {
    messageId: info.messageId,
    accepted: info.accepted,
    rejected: info.rejected,
  };
};