/**
 * FHEVM SDK Vue Adapter
 * 
 * Vue 3 Composition API adapter for FHEVM SDK
 * 
 * @packageDocumentation
 */

// Plugin
export * from './plugin'

// Composables
export * from './composables/useFHEVM'
export * from './composables/useWallet'
export * from './composables/useEncrypt'
export * from './composables/useDecrypt'
export * from './composables/useContract'

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
