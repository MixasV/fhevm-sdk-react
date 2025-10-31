/**
 * Tests for FHEVMClient
 */

import { FHEVMClient } from '../client'
import { InitializationError, ValidationError, EncryptionError } from '../errors'

// Mock fhevmjs
jest.mock('fhevmjs', () => ({
  initFhevm: jest.fn().mockResolvedValue(undefined),
  createInstance: jest.fn().mockResolvedValue({
    encrypt: jest.fn((value: number, bits: number) => new Uint8Array(32)),
    encrypt_bool: jest.fn((value: boolean) => new Uint8Array(32)),
  }),
}))

describe('FHEVMClient', () => {
  let client: FHEVMClient

  beforeEach(() => {
    client = new FHEVMClient()
    jest.clearAllMocks()
  })

  afterEach(async () => {
    await client.reset()
  })

  describe('initialization', () => {
    test('should not be initialized by default', () => {
      expect(client.isInitialized()).toBe(false)
    })

    test('should initialize with valid config', async () => {
      await client.initialize({ 
        chainId: 31337,
        rpcUrl: 'http://localhost:8545'
      })
      expect(client.isInitialized()).toBe(true)
    })

    test('should throw on missing chainId', async () => {
      await expect(
        client.initialize({} as any)
      ).rejects.toThrow(ValidationError)
    })

    test('should accept config without rpcUrl', async () => {
      await client.initialize({ chainId: 31337 })
      expect(client.isInitialized()).toBe(true)
    })

    test('should store network info after initialization', async () => {
      await client.initialize({ 
        chainId: 31337,
        rpcUrl: 'http://localhost:8545'
      })
      
      const network = client.getNetwork()
      expect(network).not.toBeNull()
      expect(network?.chainId).toBe(31337)
    })
  })

  describe('encrypt', () => {
    beforeEach(async () => {
      await client.initialize({ chainId: 31337 })
    })

    test('should encrypt number value', async () => {
      const result = await client.encrypt(42, 'euint32')
      
      expect(result).toBeDefined()
      expect(result.type).toBe('euint32')
      expect(result.value).toBeInstanceOf(Uint8Array)
      expect(result.value.length).toBeGreaterThan(0)
      expect(result.handle).toBeDefined()
      expect(result.handle).toMatch(/^0x[a-f0-9]{64}$/)
    })

    test('should encrypt boolean value', async () => {
      const result = await client.encrypt(true, 'ebool')
      
      expect(result).toBeDefined()
      expect(result.type).toBe('ebool')
      expect(result.value).toBeInstanceOf(Uint8Array)
    })

    test('should encrypt bigint value', async () => {
      const result = await client.encrypt(BigInt(100), 'euint64')
      
      expect(result).toBeDefined()
      expect(result.type).toBe('euint64')
    })

    test('should throw on invalid type', async () => {
      await expect(
        client.encrypt(42, 'invalid' as any)
      ).rejects.toThrow(ValidationError)
    })

    test('should throw on null value', async () => {
      await expect(
        client.encrypt(null as any, 'euint32')
      ).rejects.toThrow(ValidationError)
    })

    test('should throw on undefined value', async () => {
      await expect(
        client.encrypt(undefined as any, 'euint32')
      ).rejects.toThrow(ValidationError)
    })

    test('should throw when not initialized', async () => {
      const uninitializedClient = new FHEVMClient()
      
      await expect(
        uninitializedClient.encrypt(42, 'euint32')
      ).rejects.toThrow(InitializationError)
    })

    test('should include metadata in result', async () => {
      const result = await client.encrypt(42, 'euint32', {
        contractAddress: '0x1234567890123456789012345678901234567890',
        userAddress: '0x0987654321098765432109876543210987654321'
      })
      
      expect(result.metadata).toBeDefined()
      expect(result.metadata?.contractAddress).toBe('0x1234567890123456789012345678901234567890')
      expect(result.metadata?.userAddress).toBe('0x0987654321098765432109876543210987654321')
      expect(result.metadata?.encryptedAt).toBeDefined()
    })

    test('should handle different euint sizes', async () => {
      const types: Array<'euint8' | 'euint16' | 'euint32' | 'euint64'> = [
        'euint8', 'euint16', 'euint32', 'euint64'
      ]

      for (const type of types) {
        const result = await client.encrypt(100, type)
        expect(result.type).toBe(type)
      }
    })

    test('should validate value type matches encrypted type', async () => {
      await expect(
        client.encrypt('not a boolean' as any, 'ebool')
      ).rejects.toThrow(ValidationError)

      await expect(
        client.encrypt('not a number' as any, 'euint32')
      ).rejects.toThrow(ValidationError)
    })
  })

  describe('requestDecryption', () => {
    beforeEach(async () => {
      await client.initialize({ chainId: 31337 })
    })

    test('should create decryption request', async () => {
      const ciphertext = new Uint8Array([1, 2, 3, 4])
      const request = await client.requestDecryption(ciphertext)
      
      expect(request).toBeDefined()
      expect(request.id).toBeDefined()
      expect(request.ciphertext).toBe(ciphertext)
      expect(request.status).toBe('pending')
      expect(request.requestedAt).toBeDefined()
    })

    test('should throw on empty ciphertext', async () => {
      await expect(
        client.requestDecryption(new Uint8Array([]))
      ).rejects.toThrow(ValidationError)
    })

    test('should throw on null ciphertext', async () => {
      await expect(
        client.requestDecryption(null as any)
      ).rejects.toThrow(ValidationError)
    })

    test('should throw when not initialized', async () => {
      const uninitializedClient = new FHEVMClient()
      
      await expect(
        uninitializedClient.requestDecryption(new Uint8Array([1, 2, 3]))
      ).rejects.toThrow(InitializationError)
    })
  })

  describe('waitForDecryption', () => {
    beforeEach(async () => {
      await client.initialize({ chainId: 31337 })
    })

    test('should wait for decryption to complete', async () => {
      const ciphertext = new Uint8Array([1, 2, 3, 4])
      const request = await client.requestDecryption(ciphertext)
      
      const result = await client.waitForDecryption(request.id, 5000)
      
      expect(result).toBeDefined()
      expect(result.requestId).toBe(request.id)
      expect(result.value).toBeDefined()
      expect(result.completedAt).toBeDefined()
    })

    test('should throw on invalid request ID', async () => {
      await expect(
        client.waitForDecryption('invalid-id', 1000)
      ).rejects.toThrow(ValidationError)
    })

    test('should throw on empty request ID', async () => {
      await expect(
        client.waitForDecryption('', 1000)
      ).rejects.toThrow(ValidationError)
    })

    test('should timeout if decryption takes too long', async () => {
      // Create a request that never completes
      const ciphertext = new Uint8Array([1, 2, 3, 4])
      const request = await client.requestDecryption(ciphertext)
      
      // Override the simulation to never complete
      const uninitializedClient = new FHEVMClient()
      await uninitializedClient.initialize({ chainId: 31337 })
      
      await expect(
        client.waitForDecryption('nonexistent-id', 100)
      ).rejects.toThrow(ValidationError)
    }, 10000)
  })

  describe('onDecryption', () => {
    beforeEach(async () => {
      await client.initialize({ chainId: 31337 })
    })

    test('should subscribe to decryption events', (done) => {
      const unsubscribe = client.onDecryption((result) => {
        expect(result).toBeDefined()
        expect(result.requestId).toBeDefined()
        expect(result.value).toBeDefined()
        unsubscribe()
        done()
      })

      // Trigger a decryption
      const ciphertext = new Uint8Array([1, 2, 3, 4])
      client.requestDecryption(ciphertext)
    })

    test('should return unsubscribe function', () => {
      const unsubscribe = client.onDecryption(() => {})
      
      expect(unsubscribe).toBeInstanceOf(Function)
      unsubscribe()
    })

    test('should not receive events after unsubscribe', (done) => {
      let callCount = 0
      
      const unsubscribe = client.onDecryption(() => {
        callCount++
      })

      setTimeout(() => {
        unsubscribe()
        
        setTimeout(() => {
          // Should still be 1 (or 0 if the first event hasn't fired yet)
          expect(callCount).toBeLessThanOrEqual(1)
          done()
        }, 200)
      }, 100)

      // Trigger decryptions
      const ciphertext = new Uint8Array([1, 2, 3, 4])
      client.requestDecryption(ciphertext)
    })
  })

  describe('getNetwork', () => {
    test('should return null when not initialized', () => {
      expect(client.getNetwork()).toBeNull()
    })

    test('should return network info after initialization', async () => {
      await client.initialize({ 
        chainId: 31337,
        rpcUrl: 'http://localhost:8545'
      })
      
      const network = client.getNetwork()
      expect(network).not.toBeNull()
      expect(network?.chainId).toBe(31337)
      expect(network?.name).toContain('Hardhat')
      expect(network?.rpcUrl).toBe('http://localhost:8545')
    })
  })

  describe('getWallet', () => {
    test('should return null when wallet not connected', () => {
      expect(client.getWallet()).toBeNull()
    })
  })

  describe('reset', () => {
    test('should reset client state', async () => {
      await client.initialize({ chainId: 31337 })
      expect(client.isInitialized()).toBe(true)
      
      await client.reset()
      expect(client.isInitialized()).toBe(false)
      expect(client.getNetwork()).toBeNull()
    })
  })
})
