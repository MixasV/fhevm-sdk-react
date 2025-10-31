/**
 * Encryption Cache Manager
 * 
 * @packageDocumentation
 */

import type { EncryptedValue } from '../types'

/**
 * Cache entry interface
 */
interface CacheEntry {
  /**
   * Cached value
   */
  value: EncryptedValue

  /**
   * Timestamp when cached
   */
  timestamp: number

  /**
   * Time-to-live in milliseconds (optional)
   */
  ttl?: number
}

/**
 * Cache statistics interface
 */
export interface CacheStats {
  /**
   * Total cache size
   */
  size: number

  /**
   * Maximum cache size
   */
  maxSize: number

  /**
   * Hit count
   */
  hits: number

  /**
   * Miss count
   */
  misses: number

  /**
   * Hit rate percentage
   */
  hitRate: number

  /**
   * Memory usage estimate in bytes
   */
  memoryUsage: number
}

/**
 * Encryption Cache Manager
 * 
 * In-memory cache for encrypted values with TTL and size limits
 * 
 * @example
 * ```typescript
 * const cache = new EncryptionCache({ maxSize: 1000, defaultTTL: 3600000 })
 * 
 * // Set cached value
 * cache.set('user:123:balance', encryptedValue, 60000)
 * 
 * // Get cached value
 * const cached = cache.get('user:123:balance')
 * ```
 */
export class EncryptionCache {
  private cache: Map<string, CacheEntry> = new Map()
  private maxSize: number
  private defaultTTL?: number
  private hits = 0
  private misses = 0

  /**
   * Create encryption cache
   * 
   * @param options - Cache options
   * @param options.maxSize - Maximum number of entries (default: 1000)
   * @param options.defaultTTL - Default TTL in milliseconds (default: undefined = no expiry)
   */
  constructor(options: { maxSize?: number; defaultTTL?: number } = {}) {
    this.maxSize = options.maxSize ?? 1000
    this.defaultTTL = options.defaultTTL
  }

  /**
   * Set cached value
   * 
   * @param key - Cache key
   * @param value - Encrypted value to cache
   * @param ttl - Time-to-live in milliseconds (optional, uses defaultTTL if not provided)
   * 
   * @example
   * ```typescript
   * cache.set('balance:user1', encryptedValue, 60000) // Cache for 1 minute
   * ```
   */
  set(key: string, value: EncryptedValue, ttl?: number): void {
    // Evict old entries if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictOldest()
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl: ttl ?? this.defaultTTL,
    })
  }

  /**
   * Get cached value
   * 
   * @param key - Cache key
   * @returns Cached value or null if not found/expired
   * 
   * @example
   * ```typescript
   * const cached = cache.get('balance:user1')
   * if (cached) {
   *   console.log('Using cached value:', cached.handle)
   * }
   * ```
   */
  get(key: string): EncryptedValue | null {
    const entry = this.cache.get(key)

    if (entry === undefined) {
      this.misses++
      return null
    }

    // Check if expired
    if (entry.ttl !== undefined) {
      const age = Date.now() - entry.timestamp
      if (age > entry.ttl) {
        this.cache.delete(key)
        this.misses++
        return null
      }
    }

    this.hits++
    return entry.value
  }

  /**
   * Check if key exists in cache
   * 
   * @param key - Cache key
   * @returns True if key exists and not expired
   * 
   * @example
   * ```typescript
   * if (cache.has('balance:user1')) {
   *   const value = cache.get('balance:user1')
   * }
   * ```
   */
  has(key: string): boolean {
    return this.get(key) !== null
  }

  /**
   * Delete cached value
   * 
   * @param key - Cache key
   * @returns True if entry was deleted
   * 
   * @example
   * ```typescript
   * cache.delete('balance:user1')
   * ```
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * Clear all cached values
   * 
   * @example
   * ```typescript
   * cache.clear()
   * ```
   */
  clear(): void {
    this.cache.clear()
    this.hits = 0
    this.misses = 0
  }

  /**
   * Invalidate entries matching pattern
   * 
   * @param pattern - String pattern or RegExp
   * @returns Number of entries invalidated
   * 
   * @example
   * ```typescript
   * // Invalidate all balance caches
   * cache.invalidate('balance:')
   * 
   * // Invalidate with regex
   * cache.invalidate(/^user:.*:balance$/)
   * ```
   */
  invalidate(pattern?: string | RegExp): number {
    if (pattern === undefined) {
      const size = this.cache.size
      this.clear()
      return size
    }

    let count = 0
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
        count++
      }
    }

    return count
  }

  /**
   * Get cache statistics
   * 
   * @returns Cache statistics
   * 
   * @example
   * ```typescript
   * const stats = cache.getStats()
   * console.log(`Hit rate: ${stats.hitRate}%`)
   * console.log(`Memory: ${stats.memoryUsage} bytes`)
   * ```
   */
  getStats(): CacheStats {
    const totalRequests = this.hits + this.misses
    const hitRate = totalRequests > 0 ? (this.hits / totalRequests) * 100 : 0

    // Estimate memory usage (rough approximation)
    let memoryUsage = 0
    for (const entry of this.cache.values()) {
      // Each EncryptedValue has: type (string), value (Uint8Array), handle (string)
      memoryUsage += 100 // type and handle
      memoryUsage += entry.value.value.byteLength
    }

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      hitRate,
      memoryUsage,
    }
  }

  /**
   * Cleanup expired entries
   * 
   * @returns Number of entries removed
   * 
   * @example
   * ```typescript
   * const removed = cache.cleanup()
   * console.log(`Removed ${removed} expired entries`)
   * ```
   */
  cleanup(): number {
    let removed = 0
    const now = Date.now()

    for (const [key, entry] of this.cache.entries()) {
      if (entry.ttl !== undefined) {
        const age = now - entry.timestamp
        if (age > entry.ttl) {
          this.cache.delete(key)
          removed++
        }
      }
    }

    return removed
  }

  /**
   * Evict oldest entry
   */
  private evictOldest(): void {
    let oldestKey: string | null = null
    let oldestTime = Infinity

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp
        oldestKey = key
      }
    }

    if (oldestKey !== null) {
      this.cache.delete(oldestKey)
    }
  }
}
