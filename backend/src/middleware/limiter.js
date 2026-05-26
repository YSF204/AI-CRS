import rateLimit from "express-rate-limit";

export const regularLimiter = rateLimit({
  max: 500,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour",
  standardHeaders: true,
  legacyHeaders: false,
});

export const sensitiveLimiter = rateLimit({
  max: 50,
  windowMs: 60 * 60 * 1000,
  message: "Too many attempts from this IP, please try again in an hour",
  standardHeaders: true,
  legacyHeaders: false,
});

export const analyzeLimiter = rateLimit({
  max: 10,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from the same IP , please try again in an hour",
  standardHeaders: true,
  legacyHeaders: false,
});