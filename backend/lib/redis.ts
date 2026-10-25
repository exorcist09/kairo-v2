import Redis from "ioredis";

// Redis is used by BullMQ to store jobs and their state.
export const redis = new Redis(
  process.env.REDIS_URL || "redis://localhost:6379",
  {
    maxRetriesPerRequest: null,
    enableOfflineQueue: false,
    lazyConnect: true,
    retryStrategy(times) {
      // Don't hammer CPU if local Redis server is not running
      if (times > 3) {
        return null;
      }
      return 2000;
    },
  },
);

// Prevent unhandled error event spam when Redis is not running locally
redis.on("error", (err) => {
  // Silent fallback: BullMQ is optional in local dev when Redis is inactive
});