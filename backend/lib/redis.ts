import Redis from "ioredis"


// Redis is used by BullMQ to store jobs and their state.
export const redis = new Redis(process.env.REDIS_URL!, {
  // BullMQ workers need this to be null so Redis commands
  // are not prematurely failed while waiting for a connection.
  maxRetriesPerRequest: null,
});