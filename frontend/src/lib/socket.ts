import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    // Strip trailing /api if present to connect to root socket.io server
    const socketUrl = apiUrl.replace(/\/api\/?$/, "");

    socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
  }

  return socket;
};
