import { createClient } from "redis";

let client = null;

const initRedis = async () => {
    if (client) return client;

    client = createClient({
        username: process.env.REDIS_UN,
        password: process.env.REDIS_PW,
        socket: {
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT),
            connectTimeout: 3000,
            reconnectStrategy: false,
        },
    });

    client.on("error", (err) => console.log("Redis Client Error", err));

    try {
        await client.connect();
        console.log("Redis connected");
        return client;
    } catch (err) {
        console.warn(`Redis connection failed: ${err.message}`);
        if (client?.isOpen) {
            await client.close().catch(() => {});
        }
        client = null;
        return null;
    }
};

const getRedis = () => client;

export { initRedis, getRedis };
