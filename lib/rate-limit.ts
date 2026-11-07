import { headers } from "next/headers";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let ratelimiterInstance: Ratelimit | null = null;
let leadRateLimiterInstance: Ratelimit | null = null;
let resendRateLimiterInstance: Ratelimit | null = null;

// Initialize an Upstash rate limiter for general API routes (5 req/min)
export const getRateLimiter = () => {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  
  if (!ratelimiterInstance) {
    ratelimiterInstance = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(5, "1 m"),
      analytics: true,
      prefix: "ratelimit:api",
    });
  }

  return ratelimiterInstance;
};

// Distributed rate limiter for abandoned-cart leads (5 submissions per 10 minutes per IP)
export const getLeadRateLimiter = () => {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  
  if (!leadRateLimiterInstance) {
    leadRateLimiterInstance = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(5, "10 m"),
      analytics: true,
      prefix: "ratelimit:lead",
    });
  }

  return leadRateLimiterInstance;
};

// Distributed rate limiter for auth confirmation resend (3 requests per 15 minutes per IP)
export const getResendRateLimiter = () => {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  
  if (!resendRateLimiterInstance) {
    resendRateLimiterInstance = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(3, "15 m"),
      analytics: true,
      prefix: "ratelimit:resend",
    });
  }

  return resendRateLimiterInstance;
};

// Fallback in-memory rate limiting for server actions
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

// In-memory fallback rate limiter
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

// Distributed rate limit check with graceful memory fallback
export async function checkDistributedRateLimit(
  ip: string, 
  action: "lead" | "resend" | "general"
): Promise<{ success: boolean; source: "redis" | "memory" }> {
  let limiter: Ratelimit | null = null;
  if (action === "lead") {
    limiter = getLeadRateLimiter();
  } else if (action === "resend") {
    limiter = getResendRateLimiter();
  } else {
    limiter = getRateLimiter();
  }

  if (limiter && ip !== "unknown-ip") {
    try {
      const result = await limiter.limit(ip);
      return { success: result.success, source: "redis" };
    } catch (err) {
      console.warn("Upstash Redis rate limit failed, falling back to local memory:", err);
      return { ...checkRateLimit(ip, action), source: "memory" };
    }
  }

  return { ...checkRateLimit(ip, action), source: "memory" };
}
