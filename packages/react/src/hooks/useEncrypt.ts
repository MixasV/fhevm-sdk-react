/**
 * useEncrypt hook - encryption with loading states
 * 
 * @packageDocumentation
 */

import { useCallback, useState } from 'react'
import type { EncryptedType, EncryptedValue, EncryptionOptions } from '@mixaspro/core'

import { useFHEVM } from './useFHEVM'

/**
 * Encryption hook return type
 */
export interface UseEncryptReturn {
  /**
   * Encrypt a value
   */
  encrypt: (value: number | bigint | boolean, type: EncryptedType, options?: EncryptionOptions) => Promise<EncryptedValue>

  /**
   * Is encryption in progress
   */
  isEncrypting: boolean

  /**
   * Last encryption error
   */
  error: Error | null

  /**
   * Last encrypted value
   */
  data: EncryptedValue | null

  /**
   * Reset state
   */
  reset: () => void
}

/**
 * Hook for encrypting values with loading states
 * 
 * Provides encryption functionality with automatic state management for loading, errors, and results
 * 
 * @returns Encryption hook methods and state
 * 
 * @example
 * ```tsx
 * function EncryptionForm() {
 *   const { encrypt, isEncrypting, error, data } = useEncrypt()
 *   const [value, setValue] = useState('')
 *   
 *   const handleSubmit = async (e: React.FormEvent) => {
 *     e.preventDefault()
 *     try {
 *       const encrypted = await encrypt(parseInt(value), 'euint32')
 *       console.log('Encrypted:', encrypted.handle)
 *     } catch (err) {
 *       console.error('Encryption failed:', err)
 *     }
 *   }
 *   
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input value={value} onChange={(e) => setValue(e.target.value)} />
 *       <button disabled={isEncrypting}>
 *         {isEncrypting ? 'Encrypting...' : 'Encrypt'}
 *       </button>
 *       {error && <div>Error: {error.message}</div>}
 *       {data && <div>Handle: {data.handle}</div>}
 *     </form>
 *   )
 * }
 * ```
 * 
 * @example
 * ```tsx
 * function BatchEncryption() {
 *   const { encrypt, isEncrypting } = useEncrypt()
 *   
 *   const encryptMultiple = async (values: number[]) => {
 *     const promises = values.map(v => encrypt(v, 'euint32'))
 *     return Promise.all(promises)
 *   }
 *   
 *   return (
 *     <button onClick={() => encryptMultiple([1, 2, 3])} disabled={isEncrypting}>
 *       Encrypt Batch
 *     </button>
 *   )
 * }
 * ```
 */
export function useEncrypt(): UseEncryptReturn {
  const { client, isInitialized } = useFHEVM()
  
  const [isEncrypting, setIsEncrypting] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [data, setData] = useState<EncryptedValue | null>(null)

  const encrypt = useCallback(
    async (
      value: number | bigint | boolean,
      type: EncryptedType,
      options?: EncryptionOptions
    ): Promise<EncryptedValue> => {
      if (!isInitialized || client === null) {
        throw new Error('FHEVM client not initialized')
      }

      setIsEncrypting(true)
      setError(null)

      try {
        const encrypted = await client.encrypt(value, type, options)
        setData(encrypted)
        return encrypted
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Encryption failed')
        setError(error)
        throw error
      } finally {
        setIsEncrypting(false)
      }
    },
    [client, isInitialized]
  )

  const reset = useCallback(() => {
    setError(null)
    setData(null)
    setIsEncrypting(false)
  }, [])

  return {
    encrypt,
    isEncrypting,
    error,
    data,
    reset,
  }
}
