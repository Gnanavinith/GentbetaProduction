import { createClient } from 'redis';

let redisClient;

// Enhanced Redis configuration for production
const redisConfig = {
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    reconnectStrategy: (retries) => {
      // Exponential backoff: 50ms, 100ms, 200ms, etc.
      return Math.min(retries * 50, 2000);
    },
    connectTimeout: 10000,
    keepAlive: 10000
  },
  password: process.env.REDIS_PASSWORD || undefined,
  database: parseInt(process.env.REDIS_DB) || 0,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  enableReadyCheck: true
};

// Initialize Redis client
if (process.env.REDIS_HOST || process.env.REDIS_URL) {
  const redisUrl = process.env.REDIS_URL || `redis://${redisConfig.socket.host}:${redisConfig.socket.port}`;
  
  redisClient = createClient({
    url: redisUrl,
    ...redisConfig
  });
  
  redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
  });
  
  redisClient.on('connect', () => {
    console.log('✅ Connected to Redis');
  });
  
  redisClient.on('ready', () => {
    console.log('✅ Redis client ready for operations');
  });
  
  redisClient.on('reconnecting', () => {
    console.log('🔄 Redis client reconnecting...');
  });
  
  redisClient.connect().catch((err) => {
    console.error('❌ Failed to connect to Redis:', err);
  });
} else {
  // Create a mock client if Redis is not configured
  console.log('⚠️  Redis not configured. Running without caching.');
  console.log('💡 To enable Redis caching, set REDIS_HOST in your .env file');
  
  redisClient = {
    get: async () => null,
    set: async (key, value, options) => {
      console.log(`Mock SET: ${key} (TTL: ${options?.EX || 'no expiry'})`);
      return 'OK';
    },
    del: async (keys) => {
      console.log(`Mock DEL: ${Array.isArray(keys) ? keys.join(', ') : keys}`);
      return 1;
    },
    quit: async () => {
      console.log('Mock Redis client quit');
      return 'OK';
    },
    on: () => {},
    connect: async () => {
      console.log('Mock Redis client connected');
      return 'OK';
    },
    isConnected: false
  };
}

export default redisClient;