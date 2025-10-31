/**
 * FHEVM SDK Solid.js Adapter
 * 
 * Solid.js primitives and context for FHEVM SDK
 * 
 * @packageDocumentation
 */

// Context
export * from './context'

// Primitives
export * from './primitives/createEncrypt'
export * from './primitives/createWallet'
export * from './primitives/createContract'

// Re-export core types
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
