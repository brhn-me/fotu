import { Redis } from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redis = new Redis(redisUrl);

async function flush() {
    try {
        console.log(`Connecting to Redis at ${redisUrl}...`);
        await redis.flushall();
        console.log('Redis flushed successfully.');
    } catch (err) {
        console.error('Failed to flush Redis:', err);
    } finally {
        redis.disconnect();
    }
}

flush();
