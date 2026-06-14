/**
 * @description In-memory rate limiter using sliding window algorithm.
 * This implementation does NOT require Redis and works across
 * server-side requests in a single process.
 *
 * For distributed rate limiting (multiple instances), Redis-based
 * implementation is recommended (see docs/skills/rate_limiting.md).
 *
 * @module rate-limiter
 */

interface RateLimitEntry {
  /** Array of request timestamps within the current window */
  timestamps: number[];
}

interface RateLimitConfig {
  /** Window size in milliseconds */
  windowMs: number;
  /** Maximum number of requests allowed within the window */
  maxRequests: number;
}

interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean;
  /** Number of remaining requests in the current window */
  remaining: number;
  /** Time in ms until the oldest request expires from the window */
  retryAfterMs: number;
}

/** In-memory store for rate limit entries */
const rateLimitStore = new Map<string, RateLimitEntry>();

/** Default configurations for common endpoints */
export const RATE_LIMIT_CONFIGS = {
  /** Login: 5 attempts per minute */
  login: {
    windowMs: 60 * 1000,
    maxRequests: 5,
  },
  /** Registration: 3 attempts per hour */
  registration: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 3,
  },
  /** Progress writes: 10 writes per second per user */
  progress: {
    windowMs: 1000,
    maxRequests: 10,
  },
  /** General API: 100 requests per minute */
  api: {
    windowMs: 60 * 1000,
    maxRequests: 100,
  },
  /** File uploads: 10 uploads per hour */
  upload: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 10,
  },
} as const;

/**
 * @description Cleans up expired timestamps from a rate limit entry.
 * Removes timestamps older than the window.
 */
function cleanupEntry(entry: RateLimitEntry, windowMs: number): void {
  const now = Date.now();
  const cutoff = now - windowMs;
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
}

/**
 * @description Checks rate limit for a given key using sliding window algorithm.
 *
 * @param key - Unique identifier for the rate limit bucket (e.g., IP, user ID, email)
 * @param config - Rate limit configuration (window size and max requests)
 * @returns Rate limit result with allowed flag, remaining count, and retry timing
 *
 * @example
 * ```typescript
 * // Check login rate limit by email
 * const result = await checkRateLimit(`login:${email}`, RATE_LIMIT_CONFIGS.login);
 * if (!result.allowed) {
 *   return new Response('Too many attempts', { status: 429 });
 * }
 * ```
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();

  // Get or create entry
  let entry = rateLimitStore.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    rateLimitStore.set(key, entry);
  }

  // Clean up expired timestamps
  cleanupEntry(entry, config.windowMs);

  // Check if limit is exceeded
  if (entry.timestamps.length >= config.maxRequests) {
    const oldestTimestamp = entry.timestamps[0];
    const retryAfterMs = oldestTimestamp + config.windowMs - now;

    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: Math.max(0, retryAfterMs),
    };
  }

  // Add current timestamp and allow
  entry.timestamps.push(now);

  return {
    allowed: true,
    remaining: config.maxRequests - entry.timestamps.length,
    retryAfterMs: 0,
  };
}

/**
 * @description Creates a rate limit middleware for API routes.
 *
 * @param config - Rate limit configuration
 * @param keyExtractor - Function to extract the rate limit key from request
 * @returns Middleware function that wraps a request handler
 *
 * @example
 * ```typescript
 * const rateLimitedHandler = withRateLimit(
 *   RATE_LIMIT_CONFIGS.login,
 *   (req) => `login:${req.body.email}`
 * )(async (req) => {
 *   // Handle login
 *   return new Response('OK');
 * });
 * ```
 */
export function withRateLimit(
  config: RateLimitConfig,
  keyExtractor: (request: Request) => string
) {
  return function rateLimitMiddleware(
    handler: (request: Request) => Promise<Response>
  ) {
    return async function rateLimitedHandler(request: Request): Promise<Response> {
      const key = keyExtractor(request);
      const result = checkRateLimit(key, config);

      if (!result.allowed) {
        return new Response(
          JSON.stringify({
            error: 'Rate limit exceeded',
            retryAfterMs: result.retryAfterMs,
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'X-RateLimit-Limit': String(config.maxRequests),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': String(Math.ceil(result.retryAfterMs / 1000)),
              'Retry-After': String(Math.ceil(result.retryAfterMs / 1000)),
            },
          }
        );
      }

      const response = await handler(request);

      // Add rate limit headers to successful responses
      response.headers.set('X-RateLimit-Limit', String(config.maxRequests));
      response.headers.set('X-RateLimit-Remaining', String(result.remaining));

      return response;
    };
  };
}

/**
 * @description Cleans up expired entries from the rate limit store.
 * Call this periodically to prevent memory leaks.
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  const maxWindowMs = Math.max(
    ...Object.values(RATE_LIMIT_CONFIGS).map((c) => c.windowMs)
  );

  for (const [key, entry] of rateLimitStore.entries()) {
    cleanupEntry(entry, maxWindowMs);
    if (entry.timestamps.length === 0) {
      rateLimitStore.delete(key);
    }
  }
}

// Clean up every 5 minutes to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitStore, 5 * 60 * 1000);
}
