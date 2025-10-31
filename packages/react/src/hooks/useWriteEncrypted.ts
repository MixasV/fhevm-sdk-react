/**
 * useWriteEncrypted hook - write encrypted contract state
 * 
 * @packageDocumentation
 */

import { useCallback, useState } from 'react'
import type { ContractFunctionParams, TransactionReceipt } from '@mixaspro/core'

import { useFHEVM } from './useFHEVM'

/**
 * Write encrypted hook params
 */
export interface UseWriteEncryptedParams extends Omit<ContractFunctionParams, 'args'> {
  /**
   * Function arguments
   */
  args?: readonly unknown[]
}

/**
 * Write function parameters
 */
export interface WriteParams {
  /**
   * Function arguments (overrides params.args)
   */
  args?: readonly unknown[]

  /**
   * Transaction value in wei
   */
  value?: bigint | string

  /**
   * Gas limit
   */
  gasLimit?: bigint | string
}

/**
 * Write encrypted hook return type
 */
export interface UseWriteEncryptedReturn {
  /**
   * Write function
   */
  write: (params?: WriteParams) => Promise<TransactionReceipt>

  /**
   * Write function with async execution
   */
  writeAsync: (params?: WriteParams) => Promise<TransactionReceipt>

  /**
   * Is write in progress
   */
  isWriting: boolean

  /**
   * Last write error
   */
  error: Error | null

  /**
   * Last transaction receipt
   */
  data: TransactionReceipt | null

  /**
   * Reset state
   */
  reset: () => void
}

/**
 * Hook for writing encrypted contract state
 * 
 * Provides functionality to write to smart contracts with automatic state management
 * 
 * @param params - Write parameters
 * @returns Write hook methods and state
 * 
 * @example
 * ```tsx
 * function TransferForm() {
 *   const { write, isWriting, error, data } = useWriteEncrypted({
 *     address: '0x...',
 *     abi: tokenABI,
 *     functionName: 'transfer',
 *   })
 *   
 *   const { encrypt } = useEncrypt()
 *   const [amount, setAmount] = useState('')
 *   const [to, setTo] = useState('')
 *   
 *   const handleSubmit = async (e: React.FormEvent) => {
 *     e.preventDefault()
 *     
 *     const encryptedAmount = await encrypt(parseInt(amount), 'euint32')
 *     await write({ args: [to, encryptedAmount.value] })
 *   }
 *   
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="To" />
 *       <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" />
 *       <button disabled={isWriting}>
 *         {isWriting ? 'Sending...' : 'Send'}
 *       </button>
 *       {error && <div>Error: {error.message}</div>}
 *       {data && <div>Transaction: {data.hash}</div>}
 *     </form>
 *   )
 * }
 * ```
 * 
 * @example
 * ```tsx
 * function IncrementButton() {
 *   const { writeAsync, isWriting } = useWriteEncrypted({
 *     address: '0x...',
 *     abi: counterABI,
 *     functionName: 'increment',
 *   })
 *   
 *   const handleIncrement = async () => {
 *     try {
 *       const receipt = await writeAsync()
 *       console.log('Transaction confirmed:', receipt.hash)
 *     } catch (err) {
 *       console.error('Transaction failed:', err)
 *     }
 *   }
 *   
 *   return (
 *     <button onClick={handleIncrement} disabled={isWriting}>
 *       {isWriting ? 'Processing...' : 'Increment'}
 *     </button>
 *   )
 * }
 * ```
 */
export function useWriteEncrypted(
  params: UseWriteEncryptedParams
): UseWriteEncryptedReturn {
  const { client, isInitialized } = useFHEVM()
  
  const [isWriting, setIsWriting] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [data, setData] = useState<TransactionReceipt | null>(null)

  const executeWrite = useCallback(
    async (writeParams?: WriteParams): Promise<TransactionReceipt> => {
      if (!isInitialized || client === null) {
        throw new Error('FHEVM client not initialized')
      }

      setIsWriting(true)
      setError(null)

      try {
        const finalParams: ContractFunctionParams = {
          ...params,
          args: writeParams?.args ?? params.args ?? [],
          value: writeParams?.value,
          gasLimit: writeParams?.gasLimit,
        }

        const receipt = await client.executeContract(finalParams)
        setData(receipt)
        return receipt
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to write contract')
        setError(error)
        throw error
      } finally {
        setIsWriting(false)
      }
    },
    [client, isInitialized, params]
  )

  const reset = useCallback(() => {
    setError(null)
    setData(null)
    setIsWriting(false)
  }, [])

  return {
    write: executeWrite,
    writeAsync: executeWrite,
    isWriting,
    error,
    data,
    reset,
  }
}
