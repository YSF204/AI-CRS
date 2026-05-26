import { getRedis } from "../config/redis.js";

const safeJsonParse = (str) => {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
};

export const getCacheJson = async (key) => {
  const client = getRedis();
  if (!client) return null;

  try {
    const value = await client.get(key);
    if (!value) return null;
    return safeJsonParse(value);
  } catch (err) {
    console.warn(`Redis get error for key ${key}: ${err.message}`);
    return null;
  }
};

export const setCacheJson = async (key, value, ttlSeconds) => {
  const client = getRedis();
  if (!client) return false;

  try {
    const payload = JSON.stringify(value);
    if (ttlSeconds) {
      await client.set(key, payload, { EX: ttlSeconds });
    } else {
      await client.set(key, payload);
    }
    return true;
  } catch (err) {
    console.warn(`Redis set error for key ${key}: ${err.message}`);
    return false;
  }
};

export const delCache = async (key) => {
  const client = getRedis();
  if (!client) return false;

  try {
    await client.del(key);
    return true;
  } catch (err) {
    console.warn(`Redis del error for key ${key}: ${err.message}`);
    return false;
  }
};