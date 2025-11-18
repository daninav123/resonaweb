import { Redis } from 'ioredis';
import { logger } from '../utils/logger';

class CacheService {
  private redis: Redis | null = null;
  private useCache: boolean = false;
  private defaultTTL: number = 300; // 5 minutes

  constructor() {
    this.initializeRedis();
  }

  private async initializeRedis() {
    try {
      if (process.env.REDIS_URL) {
        this.redis = new Redis(process.env.REDIS_URL);
        
        // Test connection
        await this.redis.ping();
        this.useCache = true;
        logger.info('Cache service using Redis');
      } else {
        logger.info('Cache service disabled (Redis not configured)');
      }
    } catch (error) {
      logger.warn('Redis connection failed for cache:', error);
      this.useCache = false;
    }
  }

  /**
   * Get item from cache
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.useCache || !this.redis) return null;
    
    try {
      const data = await this.redis.get(key);
      if (data) {
        logger.debug(`Cache hit: ${key}`);
        return JSON.parse(data);
      }
      logger.debug(`Cache miss: ${key}`);
      return null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set item in cache
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    if (!this.useCache || !this.redis) return;
    
    try {
      const serialized = JSON.stringify(value);
      const expiry = ttl || this.defaultTTL;
      
      await this.redis.setex(key, expiry, serialized);
      logger.debug(`Cache set: ${key} (TTL: ${expiry}s)`);
    } catch (error) {
      logger.error('Cache set error:', error);
    }
  }

  /**
   * Delete item from cache
   */
  async del(key: string | string[]): Promise<void> {
    if (!this.useCache || !this.redis) return;
    
    try {
      const keys = Array.isArray(key) ? key : [key];
      if (keys.length > 0) {
        await this.redis.del(...keys);
        logger.debug(`Cache delete: ${keys.join(', ')}`);
      }
    } catch (error) {
      logger.error('Cache delete error:', error);
    }
  }

  /**
   * Clear cache by pattern
   */
  async clearPattern(pattern: string): Promise<void> {
    if (!this.useCache || !this.redis) return;
    
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        logger.debug(`Cache cleared: ${pattern} (${keys.length} keys)`);
      }
    } catch (error) {
      logger.error('Cache clear error:', error);
    }
  }

  /**
   * Clear all cache
   */
  async flushAll(): Promise<void> {
    if (!this.useCache || !this.redis) return;
    
    try {
      await this.redis.flushall();
      logger.info('All cache cleared');
    } catch (error) {
      logger.error('Cache flush error:', error);
    }
  }

  /**
   * Cache wrapper function
   */
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }
    
    // Fetch data
    const data = await fetchFn();
    
    // Store in cache
    await this.set(key, data, ttl);
    
    return data;
  }

  /**
   * Invalidate multiple cache patterns
   */
  async invalidate(patterns: string[]): Promise<void> {
    for (const pattern of patterns) {
      await this.clearPattern(pattern);
    }
  }
}

export const cacheService = new CacheService();

// Cache key generators
export const cacheKeys = {
  // Products
  product: (id: string) => `product:${id}`,
  products: (page: number, limit: number, filters?: string) => 
    `products:${page}:${limit}:${filters || 'all'}`,
  productsByCategory: (categoryId: string) => `products:category:${categoryId}`,
  
  // Categories
  categories: () => 'categories:all',
  category: (id: string) => `category:${id}`,
  
  // Orders
  order: (id: string) => `order:${id}`,
  userOrders: (userId: string) => `orders:user:${userId}`,
  
  // Users
  user: (id: string) => `user:${id}`,
  userByEmail: (email: string) => `user:email:${email}`,
  
  // Cart
  userCart: (userId: string) => `cart:user:${userId}`,
  
  // Stats
  adminStats: () => 'stats:admin',
  productStats: (productId: string) => `stats:product:${productId}`,
};
