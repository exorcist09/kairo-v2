import { Server as SocketIOServer } from "socket.io";
import type { Server as HTTPServer } from "http";

let io: SocketIOServer | null = null;

export const initSocket = (httpServer: HTTPServer) => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("join:workflow", (workflowId: string) => {
      if (workflowId) {
        socket.join(`workflow:${workflowId}`);
      }
    });

    socket.on("leave:workflow", (workflowId: string) => {
      if (workflowId) {
        socket.leave(`workflow:${workflowId}`);
      }
    });
  });

  return io;
};

export const getIO = () => io;

export const emitToWorkflow = (
  workflowId: string,
  event: string,
  payload: any,
) => {
  if (io && workflowId) {
    io.to(`workflow:${workflowId}`).emit(event, payload);
  }
};
