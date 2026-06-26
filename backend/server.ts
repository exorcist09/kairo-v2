import dotenv from "dotenv";
import { prisma } from "./lib/prisma";
import app from "./app.ts";


dotenv.config();


const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, async () => {
  console.log(`Server started in ${PORT}`);
  try {
    await prisma.$connect();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error);
  }
});

export default server;
