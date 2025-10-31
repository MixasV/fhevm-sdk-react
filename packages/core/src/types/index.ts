/**
 * Core type definitions for FHEVM SDK
 * 
 * @packageDocumentation
 */

import type { Eip1193Provider as EthersEip1193Provider } from 'ethers'

/**
 * EIP-1193 Provider interface (re-exported from ethers)
 */
export type Eip1193Provider = EthersEip1193Provider

/**
 * Supported encrypted types in FHEVM
 */
export type EncryptedType =
  | 'ebool'
  | 'euint8'
  | 'euint16'
  | 'euint32'
  | 'euint64'
  | 'euint128'
  | 'euint256'
  | 'eaddress'

/**
 * Encrypted value representation
 */
export interface EncryptedValue {
  readonly type: EncryptedType
  readonly value: Uint8Array
  readonly handle?: string
  readonly inputProof?: Uint8Array
  readonly metadata?: Record<string, unknown>
}

/**
 * Network information
 */
export interface NetworkInfo {
  readonly chainId: number
  readonly name: string
  readonly rpcUrl?: string
}

/**
 * Wallet connection info
 */
export interface WalletInfo {
  readonly address: string
  readonly chainId: number
  readonly provider: Eip1193Provider
}

/**
 * Public key information for FHEVM
 */
export interface PublicKeyInfo {
  readonly publicKey: string
  readonly signature?: string
}

/**
 * FHEVM client configuration
 */
export interface FHEVMConfig {
  readonly chainId: number
  readonly rpcUrl?: string
  readonly publicKeyUrl?: string
  readonly gatewayUrl?: string
  readonly aclAddress?: string
  readonly kmsVerifierAddress?: string
  readonly wasmPath?: string
}

/**
 * Encryption options
 */
export interface EncryptionOptions {
  readonly contractAddress?: string
  readonly userAddress?: string
}

/**
 * Decryption request
 */
export interface DecryptionRequest {
  readonly id: string
  readonly ciphertext: Uint8Array
  readonly requestedAt: number
  readonly status: 'pending' | 'completed' | 'failed'
}

/**
 * Decryption result
 */
export interface DecryptionResult {
  readonly requestId: string
  readonly value: bigint | boolean
  readonly completedAt: number
}

/**
 * Contract function parameters
 */
export interface ContractFunctionParams {
  readonly address: string
  readonly abi: readonly unknown[]
  readonly functionName: string
  readonly args?: readonly unknown[]
  readonly value?: bigint | string
  readonly gasLimit?: bigint | string
}

/**
 * Transaction parameters
 */
export interface TransactionParams {
  readonly to: string
  readonly data: string
  readonly value?: bigint | string
  readonly gasLimit?: bigint | string
}

/**
 * Transaction receipt
 */
export interface TransactionReceipt {
  readonly hash: string
  readonly blockNumber: number
  readonly blockHash: string
  readonly status: number
  readonly gasUsed: bigint
}

/**
 * Callback for decryption events
 */
export type DecryptionCallback = (result: DecryptionResult) => void

/**
 * Unsubscribe function
 */
export type Unsubscribe = () => void
