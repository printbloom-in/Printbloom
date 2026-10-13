import { headers } from "next/headers";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let ratelimiterInstance: Ratelimit | null = null;

// Initialize an Upstash rate limiter if env keys are present
export const getRateLimiter = () => {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  
  if (!ratelimiterInstance) {
    ratelimiterInstance = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(5, "1 m"), // Max 5 requests per 1 minute per IP
      analytics: true,
    });
  }

  return ratelimiterInstance;
};

// Fallback in-memory rate limiting for server actions (enquiries, reminders, promo-codes)
type RateLimitEntry = {
  count: number;
  resetTime: number; 
};

const rateLimitMap = new Map<string, RateLimitEntry>();
const LIMIT = 10;
const WINDOW_MS = 60 * 1000; // 1 minute

export async function getIP(): Promise<string> {
  try {
    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    if (forwardedFor) return forwardedFor.split(",")[0].trim();
    return headersList.get("x-real-ip") || "unknown-ip";
  } catch {
    return "unknown-ip";
  }
}

export function checkRateLimit(ip: string, endpoint: string): { success: boolean } {
  const key = `${endpoint}:${ip}`;
  const now = Date.now();

  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + WINDOW_MS });
    return { success: true };
  }

  if (entry.count >= LIMIT) {
    return { success: false };
  }

  entry.count += 1;
  return { success: true };
}
