import redisClient from '../config/redis.js';

// Cache configuration
const CACHE_CONFIG = {
  PREFIX: 'genbeta:',
  TTL: {
    FORM_DEFINITION: 300,        // 5 minutes
    FORM_LIST: 120,              // 2 minutes
    USER_SESSION: 86400,         // 24 hours
    ANALYTICS: 3600,             // 1 hour
    DASHBOARD: 600,              // 10 minutes
    SUBMISSION_STATS: 1800       // 30 minutes
  },
  LAYERS: {
    L1: 'browser',    // localStorage
    L2: 'redis',      // Redis cache
    L3: 'database'    // MongoDB
  }
};

// Enhanced cache key generation
export const generateCacheKey = (entity, params = {}) => {
  const paramStr = Object.entries(params)
    .filter(([key, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${key}=${value}`)
    .join(':');
  
  return `${CACHE_CONFIG.PREFIX}${entity}${paramStr ? `:${paramStr}` : ''}`;
};

// Get from cache with performance metrics
export const getFromCache = async (key) => {
  const startTime = Date.now();
  try {
    const cached = await redisClient.get(key);
    const duration = Date.now() - startTime;
    
    if (cached) {
      console.log(`✅ Cache HIT: ${key} (${duration}ms)`);
      return JSON.parse(cached);
    } else {
      console.log(`❌ Cache MISS: ${key} (${duration}ms)`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Cache GET error for ${key}:`, error.message);
    return null;
  }
};

// Set in cache with TTL and performance metrics
export const setInCache = async (key, data, ttl = 300) => {
  const startTime = Date.now();
  try {
    const result = await redisClient.set(key, JSON.stringify(data), {
      EX: ttl
    });
    const duration = Date.now() - startTime;
    
    if (result === 'OK') {
      console.log(`✅ Cache SET: ${key} (TTL: ${ttl}s, ${duration}ms)`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Cache SET error for ${key}:`, error.message);
    return false;
  }
};

// Delete from cache with pattern matching
export const deleteFromCache = async (keyOrPattern) => {
  const startTime = Date.now();
  try {
    // Handle both single keys and patterns
    if (keyOrPattern.includes('*')) {
      // Pattern matching - get all matching keys
      const keys = await redisClient.keys(keyOrPattern);
      if (keys.length > 0) {
        const result = await redisClient.del(keys);
        const duration = Date.now() - startTime;
        console.log(`✅ Cache DEL pattern: ${keyOrPattern} (${keys.length} keys, ${duration}ms)`);
        return result;
      }
      return 0;
    } else {
      // Single key
      const result = await redisClient.del(keyOrPattern);
      const duration = Date.now() - startTime;
      console.log(`✅ Cache DEL: ${keyOrPattern} (${duration}ms)`);
      return result;
    }
  } catch (error) {
    console.error(`❌ Cache DEL error for ${keyOrPattern}:`, error.message);
    return 0;
  }
};

// Cache warming function
export const warmCache = async (key, dataLoader, ttl = 300) => {
  try {
    const cached = await getFromCache(key);
    if (!cached) {
      console.log(`🔥 Warming cache: ${key}`);
      const data = await dataLoader();
      await setInCache(key, data, ttl);
      return data;
    }
    return cached;
  } catch (error) {
    console.error(`❌ Cache warming error for ${key}:`, error.message);
    return null;
  }
};

// Cache statistics
export const getCacheStats = async () => {
  try {
    const info = await redisClient.info();
    const lines = info.split('\n');
    const stats = {};
    
    lines.forEach(line => {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        stats[key.trim()] = value.trim();
      }
    });
    
    return {
      connected_clients: stats.connected_clients,
      used_memory: stats.used_memory_human,
      keyspace_hits: stats.keyspace_hits,
      keyspace_misses: stats.keyspace_misses,
      hit_rate: stats.keyspace_hits && stats.keyspace_misses ? 
        (parseInt(stats.keyspace_hits) / (parseInt(stats.keyspace_hits) + parseInt(stats.keyspace_misses)) * 100).toFixed(2) + '%' : 'N/A'
    };
  } catch (error) {
    console.error('Cache stats error:', error.message);
    return null;
  }
};