/**
 * Vue composable for encryption operations
 * 
 * @packageDocumentation
 */

import type { EncryptedValue, EncryptedType, EncryptionOptions } from '@mixaspro/core'
import { ref } from 'vue'


import { useFHEVM } from './useFHEVM'

/**
 * Encrypt composable return type
 */
export interface UseEncryptReturn {
  /**
   * Encrypted data (ref)
   */
  data: import('vue').Ref<EncryptedValue | null>

  /**
   * Whether encryption is in progress (ref)
   */
  isEncrypting: import('vue').Ref<boolean>

  /**
   * Encryption error if any (ref)
   */
  error: import('vue').Ref<Error | null>

  /**
   * Encrypt a value
   */
  encrypt: (
    value: number | bigint | boolean,
    type: EncryptedType,
    options?: EncryptionOptions
  ) => Promise<EncryptedValue>

  /**
   * Reset state
   */
  reset: () => void
}

/**
 * Use encryption operations
 * 
 * @returns Encrypt composable
 * 
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { ref } from 'vue'
 * import { useEncrypt } from '@mixaspro/vue'
 * 
 * const value = ref(42)
 * const { data, isEncrypting, error, encrypt } = useEncrypt()
 * 
 * async function handleEncrypt() {
 *   const encrypted = await encrypt(value.value, 'euint32')
 *   console.log('Encrypted:', encrypted.handle)
 * }
 * </script>
 * 
 * <template>
 *   <input v-model.number="value" type="number" />
 *   <button @click="handleEncrypt" :disabled="isEncrypting">
 *     {{ isEncrypting ? 'Encrypting...' : 'Encrypt' }}
 *   </button>
 *   <div v-if="error">Error: {{ error.message }}</div>
 *   <div v-if="data">Handle: {{ data.handle }}</div>
 * </template>
 * ```
 */
export function useEncrypt(): UseEncryptReturn {
  const { client } = useFHEVM()
  
  const data = ref<EncryptedValue | null>(null)
  const isEncrypting = ref(false)
  const error = ref<Error | null>(null)

  /**
   * Encrypt value
   */
  async function encrypt(
    value: number | bigint | boolean,
    type: EncryptedType,
    options?: EncryptionOptions
  ): Promise<EncryptedValue> {
    if (client === null || client === undefined) {
      throw new Error('FHEVM client not initialized')
    }

    isEncrypting.value = true
    error.value = null

    try {
      const encrypted = await client.encrypt(value, type, options)
      data.value = encrypted
      return encrypted
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Encryption failed')
      throw error.value
    } finally {
      isEncrypting.value = false
    }
  }

  /**
   * Reset state
   */
  function reset(): void {
    data.value = null
    error.value = null
    isEncrypting.value = false
  }

  return {
    data,
    isEncrypting,
    error,
    encrypt,
    reset,
  }
}
