const splitCsv = (value) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export const getAllowedOrigins = () => {
  const configuredOrigins = splitCsv(
    process.env.CORS_ORIGINS || process.env.CORS_ORIGIN,
  );

  if (configuredOrigins.length > 0) {
    return configuredOrigins;
  }

  return ["http://localhost:5173", "http://127.0.0.1:5173"];
};

export const getTrustedFrontendUrl = () =>
  process.env.FRONTEND_URL || getAllowedOrigins()[0] || "http://localhost:5173";

export const getTrustedBackendUrl = () =>
  process.env.BACKEND_URL || "http://localhost:3001";

