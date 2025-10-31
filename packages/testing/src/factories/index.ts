/**
 * Factory functions for creating test data
 * 
 * @packageDocumentation
 */

import type {
  EncryptedValue,
  WalletInfo,
  NetworkInfo,
  TransactionReceipt,
} from '@mixaspro/core'

/**
 * Create mock encrypted value
 * 
 * @param overrides - Property overrides
 * @returns Mock encrypted value
 * 
 * @example
 * ```typescript
 * const encrypted = createMockEncryptedValue({
 *   type: 'euint32',
 *   handle: '0xcustom123'
 * })
 * ```
 */
export function createMockEncryptedValue(
  overrides: Partial<EncryptedValue> = {}
): EncryptedValue {
  return {
    type: 'euint32',
    value: new Uint8Array([1, 2, 3, 4]),
    handle: `0x${Math.random().toString(16).slice(2)}`,
    metadata: { encryptedAt: Date.now() },
    ...overrides,
  }
}

/**
 * Create mock wallet info
 * 
 * @param overrides - Property overrides
 * @returns Mock wallet info
 * 
 * @example
 * ```typescript
 * const wallet = createMockWalletInfo({
 *   address: '0x123...'
 * })
 * ```
 */
export function createMockWalletInfo(
  overrides: Partial<WalletInfo> = {}
): WalletInfo {
  const mockProvider: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } = {
    request: async (): Promise<unknown> => {
      return null
    },
  }
  
  return {
    address: '0x1234567890123456789012345678901234567890',
    chainId: 31337,
    provider: mockProvider as unknown as WalletInfo['provider'],
    ...overrides,
  }
}

/**
 * Create mock network info
 * 
 * @param overrides - Property overrides
 * @returns Mock network info
 * 
 * @example
 * ```typescript
 * const network = createMockNetworkInfo({
 *   chainId: 1,
 *   name: 'Mainnet'
 * })
 * ```
 */
export function createMockNetworkInfo(
  overrides: Partial<NetworkInfo> = {}
): NetworkInfo {
  return {
    chainId: 31337,
    name: 'Mock Network',
    ...overrides,
  }
}

/**
 * Create mock transaction receipt
 * 
 * @param overrides - Property overrides
 * @returns Mock transaction receipt
 * 
 * @example
 * ```typescript
 * const receipt = createMockTransactionReceipt({
 *   hash: '0x123...',
 *   status: 'success'
 * })
 * ```
 */
export function createMockTransactionReceipt(
  overrides: Partial<TransactionReceipt> = {}
): TransactionReceipt {
  return {
    hash: `0x${Math.random().toString(16).slice(2).padStart(64, '0')}`,
    blockNumber: Math.floor(Math.random() * 1000000),
    blockHash: `0x${Math.random().toString(16).slice(2).padStart(64, '0')}`,
    status: 1,
    gasUsed: BigInt(21000),
    ...overrides,
  }
}

/**
 * Create mock EIP-1193 provider
 * 
 * @returns Mock provider
 * 
 * @example
 * ```typescript
 * const provider = createMockProvider()
 * await provider.request({ method: 'eth_requestAccounts' })
 * ```
 */
export function createMockProvider(): { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } {
  return {
    request: async (args: { method: string; params?: unknown[] }): Promise<unknown> => {
      switch (args.method) {
        case 'eth_requestAccounts':
          return ['0x1234567890123456789012345678901234567890']
        case 'eth_chainId':
          return '0x7a69' // 31337
        case 'eth_blockNumber':
          return '0x1234'
        default:
          throw new Error(`Unsupported method: ${args.method}`)
      }
    },
  }
}
