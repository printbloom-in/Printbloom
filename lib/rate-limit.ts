import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize a rate limiter only if the environment variables are present.
// This prevents the app from crashing locally or in production before the keys are added.
export const getRateLimiter = () => {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  
  return new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(5, "1 m"), // Max 5 requests per 1 minute per IP
    analytics: true,
  });
};
