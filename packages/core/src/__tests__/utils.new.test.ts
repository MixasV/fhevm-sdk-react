/**
 * Tests for utility functions
 */

import {
  bytesToHex,
  getBitSize,
  hexToBytes,
  isValidAddress,
  isValidEncryptedType,
  retry,
  sleep,
  toBigInt,
} from '../utils'

describe('Utils', () => {
  describe('isValidEncryptedType', () => {
    test('should return true for valid types', () => {
      expect(isValidEncryptedType('ebool')).toBe(true)
      expect(isValidEncryptedType('euint8')).toBe(true)
      expect(isValidEncryptedType('euint16')).toBe(true)
      expect(isValidEncryptedType('euint32')).toBe(true)
      expect(isValidEncryptedType('euint64')).toBe(true)
      expect(isValidEncryptedType('euint128')).toBe(true)
      expect(isValidEncryptedType('euint256')).toBe(true)
    })

    test('should return false for invalid types', () => {
      expect(isValidEncryptedType('invalid')).toBe(false)
      expect(isValidEncryptedType('uint32')).toBe(false)
      expect(isValidEncryptedType('')).toBe(false)
      expect(isValidEncryptedType('euint512')).toBe(false)
      expect(isValidEncryptedType('EUINT32')).toBe(false)
    })
  })

  describe('getBitSize', () => {
    test('should return correct bit size for euint types', () => {
      expect(getBitSize('euint8')).toBe(8)
      expect(getBitSize('euint16')).toBe(16)
      expect(getBitSize('euint32')).toBe(32)
      expect(getBitSize('euint64')).toBe(64)
      expect(getBitSize('euint128')).toBe(128)
      expect(getBitSize('euint256')).toBe(256)
    })

    test('should return 1 for ebool', () => {
      expect(getBitSize('ebool')).toBe(1)
    })
  })

  describe('isValidAddress', () => {
    test('should return true for valid addresses', () => {
      expect(isValidAddress('0x0000000000000000000000000000000000000000')).toBe(true)
      expect(isValidAddress('0x1234567890123456789012345678901234567890')).toBe(true)
      expect(isValidAddress('0xAbCdEf1234567890123456789012345678901234')).toBe(true)
    })

    test('should return false for invalid addresses', () => {
      expect(isValidAddress('0x123')).toBe(false)
      expect(isValidAddress('1234567890123456789012345678901234567890')).toBe(false)
      expect(isValidAddress('0xGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG')).toBe(false)
      expect(isValidAddress('')).toBe(false)
      expect(isValidAddress('invalid')).toBe(false)
    })
  })

  describe('toBigInt', () => {
    test('should convert number to bigint', () => {
      expect(toBigInt(42)).toBe(42n)
      expect(toBigInt(0)).toBe(0n)
      expect(toBigInt(-100)).toBe(-100n)
    })

    test('should convert string to bigint', () => {
      expect(toBigInt('123')).toBe(123n)
      expect(toBigInt('0')).toBe(0n)
      expect(toBigInt('-456')).toBe(-456n)
    })

    test('should handle bigint input', () => {
      expect(toBigInt(789n)).toBe(789n)
    })

    test('should throw on invalid input', () => {
      expect(() => toBigInt('invalid')).toThrow()
      expect(() => toBigInt('12.34')).toThrow()
    })
  })

  describe('bytesToHex', () => {
    test('should convert bytes to hex with prefix', () => {
      const bytes = new Uint8Array([1, 2, 3, 255])
      expect(bytesToHex(bytes)).toBe('0x010203ff')
    })

    test('should convert bytes to hex without prefix', () => {
      const bytes = new Uint8Array([1, 2, 3, 255])
      expect(bytesToHex(bytes, false)).toBe('010203ff')
    })

    test('should handle empty array', () => {
      const bytes = new Uint8Array([])
      expect(bytesToHex(bytes)).toBe('0x')
    })

    test('should pad single digits', () => {
      const bytes = new Uint8Array([0, 1, 15, 16])
      expect(bytesToHex(bytes)).toBe('0x00010f10')
    })
  })

  describe('hexToBytes', () => {
    test('should convert hex to bytes with prefix', () => {
      const bytes = hexToBytes('0x010203ff')
      expect(bytes).toEqual(new Uint8Array([1, 2, 3, 255]))
    })

    test('should convert hex to bytes without prefix', () => {
      const bytes = hexToBytes('010203ff')
      expect(bytes).toEqual(new Uint8Array([1, 2, 3, 255]))
    })

    test('should handle empty hex', () => {
      const bytes = hexToBytes('0x')
      expect(bytes).toEqual(new Uint8Array([]))
    })

    test('should throw on odd length', () => {
      expect(() => hexToBytes('0x123')).toThrow('even length')
    })

    test('should throw on invalid characters', () => {
      expect(() => hexToBytes('0xGG')).toThrow('Invalid hex')
    })

    test('should be reversible with bytesToHex', () => {
      const original = new Uint8Array([1, 2, 3, 100, 200, 255])
      const hex = bytesToHex(original)
      const restored = hexToBytes(hex)
      expect(restored).toEqual(original)
    })
  })

  describe('sleep', () => {
    test('should sleep for specified time', async () => {
      const start = Date.now()
      await sleep(100)
      const elapsed = Date.now() - start
      
      // Allow some tolerance for timer accuracy
      expect(elapsed).toBeGreaterThanOrEqual(90)
      expect(elapsed).toBeLessThan(200)
    })

    test('should return a promise', () => {
      const result = sleep(1)
      expect(result).toBeInstanceOf(Promise)
    })
  })

  describe('retry', () => {
    test('should succeed on first try', async () => {
      let attempts = 0
      const fn = async (): Promise<string> => {
        attempts++
        return 'success'
      }

      const result = await retry(fn, 3, 10)
      expect(result).toBe('success')
      expect(attempts).toBe(1)
    })

    test('should retry on failure and eventually succeed', async () => {
      let attempts = 0
      const fn = async (): Promise<string> => {
        attempts++
        if (attempts < 3) {
          throw new Error('Not yet')
        }
        return 'success'
      }

      const result = await retry(fn, 3, 10)
      expect(result).toBe('success')
      expect(attempts).toBe(3)
    })

    test('should throw after max retries', async () => {
      let attempts = 0
      const fn = async (): Promise<string> => {
        attempts++
        throw new Error('Always fails')
      }

      await expect(retry(fn, 2, 10)).rejects.toThrow('Failed after 2 retries')
      expect(attempts).toBe(3) // Initial + 2 retries
    })

    test('should use exponential backoff', async () => {
      const delays: number[] = []
      let lastTime = Date.now()
      
      const fn = async (): Promise<string> => {
        const now = Date.now()
        if (delays.length > 0) {
          delays.push(now - lastTime)
        }
        lastTime = now
        throw new Error('Fail')
      }

      await expect(retry(fn, 2, 50)).rejects.toThrow()
      
      // First retry should be ~50ms, second ~100ms
      expect(delays[0]).toBeGreaterThanOrEqual(40)
      expect(delays[0]).toBeLessThan(80)
      expect(delays[1]).toBeGreaterThanOrEqual(90)
      expect(delays[1]).toBeLessThan(150)
    })
  })
})
