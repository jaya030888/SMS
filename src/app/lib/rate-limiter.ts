// src/app/lib/rate-limiter.ts

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up stale entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Check and record a rate-limit event for a given identifier (e.g. IP + route)
 * @param identifier Unique key (e.g. "login:192.168.1.1")
 * @param maxLimit Maximum allowed requests in the window
 * @param windowSeconds Window duration in seconds
 * @returns { allowed: boolean, remaining: number, resetInSeconds: number }
 */
export function checkRateLimit(
  identifier: string,
  maxLimit: number = 10,
  windowSeconds: number = 60
): { allowed: boolean; remaining: number; resetInSeconds: number } {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  
  const existing = rateLimitStore.get(identifier);

  if (!existing || now > existing.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs
    });
    return {
      allowed: true,
      remaining: maxLimit - 1,
      resetInSeconds: windowSeconds
    };
  }

  if (existing.count >= maxLimit) {
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds: Math.ceil((existing.resetTime - now) / 1000)
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: maxLimit - existing.count,
    resetInSeconds: Math.ceil((existing.resetTime - now) / 1000)
  };
}

/**
 * Helper to extract client IP address from Next.js Request headers
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}
