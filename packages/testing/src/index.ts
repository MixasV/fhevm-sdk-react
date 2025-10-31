/**
 * FHEVM SDK Testing Utilities
 * 
 * Testing utilities, mocks, and fixtures for FHEVM SDK
 * 
 * @packageDocumentation
 */

// Mock client
export * from './mock/MockFHEVMClient'

// Factories
export * from './factories'

// Utilities
export * from './utils/waitFor'

// Re-export core types for convenience
export type {
  FHEVMConfig,
  EncryptedType,
  EncryptedValue,
  NetworkInfo,
  WalletInfo,
  TransactionReceipt,
  ContractFunctionParams,
} from '@mixaspro/core'

// Version
export const VERSION = '1.0.0'
