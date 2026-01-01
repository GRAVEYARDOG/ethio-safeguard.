import { createClient } from 'redis';

let redisUrl = process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || '6379'}`;

// Auto-fix for Upstash/TLS: Upstash requires rediss:// for TLS
if (redisUrl.includes('upstash.io') && !redisUrl.startsWith('rediss://')) {
    redisUrl = redisUrl.replace('redis://', 'rediss://');
}

export const redisClient = createClient({
    url: redisUrl,
    socket: {
        // If it's a secure connection, ensure we allow unauthorized for certain environments if needed, 
        // but for Upstash default is usually fine.
        tls: redisUrl.startsWith('rediss://')
    }
});

export const redisSubscriber = redisClient.duplicate();

export const connectRedis = async () => {
    try {
        await redisClient.connect();
        await redisSubscriber.connect();
        console.log(`Connected to Redis at ${redisUrl}`);
    } catch (err) {
        console.error('Redis connection error:', err);
        setTimeout(connectRedis, 5000); // Retry logic
    }
};

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisSubscriber.on('error', (err) => console.error('Redis Subscriber Error', err));
