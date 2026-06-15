const Redis = require('ioredis');
const logger = require('../utils/logger');

const REDIS_URL = process.env.REDIS_URL;
const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = process.env.REDIS_PORT || 6379;

let redisClient = null;
let isRedisAvailable = false;

// Simple in-memory fallback store
const memoryStore = new Map();
const memoryExpirations = new Map();

const memoryFallback = {
  get: async (key) => {
    // Check expiration
    if (memoryExpirations.has(key)) {
      if (Date.now() > memoryExpirations.get(key)) {
        memoryStore.delete(key);
        memoryExpirations.delete(key);
        return null;
      }
    }
    return memoryStore.get(key) || null;
  },
  set: async (key, value) => {
    memoryStore.set(key, String(value));
    return 'OK';
  },
  setex: async (key, seconds, value) => {
    memoryStore.set(key, String(value));
    memoryExpirations.set(key, Date.now() + (seconds * 1000));
    return 'OK';
  },
  del: async (key) => {
    const deleted = memoryStore.delete(key);
    memoryExpirations.delete(key);
    return deleted ? 1 : 0;
  },
  keys: async (pattern) => {
    // Basic glob pattern to regex converter (simple support for lock:*)
    const regexStr = '^' + pattern.replace(/\*/g, '.*') + '$';
    const regex = new RegExp(regexStr);
    const matched = [];
    
    // Clean expired items first
    for (const key of memoryExpirations.keys()) {
      if (Date.now() > memoryExpirations.get(key)) {
        memoryStore.delete(key);
        memoryExpirations.delete(key);
      }
    }
    
    for (const key of memoryStore.keys()) {
      if (regex.test(key)) {
        matched.push(key);
      }
    }
    return matched;
  },
  status: 'offline'
};

try {
  // Skip Redis if REDIS_URL is explicitly empty
  if (REDIS_URL === '' || REDIS_URL === undefined) {
    logger.info('No REDIS_URL configured. Using in-memory fallback.');
  } else {
    const connectionTarget = REDIS_URL || `${REDIS_HOST}:${REDIS_PORT}`;
    logger.info(`Attempting to connect to Redis on ${REDIS_URL ? 'REDIS_URL' : connectionTarget}...`);

    const redisOptions = {
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
      retryStrategy: (times) => {
        if (times > 1) {
          logger.warn('Redis connection failed. Switching to in-memory fallback client.');
          isRedisAvailable = false;
          return null;
        }
        return 1000;
      }
    };

    redisClient = REDIS_URL
      ? new Redis(REDIS_URL, redisOptions)
      : new Redis({ host: REDIS_HOST, port: parseInt(REDIS_PORT), ...redisOptions });

    redisClient.on('connect', () => {
      logger.info('Successfully connected to Redis.');
      isRedisAvailable = true;
    });

    redisClient.on('error', (err) => {
      logger.warn('Redis error occurred:', err.message);
      isRedisAvailable = false;
    });
  }
} catch (e) {
  logger.warn('Failed to initialize Redis client. Using in-memory fallback.', e);
  isRedisAvailable = false;
}

const getClient = () => {
  if (isRedisAvailable && redisClient && redisClient.status === 'ready') {
    return redisClient;
  }
  return memoryFallback;
};

module.exports = {
  getClient,
  isAvailable: () => isRedisAvailable
};
