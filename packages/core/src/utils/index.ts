/**
 * Utility functions for FHEVM SDK
 * 
 * @packageDocumentation
 */

import type { EncryptedType } from '../types'

export * from './retry'

/**
 * Check if value is a valid encrypted type
 * 
 * @param type - Type to check
 * @returns True if type is valid
 * 
 * @example
 * ```typescript
 * isValidEncryptedType('euint32') // true
 * isValidEncryptedType('invalid') // false
 * ```
 */
export function isValidEncryptedType(type: string): type is EncryptedType {
  const validTypes: EncryptedType[] = [
    'ebool',
    'euint8',
    'euint16',
    'euint32',
    'euint64',
    'euint128',
    'euint256',
    'eaddress',
  ]
  return validTypes.includes(type as EncryptedType)
}

/**
 * Get the bit size from an encrypted type
 * 
 * @param type - The encrypted type
 * @returns Bit size (8, 16, 32, etc.) or 1 for ebool
 * 
 * @throws {Error} If type is invalid
 * 
 * @example
 * ```typescript
 * getBitSize('euint32') // 32
 * getBitSize('ebool') // 1
 * ```
 */
export function getBitSize(type: EncryptedType): number {
  if (type === 'ebool') {
    return 1
  }
  
  const match = type.match(/^euint(\d+)$/)
  if (!match || !match[1]) {
    throw new Error(`Invalid encrypted type: ${type}`)
  }
  
  return parseInt(match[1], 10)
}

/**
 * Validate an Ethereum address
 * 
 * @param address - Address to validate
 * @returns True if address is valid
 * 
 * @example
 * ```typescript
 * isValidAddress('0x1234...') // true
 * isValidAddress('invalid') // false
 * ```
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

/**
 * Convert value to bigint safely
 * 
 * @param value - Value to convert
 * @returns BigInt value
 * 
 * @throws {Error} If conversion fails
 * 
 * @example
 * ```typescript
 * toBigInt(42) // 42n
 * toBigInt('100') // 100n
 * ```
 */
export function toBigInt(value: number | string | bigint): bigint {
  try {
    return BigInt(value)
  } catch (error) {
    throw new Error(`Failed to convert to BigInt: ${value}`)
  }
}

/**
 * Format bytes as hex string
 * 
 * @param bytes - Bytes to format
 * @param prefix - Whether to include 0x prefix
 * @returns Hex string
 * 
 * @example
 * ```typescript
 * bytesToHex(new Uint8Array([1, 2, 3])) // '0x010203'
 * ```
 */
export function bytesToHex(bytes: Uint8Array, prefix: boolean = true): string {
  const hex = Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
  return prefix ? `0x${hex}` : hex
}

/**
 * Parse hex string to bytes
 * 
 * @param hex - Hex string to parse
 * @returns Byte array
 * 
 * @throws {Error} If hex string is invalid
 * 
 * @example
 * ```typescript
 * hexToBytes('0x010203') // Uint8Array([1, 2, 3])
 * ```
 */
export function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex
  
  if (cleanHex.length % 2 !== 0) {
    throw new Error('Hex string must have even length')
  }
  
  if (!/^[0-9a-fA-F]*$/.test(cleanHex)) {
    throw new Error('Invalid hex string')
  }
  
  const bytes = new Uint8Array(cleanHex.length / 2)
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.substring(i, i + 2), 16)
  }
  
  return bytes
}

/**
 * Sleep for specified milliseconds
 * 
 * @param ms - Milliseconds to sleep
 * @returns Promise that resolves after delay
 * 
 * @example
 * ```typescript
 * await sleep(1000) // Wait 1 second
 * ```
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Retry an async function with exponential backoff
 * 
 * @param fn - Function to retry
 * @param maxRetries - Maximum number of retries
 * @param baseDelay - Base delay in milliseconds
 * @returns Promise with function result
 * 
 * @throws {Error} If all retries fail
 * 
 * @example
 * ```typescript
 * const result = await retry(
 *   () => fetchData(),
 *   3,
 *   1000
 * )
 * ```
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt)
        await sleep(delay)
      }
    }
  }
  
  throw new Error(
    `Failed after ${maxRetries} retries: ${lastError?.message || 'Unknown error'}`
  )
}
