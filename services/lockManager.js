const redis = require('../config/redis');
const logger = require('../utils/logger');

/**
 * Acquire an atomic lock for a specific date and slot
 * @param {string} dateStr 
 * @param {string} timeSlot 
 * @returns {Promise<boolean>} True if lock was acquired successfully, false if already locked
 */
const acquireLock = async (dateStr, timeSlot) => {
  const lockKey = `lock:booking:${dateStr}:${timeSlot.replace(/\s+/g, '_')}`;
  const client = redis.getClient();
  
  try {
    if (redis.isAvailable()) {
      const result = await client.set(lockKey, '1', 'EX', 600, 'NX');
      return result === 'OK';
    } else {
      const exists = await client.get(lockKey);
      if (exists) {
        return false;
      }
      await client.setex(lockKey, 600, '1');
      return true;
    }
  } catch (err) {
    logger.error(`Error acquiring lock for key ${lockKey}:`, err);
    return true;
  }
};

/**
 * Release the booking lock
 * @param {string} dateStr 
 * @param {string} timeSlot 
 */
const releaseLock = async (dateStr, timeSlot) => {
  const lockKey = `lock:booking:${dateStr}:${timeSlot.replace(/\s+/g, '_')}`;
  const client = redis.getClient();
  
  try {
    await client.del(lockKey);
  } catch (err) {
    logger.error(`Error releasing lock for key ${lockKey}:`, err);
  }
};

module.exports = {
  acquireLock,
  releaseLock
};
