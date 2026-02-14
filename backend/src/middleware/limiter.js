import rateLimit from "express-rate-limit";

export const regularLimiter = rateLimit({
  max: 200,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from the same IP , please try again in an hour",
  standardHeaders: true,
  legacyHeaders: false,
});

export const sensitiveLimiter = rateLimit({
  max: 20,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from the same IP , please try again in an hour",
  standardHeaders: true,
  legacyHeaders: false,
});
