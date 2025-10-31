/**
 * Solid.js primitive for decryption
 * 
 * @packageDocumentation
 */

import { createSignal } from 'solid-js'

import { useFHEVM } from '../context'

/**
 * Create decrypt primitive return type
 */
export interface CreateDecryptReturn {
  data: () => bigint | boolean | null
  isDecrypting: () => boolean
  error: () => Error | null
  decrypt: (ciphertext: Uint8Array | string, timeout?: number) => Promise<bigint | boolean>
  reset: () => void
}

/**
 * Create decrypt primitive
 * 
 * @returns Decrypt primitive
 * 
 * @example
 * ```tsx
 * import { createDecrypt } from '@mixaspro/solid'
 * 
 * function DecryptDemo(props: { ciphertext: Uint8Array }) {
 *   const { data, isDecrypting, error, decrypt } = createDecrypt()
 * 
 *   async function handleDecrypt() {
 *     const value = await decrypt(props.ciphertext)
 *     console.log('Decrypted:', value)
 *   }
 * 
 *   return (
 *     <Show when={!isDecrypting()} fallback={<div>Decrypting...</div>}>
 *       <button onClick={handleDecrypt}>Decrypt</button>
 *       <Show when={data() !== null}>
 *         <div>Value: {String(data())}</div>
 *       </Show>
 *       <Show when={error()}>
 *         <div>Error: {error()!.message}</div>
 *       </Show>
 *     </Show>
 *   )
 * }
 * ```
 */
export function createDecrypt(): CreateDecryptReturn {
  const { client } = useFHEVM()
  
  const [data, setData] = createSignal<bigint | boolean | null>(null)
  const [isDecrypting, setIsDecrypting] = createSignal(false)
  const [error, setError] = createSignal<Error | null>(null)

  async function decrypt(
    ciphertext: Uint8Array | string,
    timeout = 30000
  ): Promise<bigint | boolean> {
    const fhevmClient = client()
    
    if (fhevmClient === null || fhevmClient === undefined) {
      throw new Error('FHEVM client not initialized')
    }

    const instance = fhevmClient.getInstance()
    if (!instance) {
      throw new Error('FHEVM instance not available')
    }

    setIsDecrypting(true)
    setError(null)

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
      setData(value as bigint | boolean)
      return value as bigint | boolean
    } catch (err) {
      const decryptError = err instanceof Error ? err : new Error('Decryption failed')
      setError(decryptError)
      throw decryptError
    } finally {
      setIsDecrypting(false)
    }
  }

  const reset = (): void => {
    setData(null)
    setError(null)
    setIsDecrypting(false)
  }

  return {
    data,
    isDecrypting,
    error,
    decrypt,
    reset,
  }
}
