import { describe, it, expect, vi, beforeEach } from 'vitest';

// We need to mock the redis config module before importing redisHelper
vi.mock('../../config/redis.js', () => {
  let mockClient = null;
  return {
    getRedis: () => mockClient,
    __setMockClient: (client) => { mockClient = client; },
  };
});

// Now import both
import { getCacheJson, setCacheJson, delCache } from '../redisHelper.js';
import { __setMockClient } from '../../config/redis.js';

describe('redisHelper', () => {
  beforeEach(() => {
    __setMockClient(null); // reset to "no redis"
  });

  // ── Graceful degradation when Redis is unavailable ──

  describe('when Redis is not connected (null client)', () => {
    it('getCacheJson returns null', async () => {
      expect(await getCacheJson('any-key')).toBeNull();
    });

    it('setCacheJson returns false', async () => {
      expect(await setCacheJson('key', { data: 1 }, 60)).toBe(false);
    });

    it('delCache returns false', async () => {
      expect(await delCache('key')).toBe(false);
    });
  });

  // ── Happy path with a mock Redis client ──

  describe('when Redis is connected', () => {
    let mockClient;

    beforeEach(() => {
      mockClient = {
        get: vi.fn(),
        set: vi.fn(),
        del: vi.fn(),
      };
      __setMockClient(mockClient);
    });

    it('getCacheJson parses stored JSON', async () => {
      mockClient.get.mockResolvedValue(JSON.stringify({ name: 'test' }));
      const result = await getCacheJson('user:123');
      expect(result).toEqual({ name: 'test' });
      expect(mockClient.get).toHaveBeenCalledWith('user:123');
    });

    it('getCacheJson returns null for missing keys', async () => {
      mockClient.get.mockResolvedValue(null);
      expect(await getCacheJson('missing')).toBeNull();
    });

    it('getCacheJson returns null for invalid JSON', async () => {
      mockClient.get.mockResolvedValue('not-json{{{');
      expect(await getCacheJson('bad-data')).toBeNull();
    });

    it('setCacheJson stores with TTL when provided', async () => {
      mockClient.set.mockResolvedValue('OK');
      const result = await setCacheJson('key', { x: 1 }, 3600);
      expect(result).toBe(true);
      expect(mockClient.set).toHaveBeenCalledWith(
        'key',
        JSON.stringify({ x: 1 }),
        { EX: 3600 },
      );
    });

    it('setCacheJson stores without TTL when not provided', async () => {
      mockClient.set.mockResolvedValue('OK');
      await setCacheJson('key', { x: 1 });
      expect(mockClient.set).toHaveBeenCalledWith('key', JSON.stringify({ x: 1 }));
    });

    it('delCache calls client.del', async () => {
      mockClient.del.mockResolvedValue(1);
      const result = await delCache('key');
      expect(result).toBe(true);
      expect(mockClient.del).toHaveBeenCalledWith('key');
    });
  });

  // ── Error handling ──

  describe('error handling', () => {
    let brokenClient;

    beforeEach(() => {
      brokenClient = {
        get: vi.fn().mockRejectedValue(new Error('Connection refused')),
        set: vi.fn().mockRejectedValue(new Error('Connection refused')),
        del: vi.fn().mockRejectedValue(new Error('Connection refused')),
      };
      __setMockClient(brokenClient);
    });

    it('getCacheJson catches errors and returns null', async () => {
      const result = await getCacheJson('key');
      expect(result).toBeNull();
    });

    it('setCacheJson catches errors and returns false', async () => {
      const result = await setCacheJson('key', {}, 60);
      expect(result).toBe(false);
    });

    it('delCache catches errors and returns false', async () => {
      const result = await delCache('key');
      expect(result).toBe(false);
    });
  });
});
