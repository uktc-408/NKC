const Redis = require('ioredis');

const REDIS_URL = process.env.REDIS_URL || 'redis://:123456@127.0.0.1:6379';

// Create a singleton Redis client
const redis = new Redis(REDIS_URL);

redis.on('error', (error) => {
  console.error('Redis connection error:', error);
});

redis.on('connect', () => {
  console.log('Redis connected successfully');
});

module.exports = redis; 