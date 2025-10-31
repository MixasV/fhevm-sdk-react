/**
 * Encryption Svelte stores
 * 
 * @packageDocumentation
 */

import type { EncryptedType, EncryptedValue, EncryptionOptions } from '@mixaspro/core'
import { writable, type Writable } from 'svelte/store'

import { fhevmClient } from './fhevm'

/**
 * Encryption loading state
 */
export const isEncrypting: Writable<boolean> = writable(false)

/**
 * Last encryption error
 */
export const encryptionError: Writable<Error | null> = writable(null)

/**
 * Last encrypted value
 */
export const encryptedData: Writable<EncryptedValue | null> = writable(null)

/**
 * Encrypt a value
 * 
 * @param value - Value to encrypt
 * @param type - Encrypted type
 * @param options - Encryption options
 * @returns Promise resolving to encrypted value
 * 
 * @throws {Error} If encryption fails or client not initialized
 * 
 * @example
 * ```typescript
 * const encrypted = await encrypt(42, 'euint32')
 * console.log(encrypted.handle)
 * ```
 */
export async function encrypt(
  value: number | bigint | boolean,
  type: EncryptedType,
  options?: EncryptionOptions
): Promise<EncryptedValue> {
  return new Promise<EncryptedValue>((resolve, reject) => {
    const unsubscribe = fhevmClient.subscribe((client) => {
      void (async (): Promise<void> => {
        if (client === null || client === undefined) {
          reject(new Error('FHEVM client not initialized'))
          unsubscribe()
          return
        }

        if (!client.isInitialized()) {
          reject(new Error('FHEVM client not initialized'))
          unsubscribe()
          return
        }

        isEncrypting.set(true)
        encryptionError.set(null)

        try {
          const encrypted = await client.encrypt(value, type, options)
          encryptedData.set(encrypted)
          resolve(encrypted)
        } catch (error) {
          const err = error instanceof Error ? error : new Error('Encryption failed')
          encryptionError.set(err)
          reject(err)
        } finally {
          isEncrypting.set(false)
          unsubscribe()
        }
      })()
    })
  })
}

/**
 * Reset encryption state
 * 
 * @example
 * ```typescript
 * resetEncryption()
 * ```
 */
export function resetEncryption(): void {
  encryptionError.set(null)
  encryptedData.set(null)
  isEncrypting.set(false)
}
