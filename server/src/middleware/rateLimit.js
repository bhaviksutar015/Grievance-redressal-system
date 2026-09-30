import rateLimit from "express-rate-limit";

const json429 = {
  success: false,
  message: "Too many requests. Please slow down and try again shortly.",
};

/** General API limiter */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: json429,
});

/** Stricter limiter for write-heavy / sensitive endpoints */
export const sensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 40,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: json429,
});

/** Public tracking limiter (prevents reference-id enumeration) */
export const trackLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: json429,
});
