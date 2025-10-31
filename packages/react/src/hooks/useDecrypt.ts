/**
 * useDecrypt hook - decryption with polling and loading states
 * 
 * @packageDocumentation
 */

import { useCallback, useState } from 'react'

import { useFHEVM } from './useFHEVM'

/**
 * Decryption hook return type
 */
export interface UseDecryptReturn {
  /**
   * Decrypt a ciphertext
   */
  decrypt: (ciphertext: Uint8Array, timeout?: number) => Promise<unknown>

  /**
   * Is decryption in progress
   */
  isDecrypting: boolean

  /**
   * Last decryption error
   */
  error: Error | null

  /**
   * Last decrypted value
   */
  data: bigint | boolean | null

  /**
   * Reset state
   */
  reset: () => void
}

/**
 * Hook for decrypting values with loading states and polling
 * 
 * Provides decryption functionality with automatic state management for loading, errors, and results
 * 
 * @returns Decryption hook methods and state
 * 
 * @example
 * ```tsx
 * function DecryptionView({ ciphertext }: { ciphertext: Uint8Array }) {
 *   const { decrypt, isDecrypting, error, data } = useDecrypt()
 *   
 *   useEffect(() => {
 *     decrypt(ciphertext, 30000).catch(console.error)
 *   }, [ciphertext])
 *   
 *   if (isDecrypting) return <div>Decrypting...</div>
 *   if (error) return <div>Error: {error.message}</div>
 *   if (data !== null) return <div>Value: {data}</div>
 *   
 *   return null
 * }
 * ```
 * 
 * @example
 * ```tsx
 * function DecryptButton({ ciphertext }: { ciphertext: Uint8Array }) {
 *   const { decrypt, isDecrypting, data } = useDecrypt()
 *   
 *   const handleDecrypt = async () => {
 *     try {
 *       const value = await decrypt(ciphertext)
 *       console.log('Decrypted value:', value)
 *     } catch (err) {
 *       console.error('Decryption failed:', err)
 *     }
 *   }
 *   
 *   return (
 *     <div>
 *       <button onClick={handleDecrypt} disabled={isDecrypting}>
 *         {isDecrypting ? 'Decrypting...' : 'Decrypt'}
 *       </button>
 *       {data !== null && <p>Result: {String(data)}</p>}
 *     </div>
 *   )
 * }
 * ```
 */
export function useDecrypt(): UseDecryptReturn {
  const { client, isInitialized } = useFHEVM()
  
  const [isDecrypting, setIsDecrypting] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [data, setData] = useState<bigint | boolean | null>(null)

  const decrypt = useCallback(
    async (ciphertext: Uint8Array | string, timeout = 30000): Promise<bigint | boolean> => {
      if (!isInitialized || client === null) {
        throw new Error('FHEVM client not initialized')
      }

      const instance = client.getInstance()
      if (!instance) {
        throw new Error('FHEVM instance not available')
      }

      setIsDecrypting(true)
      setError(null)

      try {
        // publicDecrypt expects array of handles (string | Uint8Array)
        const results = await instance.publicDecrypt([ciphertext])
        
        // Results is an object with handles as keys
        const handles = Object.keys(results)
        if (handles.length === 0) {
          throw new Error('No decryption result returned')
        }
        
        const value = results[handles[0]]
        setData(value as bigint | boolean)
        return value as bigint | boolean
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Decryption failed')
        setError(error)
        throw error
      } finally {
        setIsDecrypting(false)
      }
    },
    [client, isInitialized]
  )

  const reset = useCallback(() => {
    setError(null)
    setData(null)
    setIsDecrypting(false)
  }, [])

  return {
    decrypt,
    isDecrypting,
    error,
    data,
    reset,
  }
}
