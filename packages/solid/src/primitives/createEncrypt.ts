/**
 * Solid.js primitive for encryption
 * 
 * @packageDocumentation
 */

import { createSignal } from 'solid-js'
import type { EncryptedValue, EncryptedType, EncryptionOptions } from '@mixaspro/core'

import { useFHEVM } from '../context'

/**
 * Create encrypt primitive return type
 */
export interface CreateEncryptReturn {
  data: () => EncryptedValue | null
  isEncrypting: () => boolean
  error: () => Error | null
  encrypt: (value: number | bigint | boolean, type: EncryptedType, options?: EncryptionOptions) => Promise<EncryptedValue>
  reset: () => void
}

/**
 * Create encrypt primitive
 * 
 * @returns Encrypt primitive
 * 
 * @example
 * ```tsx
 * import { createEncrypt } from '@mixaspro/solid'
 * 
 * function EncryptDemo() {
 *   const { data, isEncrypting, error, encrypt } = createEncrypt()
 * 
 *   async function handleEncrypt() {
 *     const encrypted = await encrypt(42, 'euint32')
 *     console.log('Handle:', encrypted.handle)
 *   }
 * 
 *   return (
 *     <Show when={!isEncrypting()} fallback={<div>Encrypting...</div>}>
 *       <button onClick={handleEncrypt}>Encrypt</button>
 *       <Show when={data()}>
 *         <div>Handle: {data()!.handle}</div>
 *       </Show>
 *     </Show>
 *   )
 * }
 * ```
 */
export function createEncrypt(): CreateEncryptReturn {
  const { client } = useFHEVM()
  
  const [data, setData] = createSignal<EncryptedValue | null>(null)
  const [isEncrypting, setIsEncrypting] = createSignal(false)
  const [error, setError] = createSignal<Error | null>(null)

  async function encrypt(
    value: number | bigint | boolean,
    type: EncryptedType,
    options?: EncryptionOptions
  ): Promise<EncryptedValue> {
    const fhevmClient = client()
    
    if (fhevmClient === null || fhevmClient === undefined) {
      throw new Error('FHEVM client not initialized')
    }

    setIsEncrypting(true)
    setError(null)

    try {
      const encrypted = await fhevmClient.encrypt(value, type, options)
      setData(encrypted)
      return encrypted
    } catch (err) {
      const encryptError = err instanceof Error ? err : new Error('Encryption failed')
      setError(encryptError)
      throw encryptError
    } finally {
      setIsEncrypting(false)
    }
  }

  const reset = (): void => {
    setData(null)
    setError(null)
    setIsEncrypting(false)
  }

  return {
    data,
    isEncrypting,
    error,
    encrypt,
    reset,
  }
}
