import { Redis } from 'ioredis';
import { logger } from '../utils/logger';

class TokenBlacklistService {
  private redis: Redis | null = null;
  private inMemoryBlacklist: Set<string> = new Set();
  private useRedis: boolean = false;

  constructor() {
    this.initializeRedis();
  }

  private async initializeRedis() {
    try {
      if (process.env.REDIS_URL) {
        this.redis = new Redis(process.env.REDIS_URL);
        
        // Test connection
        await this.redis.ping();
        this.useRedis = true;
        logger.info('Token blacklist using Redis');
      } else {
        logger.info('Token blacklist using in-memory storage (not recommended for production)');
      }
    } catch (error) {
      logger.warn('Redis connection failed, using in-memory blacklist:', error);
      this.useRedis = false;
    }
  }

  /**
   * Add token to blacklist
   */
  async addToken(token: string, expiresInSeconds: number): Promise<void> {
    try {
      if (this.useRedis && this.redis) {
        // Set token with expiration
        await this.redis.setex(`blacklist:${token}`, expiresInSeconds, '1');
      } else {
        // In-memory fallback
        this.inMemoryBlacklist.add(token);
        
        // Auto-remove after expiration
        setTimeout(() => {
          this.inMemoryBlacklist.delete(token);
        }, expiresInSeconds * 1000);
      }
      
      logger.info('Token added to blacklist');
    } catch (error) {
      logger.error('Failed to blacklist token:', error);
      // Still add to in-memory as fallback
      this.inMemoryBlacklist.add(token);
    }
  }

  /**
   * Check if token is blacklisted
   */
  async isBlacklisted(token: string): Promise<boolean> {
    try {
      if (this.useRedis && this.redis) {
        const exists = await this.redis.exists(`blacklist:${token}`);
        return exists === 1;
      } else {
        return this.inMemoryBlacklist.has(token);
      }
    } catch (error) {
      logger.error('Failed to check blacklist:', error);
      // Check in-memory as fallback
      return this.inMemoryBlacklist.has(token);
    }
  }

  /**
   * Remove token from blacklist (if needed)
   */
  async removeToken(token: string): Promise<void> {
    try {
      if (this.useRedis && this.redis) {
        await this.redis.del(`blacklist:${token}`);
      } else {
        this.inMemoryBlacklist.delete(token);
      }
      
      logger.info('Token removed from blacklist');
    } catch (error) {
      logger.error('Failed to remove token from blacklist:', error);
    }
  }

  /**
   * Clear all blacklisted tokens (use with caution)
   */
  async clearAll(): Promise<void> {
    try {
      if (this.useRedis && this.redis) {
        const keys = await this.redis.keys('blacklist:*');
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      } else {
        this.inMemoryBlacklist.clear();
      }
      
      logger.info('All tokens cleared from blacklist');
    } catch (error) {
      logger.error('Failed to clear blacklist:', error);
    }
  }

  /**
   * Get blacklist size (for monitoring)
   */
  async getSize(): Promise<number> {
    try {
      if (this.useRedis && this.redis) {
        const keys = await this.redis.keys('blacklist:*');
        return keys.length;
      } else {
        return this.inMemoryBlacklist.size;
      }
    } catch (error) {
      logger.error('Failed to get blacklist size:', error);
      return 0;
    }
  }
}

export const tokenBlacklistService = new TokenBlacklistService();
