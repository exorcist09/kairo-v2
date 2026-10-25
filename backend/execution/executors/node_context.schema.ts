// how does the node and context would look like

import type { Connection, Node } from "../../generated/prisma/client";

export type ExecutionContext = {
  results: Record<string, any>;
  connections: Connection[];
};

export type NodeExecutor = (
  node: Node,
  context: ExecutionContext,
) => Promise<any>;
