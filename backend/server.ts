import dotenv from "dotenv";
import { createServer } from "http";
import { prisma } from "./lib/prisma";
import app from "./app.ts";
import { initSocket } from "./lib/socket";

dotenv.config();

const PORT = process.env.PORT || 8000;

const httpServer = createServer(app);

// Initialize Socket.io server
initSocket(httpServer);

httpServer.listen(PORT, async () => {
  console.log(`Server started on port ${PORT} with Socket.io enabled`);
  try {
    await prisma.$connect();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error);
  }
});

export default httpServer;
