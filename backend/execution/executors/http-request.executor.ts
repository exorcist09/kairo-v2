import type { NodeExecutor } from "./node_context.schema";

export const executeHttpRequest: NodeExecutor = async (node, context) => {
  const { url, method, headers, body } = node.data ?? {};

  if (!url) {
    throw new Error("HTTP URL is required");
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const contentType = response.headers.get("content-type");

  const data = contentType?.includes("application/json")
    ? await response.json()
    : await response.text();

  return {
    status: response.status,
    data,
  };
};
