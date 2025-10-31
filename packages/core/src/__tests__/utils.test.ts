/**
 * Tests for utility functions
 */

import { isValidEncryptedType } from '../utils'

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
    })
  })
})
