export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMs: number;
}

// In-memory sliding window rate limiter
class SlidingWindowRateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 30, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  public check(identifier: string): RateLimitResult {
    const now = Date.now();
    const timestamps = this.requests.get(identifier) || [];
    const windowStart = now - this.windowMs;

    // Filter out timestamps older than the window
    const validTimestamps = timestamps.filter((t) => t > windowStart);

    if (validTimestamps.length >= this.maxRequests) {
      const oldestInWindow = validTimestamps[0];
      const resetMs = Math.max(0, oldestInWindow + this.windowMs - now);
      return {
        allowed: false,
        remaining: 0,
        resetMs,
      };
    }

    validTimestamps.push(now);
    this.requests.set(identifier, validTimestamps);

    return {
      allowed: true,
      remaining: this.maxRequests - validTimestamps.length,
      resetMs: this.windowMs,
    };
  }

  public reset(identifier?: string): void {
    if (identifier) {
      this.requests.delete(identifier);
    } else {
      this.requests.clear();
    }
  }
}

// Global rate limiters
export const dmRateLimiter = new SlidingWindowRateLimiter(25, 60000); // 25 requests per minute
export const portraitRateLimiter = new SlidingWindowRateLimiter(10, 60000); // 10 portraits per minute

export interface AiMetrics {
  endpoint: string;
  model: string;
  latencyMs: number;
  promptChars: number;
  responseChars: number;
  status: "success" | "fallback" | "rate_limited" | "error";
  errorReason?: string;
  timestamp: string;
}

export function logAiMetrics(metrics: AiMetrics): void {
  const logLine = `[AI METRICS] ${JSON.stringify(metrics)}`;
  if (metrics.status === "error") {
    console.error(logLine);
  } else if (metrics.status === "fallback" || metrics.status === "rate_limited") {
    console.warn(logLine);
  } else {
    console.log(logLine);
  }
}

/**
 * Clamps user inputs and prevents unbounded prompt payloads
 */
export function sanitizePlayerInput(input: string, maxLength: number = 1000): string {
  if (!input) return "";
  // Strip null bytes and non-printable control characters
  const cleaned = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim();
  // Strip potential script injections
  const sanitized = cleaned.replace(/<[^>]*>?/gm, "");
  // Clamp length
  return sanitized.slice(0, maxLength);
}

/**
 * Clamps DC checks to valid 5e bounds (Easy: 10, Hard: 20, Impossible: 30)
 */
export function clampDC(dc: number): number {
  if (isNaN(dc)) return 12;
  return Math.max(5, Math.min(30, Math.round(dc)));
}
