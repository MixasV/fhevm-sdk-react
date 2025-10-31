/**
 * Decryption Svelte stores
 * 
 * @packageDocumentation
 */

import { writable, type Writable } from 'svelte/store'

import { fhevmClient } from './fhevm'

/**
 * Decryption loading state
 */
export const isDecrypting: Writable<boolean> = writable(false)

/**
 * Last decryption error
 */
export const decryptionError: Writable<Error | null> = writable(null)

/**
 * Last decrypted value
 */
export const decryptedData: Writable<bigint | boolean | null> = writable(null)

/**
 * Decrypt a ciphertext
 * 
 * @param ciphertext - Ciphertext to decrypt
 * @param timeout - Timeout in milliseconds (default: 30000)
 * @returns Promise resolving to decrypted value
 * 
 * @throws {Error} If decryption fails or client not initialized
 * 
 * @example
 * ```typescript
 * const value = await decrypt(ciphertext, 30000)
 * console.log('Decrypted:', value)
 * ```
 */
export async function decrypt(
  ciphertext: Uint8Array,
  timeout = 30000
): Promise<bigint | boolean> {
  return new Promise<bigint | boolean>((resolve, reject) => {
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

        isDecrypting.set(true)
        decryptionError.set(null)

        try {
          // Request decryption
          const request = await client.requestDecryption(ciphertext)
          
          // Wait for result
          const result = await client.waitForDecryption(request.id, timeout)
          
          decryptedData.set(result.value)
          resolve(result.value)
        } catch (error) {
          const err = error instanceof Error ? error : new Error('Decryption failed')
          decryptionError.set(err)
          reject(err)
        } finally {
          isDecrypting.set(false)
          unsubscribe()
        }
      })()
    })
  })
}

/**
 * Reset decryption state
 * 
 * @example
 * ```typescript
 * resetDecryption()
 * ```
 */
export function resetDecryption(): void {
  decryptionError.set(null)
  decryptedData.set(null)
  isDecrypting.set(false)
}
