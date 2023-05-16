import Redis from 'ioredis';



export const getRedisClient = () => {
  // Create Redis client
  const redisClient = new Redis({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  });

  // Handle Redis errors
  redisClient.on('error', (error) => {
    console.error('Redis error:', error);
  });

  // Handle Redis connection
  redisClient.on('connect', () => {
    console.info('🚀 Redis connected 🚀');
  });
  return redisClient;
}
