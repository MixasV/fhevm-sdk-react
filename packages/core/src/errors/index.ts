/**
 * Error classes for FHEVM SDK
 * 
 * @packageDocumentation
 */

/**
 * Base error class for all FHEVM SDK errors
 */
export class FHEVMError extends Error {
  constructor(
    public readonly code: string,
    message: string
  ) {
    super(message)
    this.name = 'FHEVMError'
    Object.setPrototypeOf(this, FHEVMError.prototype)
  }
}

/**
 * Error thrown during initialization
 */
export class InitializationError extends FHEVMError {
  constructor(message: string) {
    super('INITIALIZATION_ERROR', message)
    this.name = 'InitializationError'
    Object.setPrototypeOf(this, InitializationError.prototype)
  }
}

/**
 * Error thrown during encryption
 */
export class EncryptionError extends FHEVMError {
  constructor(message: string) {
    super('ENCRYPTION_ERROR', message)
    this.name = 'EncryptionError'
    Object.setPrototypeOf(this, EncryptionError.prototype)
  }
}

/**
 * Error thrown during decryption
 */
export class DecryptionError extends FHEVMError {
  constructor(message: string) {
    super('DECRYPTION_ERROR', message)
    this.name = 'DecryptionError'
    Object.setPrototypeOf(this, DecryptionError.prototype)
  }
}

/**
 * Error thrown during validation
 */
export class ValidationError extends FHEVMError {
  constructor(message: string) {
    super('VALIDATION_ERROR', message)
    this.name = 'ValidationError'
    Object.setPrototypeOf(this, ValidationError.prototype)
  }
}

/**
 * Error thrown during network operations
 */
export class NetworkError extends FHEVMError {
  constructor(message: string) {
    super('NETWORK_ERROR', message)
    this.name = 'NetworkError'
    Object.setPrototypeOf(this, NetworkError.prototype)
  }
}

/**
 * Error thrown during contract operations
 */
export class ContractError extends FHEVMError {
  constructor(message: string) {
    super('CONTRACT_ERROR', message)
    this.name = 'ContractError'
    Object.setPrototypeOf(this, ContractError.prototype)
  }
}

/**
 * Error thrown during wallet operations
 */
export class WalletError extends FHEVMError {
  constructor(message: string) {
    super('WALLET_ERROR', message)
    this.name = 'WalletError'
    Object.setPrototypeOf(this, WalletError.prototype)
  }
}
