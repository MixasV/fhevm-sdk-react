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
 * @param ciphertext - Ciphertext to decrypt (Uint8Array or string handle)
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
  ciphertext: Uint8Array | string,
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

        const instance = client.getInstance()
        if (!instance) {
          reject(new Error('FHEVM instance not available'))
          unsubscribe()
          return
        }

        isDecrypting.set(true)
        decryptionError.set(null)

        try {
          // Use relayer-sdk publicDecrypt
          const handle = typeof ciphertext === 'string' ? ciphertext : ciphertext
          const results = await instance.publicDecrypt([handle])
          
          // Get first result
          const firstKey = Object.keys(results)[0]
          if (!firstKey) {
            throw new Error('No decryption result returned')
          }
          
          const value = results[firstKey]
          decryptedData.set(value as bigint | boolean)
          resolve(value as bigint | boolean)
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
