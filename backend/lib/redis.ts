import Redis from "ioredis";

// Redis is used by BullMQ to store jobs and their state.
export const redis = new Redis(
  process.env.REDIS_URL! || "redis://localhost:6379",
  {
    // BullMQ workers need this to be null so Redis commands
    // are not prematurely failed while waiting for a connection.
    maxRetriesPerRequest: null,
  },
);
// redis://localhost:6379" -> docker