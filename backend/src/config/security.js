const splitCsv = (value) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export const getAllowedOrigins = () => {
  const configuredOrigins = splitCsv(
    process.env.CORS_ORIGINS || process.env.CORS_ORIGIN,
  );

  const developmentOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
    "http://localhost:5176",
    "http://127.0.0.1:5176",
  ];

  if (configuredOrigins.length > 0) {
    return process.env.NODE_ENV === "production"
      ? configuredOrigins
      : [...new Set([...configuredOrigins, ...developmentOrigins])];
  }

  return developmentOrigins;
};

export const getTrustedFrontendUrl = () =>
  process.env.FRONTEND_URL || getAllowedOrigins()[0] || "http://localhost:5173";

export const getTrustedBackendUrl = () =>
  process.env.BACKEND_URL || "http://localhost:3001";
