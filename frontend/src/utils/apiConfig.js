const trimTrailingSlash = (value) => String(value || "").replace(/\/+$/, "");

const fallbackApiBaseUrl =
  typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:3001/api`
    : "http://localhost:3001/api";

export const API_BASE_URL = trimTrailingSlash(
  import.meta.env.VITE_API_BASE_URL || fallbackApiBaseUrl,
);

export const API_ORIGIN = API_BASE_URL.replace(/\/api$/, "");

export const toApiAssetUrl = (path) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;

  const normalizedPath = String(path).startsWith("/") ? path : `/${path}`;
  return `${API_ORIGIN}${normalizedPath}`;
};

