/**
 * Tests for error classes
 */

import {
  FHEVMError,
  InitializationError,
  EncryptionError,
  DecryptionError,
  ValidationError,
} from '../errors'

describe('Error classes', () => {
  describe('FHEVMError', () => {
    test('should create error with code and message', () => {
      const error = new FHEVMError('TEST_ERROR', 'Test error message')
      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(FHEVMError)
      expect(error.code).toBe('TEST_ERROR')
      expect(error.message).toBe('Test error message')
      expect(error.name).toBe('FHEVMError')
    })
  })

  describe('InitializationError', () => {
    test('should create initialization error', () => {
      const error = new InitializationError('Init failed')
      expect(error).toBeInstanceOf(FHEVMError)
      expect(error).toBeInstanceOf(InitializationError)
      expect(error.code).toBe('INITIALIZATION_ERROR')
      expect(error.message).toBe('Init failed')
      expect(error.name).toBe('InitializationError')
    })
  })

  describe('EncryptionError', () => {
    test('should create encryption error', () => {
      const error = new EncryptionError('Encryption failed')
      expect(error).toBeInstanceOf(FHEVMError)
      expect(error).toBeInstanceOf(EncryptionError)
      expect(error.code).toBe('ENCRYPTION_ERROR')
      expect(error.message).toBe('Encryption failed')
      expect(error.name).toBe('EncryptionError')
    })
  })

  describe('DecryptionError', () => {
    test('should create decryption error', () => {
      const error = new DecryptionError('Decryption failed')
      expect(error).toBeInstanceOf(FHEVMError)
      expect(error).toBeInstanceOf(DecryptionError)
      expect(error.code).toBe('DECRYPTION_ERROR')
      expect(error.message).toBe('Decryption failed')
      expect(error.name).toBe('DecryptionError')
    })
  })

  describe('ValidationError', () => {
    test('should create validation error', () => {
      const error = new ValidationError('Validation failed')
      expect(error).toBeInstanceOf(FHEVMError)
      expect(error).toBeInstanceOf(ValidationError)
      expect(error.code).toBe('VALIDATION_ERROR')
      expect(error.message).toBe('Validation failed')
      expect(error.name).toBe('ValidationError')
    })
  })
})
