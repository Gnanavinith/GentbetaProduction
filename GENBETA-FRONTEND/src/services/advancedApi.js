// Advanced API Client with Performance Optimizations
import axios from 'axios';
import { debounce } from 'lodash-es';

// API Configuration
const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  // Retry configuration
  retries: 3,
  retryDelay: 1000,
  // Cache configuration
  cache: {
    enabled: true,
    ttl: 300000, // 5 minutes
    maxSize: 100
  }
};

// Request cache storage
const requestCache = new Map();
const cacheTimestamps = new Map();

// Cache management utilities
const cacheUtils = {
  // Generate cache key
  generateKey: (url, params = {}) => {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        acc[key] = params[key];
        return acc;
      }, {});
    
    return `${url}_${JSON.stringify(sortedParams)}`;
  },

  // Check if cache entry is valid
  isValid: (key) => {
    if (!requestCache.has(key)) return false;
    
    const timestamp = cacheTimestamps.get(key);
    const ttl = API_CONFIG.cache.ttl;
    
    return Date.now() - timestamp < ttl;
  },

  // Get cached response
  get: (key) => {
    if (cacheUtils.isValid(key)) {
      return requestCache.get(key);
    }
    return null;
  },

  // Set cache entry
  set: (key, data) => {
    if (requestCache.size >= API_CONFIG.cache.maxSize) {
      // Remove oldest entry
      const firstKey = requestCache.keys().next().value;
      requestCache.delete(firstKey);
      cacheTimestamps.delete(firstKey);
    }
    
    requestCache.set(key, data);
    cacheTimestamps.set(key, Date.now());
  },

  // Clear expired entries
  clearExpired: () => {
    const now = Date.now();
    const expiredKeys = [];
    
    cacheTimestamps.forEach((timestamp, key) => {
      if (now - timestamp >= API_CONFIG.cache.ttl) {
        expiredKeys.push(key);
      }
    });
    
    expiredKeys.forEach(key => {
      requestCache.delete(key);
      cacheTimestamps.delete(key);
    });
  }
};

// Create axios instance
const apiClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: API_CONFIG.headers
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add cache bypass for mutations
    if (['post', 'put', 'patch', 'delete'].includes(config.method)) {
      config.cacheBypass = true;
    }
    
    // Add timestamp for cache invalidation
    config.timestamp = Date.now();
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with retry logic
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    
    // Handle network errors
    if (!error.response) {
      console.error('Network Error:', error.message);
      throw new Error('Network connection failed. Please check your internet connection.');
    }
    
    // Retry logic for 5xx errors
    if (error.response.status >= 500 && config.retries < API_CONFIG.retries) {
      config.retries = config.retries || 0;
      config.retries += 1;
      
      // Exponential backoff
      const delay = API_CONFIG.retryDelay * Math.pow(2, config.retries - 1);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return apiClient(config);
    }
    
    // Handle 401 Unauthorized
    if (error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Handle 403 Forbidden
    if (error.response.status === 403) {
      throw new Error('Access forbidden. You don\'t have permission to perform this action.');
    }
    
    // Handle 404 Not Found
    if (error.response.status === 404) {
      throw new Error('Resource not found.');
    }
    
    // Handle 429 Too Many Requests
    if (error.response.status === 429) {
      const retryAfter = error.response.headers['retry-after'] || 60;
      throw new Error(`Rate limit exceeded. Please try again in ${retryAfter} seconds.`);
    }
    
    return Promise.reject(error);
  }
);

// Enhanced API methods with caching
const advancedApi = {
  // GET with caching
  get: async (url, params = {}, options = {}) => {
    const { useCache = true, forceRefresh = false } = options;
    const cacheKey = cacheUtils.generateKey(url, params);
    
    // Return cached response if available and valid
    if (useCache && !forceRefresh) {
      const cachedResponse = cacheUtils.get(cacheKey);
      if (cachedResponse) {
        return { data: cachedResponse, fromCache: true };
      }
    }
    
    try {
      const response = await apiClient.get(url, { params });
      
      // Cache successful responses
      if (useCache && response.status === 200) {
        cacheUtils.set(cacheKey, response.data);
      }
      
      return { data: response.data, fromCache: false };
    } catch (error) {
      throw error;
    }
  },

  // POST with automatic cache invalidation
  post: async (url, data = {}) => {
    try {
      const response = await apiClient.post(url, data);
      
      // Invalidate related cache entries
      advancedApi.invalidateCache(url);
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // PUT with automatic cache invalidation
  put: async (url, data = {}) => {
    try {
      const response = await apiClient.put(url, data);
      
      // Invalidate related cache entries
      advancedApi.invalidateCache(url);
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // PATCH with automatic cache invalidation
  patch: async (url, data = {}) => {
    try {
      const response = await apiClient.patch(url, data);
      
      // Invalidate related cache entries
      advancedApi.invalidateCache(url);
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // DELETE with automatic cache invalidation
  delete: async (url) => {
    try {
      const response = await apiClient.delete(url);
      
      // Invalidate related cache entries
      advancedApi.invalidateCache(url);
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Invalidate cache for specific URL pattern
  invalidateCache: (urlPattern) => {
    const keysToDelete = [];
    
    requestCache.forEach((value, key) => {
      if (key.includes(urlPattern)) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => {
      requestCache.delete(key);
      cacheTimestamps.delete(key);
    });
  },

  // Clear all cache
  clearCache: () => {
    requestCache.clear();
    cacheTimestamps.clear();
  },

  // Get cache statistics
  getCacheStats: () => ({
    size: requestCache.size,
    maxSize: API_CONFIG.cache.maxSize,
    ttl: API_CONFIG.cache.ttl
  })
};

// Debounced search function
const debouncedSearch = debounce(async (searchFunction, query, delay = 300) => {
  if (!query || query.length < 2) return [];
  
  try {
    return await searchFunction(query);
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}, 300);

// Export utilities
export { advancedApi, debouncedSearch, cacheUtils, API_CONFIG };
export default advancedApi;