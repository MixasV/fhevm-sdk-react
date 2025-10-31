/**
 * Vue composable for decryption operations
 * 
 * @packageDocumentation
 */

import { ref } from 'vue'

import { useFHEVM } from './useFHEVM'

/**
 * Decrypt composable return type
 */
export interface UseDecryptReturn {
  /**
   * Decrypted data
   */
  data: bigint | boolean | null

  /**
   * Whether decryption is in progress
   */
  isDecrypting: boolean

  /**
   * Decryption error if any
   */
  error: Error | null

  /**
   * Decrypt a ciphertext
   */
  decrypt: (ciphertext: Uint8Array, timeout?: number) => Promise<unknown>

  /**
   * Reset state
   */
  reset: () => void
}

/**
 * Use decryption operations
 * 
 * @returns Decrypt composable
 * 
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { useDecrypt } from '@mixaspro/vue'
 * 
 * const { data, isDecrypting, error, decrypt } = useDecrypt()
 * 
 * async function handleDecrypt(ciphertext: Uint8Array) {
 *   const decrypted = await decrypt(ciphertext)
 *   console.log('Decrypted value:', decrypted)
 * }
 * </script>
 * 
 * <template>
 *   <button @click="handleDecrypt(ciphertext)" :disabled="isDecrypting">
 *     {{ isDecrypting ? 'Decrypting...' : 'Decrypt' }}
 *   </button>
 *   <div v-if="error">Error: {{ error.message }}</div>
 *   <div v-if="data !== null">Value: {{ data }}</div>
 * </template>
 * ```
 */
export function useDecrypt(): UseDecryptReturn {
  const { client } = useFHEVM()
  
  const data = ref<bigint | boolean | null>(null)
  const isDecrypting = ref(false)
  const error = ref<Error | null>(null)

  /**
   * Decrypt ciphertext
   */
  async function decrypt(ciphertext: Uint8Array | string, timeout = 30000): Promise<bigint | boolean> {
    if (client === null || client === undefined) {
      throw new Error('FHEVM client not initialized')
    }

    const instance = client.getInstance()
    if (!instance) {
      throw new Error('FHEVM instance not available')
    }

    isDecrypting.value = true
    error.value = null

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
      data.value = value as bigint | boolean
      return value as bigint | boolean
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Decryption failed')
      throw error.value
    } finally {
      isDecrypting.value = false
    }
  }

  /**
   * Reset state
   */
  function reset(): void {
    data.value = null
    error.value = null
    isDecrypting.value = false
  }

  return {
    data: data.value,
    isDecrypting: isDecrypting.value,
    error: error.value,
    decrypt,
    reset,
  }
}
