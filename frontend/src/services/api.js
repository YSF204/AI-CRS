import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const dedupCache = new Map();

function makeCacheKey(config) {
  const { method = "get", url, params, data } = config;
  return `${method.toUpperCase()}:${url}:${JSON.stringify(params || "")}:${typeof data === "string" ? data : JSON.stringify(data || "")}`;
}

api.interceptors.request.use((config) => {
  if (config.method && config.method.toLowerCase() !== "get") return config;
  const key = makeCacheKey(config);
  const cached = dedupCache.get(key);
  if (!cached) return config;
  if (Date.now() < cached.expiresAt) {
    const source = axios.CancelToken.source();
    config.cancelToken = source.token;
    source.cancel({ __cached: cached.data });
  } else {
    dedupCache.delete(key);
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    const cfg = response.config;
    if (cfg.method && cfg.method.toLowerCase() === "get") {
      const key = makeCacheKey(cfg);
      const ttl = cfg.__cacheTTL || 30_000;
      dedupCache.set(key, { data: response, expiresAt: Date.now() + ttl });
      setTimeout(() => dedupCache.delete(key), ttl + 100);
    }
    return response;
  },
  (error) => {
    if (axios.isCancel(error)) {
      const cached = error.message?.__cached;
      if (cached) return Promise.resolve(cached);
    }
    return Promise.reject(error);
  },
);

export function clearApiCache() {
  dedupCache.clear();
}

export default api;
