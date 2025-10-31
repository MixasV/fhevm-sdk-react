/**
 * Tests for EncryptionCache
 */

import { EncryptionCache } from '../advanced/EncryptionCache'
import type { EncryptedValue } from '../types'

const createMockEncryptedValue = (id: string): EncryptedValue => ({
  type: 'euint32',
  value: new Uint8Array([1, 2, 3, 4]),
  handle: `0x${id}`,
  metadata: { encryptedAt: Date.now() },
})

describe('EncryptionCache', () => {
  let cache: EncryptionCache

  beforeEach(() => {
    cache = new EncryptionCache()
  })

  describe('set and get', () => {
    test('should set and get cached value', () => {
      const value = createMockEncryptedValue('123')
      cache.set('key1', value)

      const retrieved = cache.get('key1')
      expect(retrieved).toEqual(value)
    })

    test('should return null for non-existent key', () => {
      const result = cache.get('non-existent')
      expect(result).toBeNull()
    })

    test('should overwrite existing key', () => {
      const value1 = createMockEncryptedValue('111')
      const value2 = createMockEncryptedValue('222')

      cache.set('key1', value1)
      cache.set('key1', value2)

      const retrieved = cache.get('key1')
      expect(retrieved).toEqual(value2)
    })
  })

  describe('TTL (Time To Live)', () => {
    test('should expire after TTL', async () => {
      const value = createMockEncryptedValue('123')
      cache.set('key1', value, 100) // 100ms TTL

      // Should exist immediately
      expect(cache.get('key1')).toEqual(value)

      // Wait for TTL to expire
      await new Promise((resolve) => setTimeout(resolve, 150))

      // Should be expired
      expect(cache.get('key1')).toBeNull()
    })

    test('should use default TTL', async () => {
      const cacheWithTTL = new EncryptionCache({ defaultTTL: 100 })
      const value = createMockEncryptedValue('123')

      cacheWithTTL.set('key1', value)

      expect(cacheWithTTL.get('key1')).toEqual(value)

      await new Promise((resolve) => setTimeout(resolve, 150))

      expect(cacheWithTTL.get('key1')).toBeNull()
    })

    test('should override default TTL with explicit TTL', async () => {
      const cacheWithTTL = new EncryptionCache({ defaultTTL: 50 })
      const value = createMockEncryptedValue('123')

      cacheWithTTL.set('key1', value, 200) // Override with 200ms

      await new Promise((resolve) => setTimeout(resolve, 100))

      // Should still exist because we used 200ms TTL
      expect(cacheWithTTL.get('key1')).toEqual(value)
    })
  })

  describe('has', () => {
    test('should return true for existing key', () => {
      const value = createMockEncryptedValue('123')
      cache.set('key1', value)

      expect(cache.has('key1')).toBe(true)
    })

    test('should return false for non-existent key', () => {
      expect(cache.has('non-existent')).toBe(false)
    })

    test('should return false for expired key', async () => {
      const value = createMockEncryptedValue('123')
      cache.set('key1', value, 50)

      expect(cache.has('key1')).toBe(true)

      await new Promise((resolve) => setTimeout(resolve, 100))

      expect(cache.has('key1')).toBe(false)
    })
  })

  describe('delete', () => {
    test('should delete existing key', () => {
      const value = createMockEncryptedValue('123')
      cache.set('key1', value)

      const deleted = cache.delete('key1')
      expect(deleted).toBe(true)
      expect(cache.get('key1')).toBeNull()
    })

    test('should return false for non-existent key', () => {
      const deleted = cache.delete('non-existent')
      expect(deleted).toBe(false)
    })
  })

  describe('clear', () => {
    test('should clear all entries', () => {
      cache.set('key1', createMockEncryptedValue('111'))
      cache.set('key2', createMockEncryptedValue('222'))
      cache.set('key3', createMockEncryptedValue('333'))

      cache.clear()

      expect(cache.get('key1')).toBeNull()
      expect(cache.get('key2')).toBeNull()
      expect(cache.get('key3')).toBeNull()
    })

    test('should reset statistics', () => {
      cache.set('key1', createMockEncryptedValue('111'))
      cache.get('key1') // hit
      cache.get('non-existent') // miss

      cache.clear()

      const stats = cache.getStats()
      expect(stats.hits).toBe(0)
      expect(stats.misses).toBe(0)
    })
  })

  describe('invalidate', () => {
    test('should invalidate by string pattern', () => {
      cache.set('user:1:balance', createMockEncryptedValue('111'))
      cache.set('user:2:balance', createMockEncryptedValue('222'))
      cache.set('contract:data', createMockEncryptedValue('333'))

      const invalidated = cache.invalidate('user:')

      expect(invalidated).toBe(2)
      expect(cache.get('user:1:balance')).toBeNull()
      expect(cache.get('user:2:balance')).toBeNull()
      expect(cache.get('contract:data')).not.toBeNull()
    })

    test('should invalidate by regex pattern', () => {
      cache.set('user:1:balance', createMockEncryptedValue('111'))
      cache.set('user:2:balance', createMockEncryptedValue('222'))
      cache.set('user:1:allowance', createMockEncryptedValue('333'))

      const invalidated = cache.invalidate(/balance$/)

      expect(invalidated).toBe(2)
      expect(cache.get('user:1:balance')).toBeNull()
      expect(cache.get('user:2:balance')).toBeNull()
      expect(cache.get('user:1:allowance')).not.toBeNull()
    })

    test('should invalidate all when no pattern provided', () => {
      cache.set('key1', createMockEncryptedValue('111'))
      cache.set('key2', createMockEncryptedValue('222'))

      const invalidated = cache.invalidate()

      expect(invalidated).toBe(2)
      expect(cache.get('key1')).toBeNull()
      expect(cache.get('key2')).toBeNull()
    })
  })

  describe('getStats', () => {
    test('should track cache statistics', () => {
      cache.set('key1', createMockEncryptedValue('111'))

      // Generate some hits and misses
      cache.get('key1') // hit
      cache.get('key1') // hit
      cache.get('non-existent') // miss

      const stats = cache.getStats()

      expect(stats.size).toBe(1)
      expect(stats.hits).toBe(2)
      expect(stats.misses).toBe(1)
      expect(stats.hitRate).toBeCloseTo(66.67, 1) // 2/3 * 100
    })

    test('should calculate hit rate correctly', () => {
      cache.set('key1', createMockEncryptedValue('111'))

      cache.get('key1') // hit
      cache.get('key2') // miss
      cache.get('key1') // hit
      cache.get('key3') // miss

      const stats = cache.getStats()
      expect(stats.hitRate).toBe(50) // 2 hits, 2 misses
    })

    test('should return 0 hit rate when no requests', () => {
      const stats = cache.getStats()
      expect(stats.hitRate).toBe(0)
    })
  })

  describe('cleanup', () => {
    test('should remove expired entries', async () => {
      cache.set('key1', createMockEncryptedValue('111'), 50)
      cache.set('key2', createMockEncryptedValue('222'), 200)
      cache.set('key3', createMockEncryptedValue('333')) // No TTL

      await new Promise((resolve) => setTimeout(resolve, 100))

      const removed = cache.cleanup()

      expect(removed).toBe(1)
      expect(cache.get('key1')).toBeNull()
      expect(cache.get('key2')).not.toBeNull()
      expect(cache.get('key3')).not.toBeNull()
    })

    test('should not remove non-expired entries', async () => {
      cache.set('key1', createMockEncryptedValue('111'), 1000)

      const removed = cache.cleanup()

      expect(removed).toBe(0)
      expect(cache.get('key1')).not.toBeNull()
    })
  })

  describe('size limits', () => {
    test('should evict oldest entry when maxSize reached', () => {
      const smallCache = new EncryptionCache({ maxSize: 3 })

      smallCache.set('key1', createMockEncryptedValue('111'))
      smallCache.set('key2', createMockEncryptedValue('222'))
      smallCache.set('key3', createMockEncryptedValue('333'))

      // This should evict key1
      smallCache.set('key4', createMockEncryptedValue('444'))

      expect(smallCache.get('key1')).toBeNull()
      expect(smallCache.get('key2')).not.toBeNull()
      expect(smallCache.get('key3')).not.toBeNull()
      expect(smallCache.get('key4')).not.toBeNull()
    })

    test('should maintain maxSize limit', () => {
      const smallCache = new EncryptionCache({ maxSize: 2 })

      smallCache.set('key1', createMockEncryptedValue('111'))
      smallCache.set('key2', createMockEncryptedValue('222'))
      smallCache.set('key3', createMockEncryptedValue('333'))

      const stats = smallCache.getStats()
      expect(stats.size).toBeLessThanOrEqual(2)
    })
  })
})
