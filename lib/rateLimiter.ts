import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiter
// Note: This is suitable for single-instance deployments only
// For production with multiple instances, use Redis-based rate limiting

interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  max: number;       // Maximum number of requests per window
  message?: string;  // Custom error message
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// Storage for rate limit data
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup function
let cleanupIntervalId: NodeJS.Timeout | null = null;

function startCleanup() {
  if (cleanupIntervalId) return; // Already running
  
  cleanupIntervalId = setInterval(() => {
    const now = Date.now();
    rateLimitStore.forEach((entry, key) => {
      if (entry.resetTime < now) {
        rateLimitStore.delete(key);
      }
    });
  }, 60000); // Clean up every minute
}

// Start cleanup when first rate limiter is created
function ensureCleanupRunning() {
  if (!cleanupIntervalId && typeof window === 'undefined') {
    startCleanup();
  }
}

// Export cleanup function for testing/shutdown
export function stopRateLimiterCleanup() {
  if (cleanupIntervalId) {
    clearInterval(cleanupIntervalId);
    cleanupIntervalId = null;
  }
}

export function createRateLimiter(config: RateLimitConfig) {
  // Ensure cleanup is running
  ensureCleanupRunning();
  
  return async function rateLimit(request: NextRequest): Promise<NextResponse | null> {
    // Get client identifier (IP address or user ID)
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    const key = `${request.nextUrl.pathname}:${ip}`;
    const now = Date.now();
    
    // Get or create rate limit entry
    let entry = rateLimitStore.get(key);
    
    if (!entry || entry.resetTime < now) {
      // Create new entry
      entry = {
        count: 1,
        resetTime: now + config.windowMs
      };
      rateLimitStore.set(key, entry);
    } else {
      // Increment count
      entry.count++;
    }
    
    // Check if limit exceeded
    if (entry.count > config.max) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      
      return NextResponse.json(
        {
          error: config.message || 'Too many requests',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': config.max.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(entry.resetTime).toISOString()
          }
        }
      );
    }
    
    // Request is allowed - return null to continue
    return null;
  };
}

// Pre-configured rate limiters for different endpoints
export const rateLimiters = {
  // Registration: 5 attempts per hour per IP
  register: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: 'Too many registration attempts. Please try again later.'
  }),
  
  // Checkout: 10 attempts per hour per IP
  checkout: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    message: 'Too many checkout attempts. Please try again later.'
  }),
  
  // API general: 100 requests per 15 minutes per IP
  api: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: 'Too many API requests. Please slow down.'
  }),
  
  // Geocoding: 30 requests per minute per IP
  geocoding: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 30,
    message: 'Too many geocoding requests. Please try again later.'
  }),
  
  // Favorites: 60 requests per minute per IP
  favorites: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 60,
    message: 'Too many favorite operations. Please slow down.'
  })
};

// Helper function to apply rate limiting in API routes
export async function withRateLimit(
  request: NextRequest,
  limiter: ReturnType<typeof createRateLimiter>,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  const rateLimitResponse = await limiter(request);
  
  if (rateLimitResponse) {
    return rateLimitResponse;
  }
  
  return handler();
}