/**
 * FHEVM SDK Angular Adapter
 * 
 * Angular services and module for FHEVM SDK
 * 
 * @packageDocumentation
 */

// Module
export * from './module'

// Services
export * from './services/fhevm.service'

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
