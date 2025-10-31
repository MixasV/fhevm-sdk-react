/**
 * Tests for FHEVMClient
 */

import { FHEVMClient } from '../client'

describe('FHEVMClient', () => {
  let client: FHEVMClient

  beforeEach(() => {
    client = new FHEVMClient()
  })

  describe('initialization', () => {
    test('should not be initialized by default', () => {
      expect(client.isInitialized()).toBe(false)
    })

    test('should initialize with valid config', async () => {
      await client.initialize({ chainId: 31337 })
      expect(client.isInitialized()).toBe(true)
    })

    test('should accept empty config', async () => {
      await client.initialize({})
      expect(client.isInitialized()).toBe(true)
    })
  })
})
