import rateLimit from 'express-rate-limit';

/** Strict limiter for auth endpoints (login, register) */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
});

/**
 * Chat limiter. Every message can fan out into several model calls, so the
 * general 200/min ceiling is far too loose to bound spend. Keyed on the user
 * rather than the IP because a whole office typically shares one NAT address.
 * Mount after authMiddleware so req.user is populated.
 */
export const chatRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
  keyGenerator: (req) => req.user?.id ?? req.ip ?? 'anonymous',
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Chat rate limit reached. Please wait a moment before sending more messages.',
  },
});

/** General API limiter */
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Rate limit exceeded. Please slow down.',
  },
});
