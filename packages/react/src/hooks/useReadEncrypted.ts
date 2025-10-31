/**
 * useReadEncrypted hook - read encrypted contract state
 * 
 * @packageDocumentation
 */

import { useCallback, useEffect, useState } from 'react'
import type { ContractFunctionParams } from '@mixaspro/core'

import { useFHEVM } from './useFHEVM'

/**
 * Read encrypted hook params
 */
export interface UseReadEncryptedParams extends Omit<ContractFunctionParams, 'args'> {
  /**
   * Function arguments
   */
  args?: readonly unknown[]

  /**
   * Enable automatic reading on mount/params change
   * @default true
   */
  enabled?: boolean

  /**
   * Polling interval in milliseconds (0 = no polling)
   * @default 0
   */
  pollingInterval?: number
}

/**
 * Read encrypted hook return type
 */
export interface UseReadEncryptedReturn<T = unknown> {
  /**
   * Read function result
   */
  data: T | null

  /**
   * Is reading in progress
   */
  isLoading: boolean

  /**
   * Read error
   */
  error: Error | null

  /**
   * Manually trigger read
   */
  refetch: () => Promise<T>

  /**
   * Reset state
   */
  reset: () => void
}

/**
 * Hook for reading encrypted contract state
 * 
 * Provides functionality to read from smart contracts with automatic state management and optional polling
 * 
 * @param params - Read parameters
 * @returns Read hook methods and state
 * 
 * @example
 * ```tsx
 * function BalanceView({ address }: { address: string }) {
 *   const { data, isLoading, error } = useReadEncrypted({
 *     address: '0x...',
 *     abi: tokenABI,
 *     functionName: 'balanceOf',
 *     args: [address],
 *   })
 *   
 *   if (isLoading) return <div>Loading...</div>
 *   if (error) return <div>Error: {error.message}</div>
 *   if (data) return <div>Balance: {String(data)}</div>
 *   
 *   return null
 * }
 * ```
 * 
 * @example
 * ```tsx
 * function LiveCounter() {
 *   const { data, refetch } = useReadEncrypted({
 *     address: '0x...',
 *     abi: counterABI,
 *     functionName: 'getCount',
 *     pollingInterval: 5000, // Poll every 5 seconds
 *   })
 *   
 *   return (
 *     <div>
 *       <p>Count: {data ? String(data) : '...'}</p>
 *       <button onClick={() => refetch()}>Refresh</button>
 *     </div>
 *   )
 * }
 * ```
 */
export function useReadEncrypted<T = unknown>(
  params: UseReadEncryptedParams
): UseReadEncryptedReturn<T> {
  const { client, isInitialized } = useFHEVM()
  
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const { enabled = true, pollingInterval = 0, ...contractParams } = params

  const read = useCallback(async (): Promise<T> => {
    if (!isInitialized || client === null) {
      throw new Error('FHEVM client not initialized')
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await client.executeContract(contractParams)
      
      // In real implementation, this would extract return value from receipt
      // For now, we'll use result hash as placeholder
      // TODO: Add proper return value extraction from contract call
      const value = result.hash as unknown as T
      
      setData(value)
      return value
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to read contract')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [client, isInitialized, contractParams])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setIsLoading(false)
  }, [])

  // Auto-fetch on mount and params change
  useEffect(() => {
    if (enabled && isInitialized) {
      read().catch(console.error)
    }
  }, [enabled, isInitialized, read])

  // Polling
  useEffect(() => {
    if (enabled && pollingInterval > 0 && isInitialized) {
      const interval = setInterval(() => {
        read().catch(console.error)
      }, pollingInterval)

      return () => {
        clearInterval(interval)
      }
    }

    return undefined
  }, [enabled, pollingInterval, isInitialized, read])

  return {
    data,
    isLoading,
    error,
    refetch: read,
    reset,
  }
}
