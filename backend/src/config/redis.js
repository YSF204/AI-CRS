import { createClient } from "redis";

let client = null;

const initRedis = async () => {
    if (client) return client;

    const host = process.env.REDIS_HOST;
    const port = Number(process.env.REDIS_PORT);

    // Skip Redis entirely if env vars are not configured
    if (!host || isNaN(port) || port <= 0) {
        console.warn("Redis: REDIS_HOST/REDIS_PORT not configured — skipping Redis initialization. Caching will be disabled.");
        return null;
    }

    client = createClient({
        username: process.env.REDIS_UN,
        password: process.env.REDIS_PW,
        socket: { host, port },
    });

    client.on("error", (err) => console.warn("Redis Client Error:", err.message));

    try {
        await client.connect();
        console.log("Redis connected");
        return client;
    } catch (err) {
        console.warn(`Redis connection failed: ${err.message}`);
        client = null;
        return null;
    }
};

const getRedis = () => client;

export { initRedis, getRedis };