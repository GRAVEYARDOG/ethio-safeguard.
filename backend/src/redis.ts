import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || '6379'}`;

export const redisClient = createClient({
    url: redisUrl
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
