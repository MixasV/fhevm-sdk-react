/**
 * Vue composable for contract interactions
 * 
 * @packageDocumentation
 */

import type { ContractFunctionParams, TransactionReceipt } from '@mixaspro/core'
import { ref, watch, onUnmounted } from 'vue'


import { useFHEVM } from './useFHEVM'

/**
 * Contract write composable params
 */
export interface UseContractWriteParams {
  /**
   * Contract address
   */
  address: string

  /**
   * Contract ABI
   */
  abi: readonly unknown[]

  /**
   * Function name to call
   */
  functionName: string
}

/**
 * Contract write return type
 */
export interface UseContractWriteReturn {
  /**
   * Transaction receipt
   */
  data: TransactionReceipt | null

  /**
   * Whether transaction is pending
   */
  isWriting: boolean

  /**
   * Write error if any
   */
  error: Error | null

  /**
   * Execute contract write
   */
  write: (params?: { args?: unknown[] }) => Promise<TransactionReceipt>

  /**
   * Reset state
   */
  reset: () => void
}

/**
 * Contract read composable params
 */
export interface UseContractReadParams {
  /**
   * Contract address
   */
  address: string

  /**
   * Contract ABI
   */
  abi: readonly unknown[]

  /**
   * Function name to call
   */
  functionName: string

  /**
   * Function arguments
   */
  args?: unknown[]

  /**
   * Whether to enable automatic fetching
   */
  enabled?: boolean

  /**
   * Polling interval in milliseconds
   */
  pollingInterval?: number
}

/**
 * Contract read return type
 */
export interface UseContractReadReturn<T = unknown> {
  /**
   * Read result
   */
  data: T | null

  /**
   * Whether read is loading
   */
  isLoading: boolean

  /**
   * Read error if any
   */
  error: Error | null

  /**
   * Refetch data
   */
  refetch: () => Promise<T>
}

/**
 * Use contract write operations
 * 
 * @param params - Write parameters
 * @returns Contract write composable
 * 
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { useContractWrite } from '@mixaspro/vue'
 * 
 * const { data, isWriting, error, write } = useContractWrite({
 *   address: '0x...',
 *   abi: contractABI,
 *   functionName: 'transfer'
 * })
 * 
 * async function handleTransfer() {
 *   await write({ args: ['0x...', 100] })
 * }
 * </script>
 * ```
 */
export function useContractWrite(params: UseContractWriteParams): UseContractWriteReturn {
  const { client } = useFHEVM()
  
  const data = ref<TransactionReceipt | null>(null)
  const isWriting = ref(false)
  const error = ref<Error | null>(null)

  /**
   * Execute contract write
   */
  async function write(execParams?: { args?: unknown[] }): Promise<TransactionReceipt> {
    if (client === null || client === undefined) {
      throw new Error('FHEVM client not initialized')
    }

    isWriting.value = true
    error.value = null

    try {
      const contractParams: ContractFunctionParams = {
        address: params.address,
        abi: params.abi,
        functionName: params.functionName,
        args: execParams?.args,
      }

      const receipt = await client.executeContract(contractParams)
      data.value = receipt
      return receipt
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Contract write failed')
      throw error.value
    } finally {
      isWriting.value = false
    }
  }

  /**
   * Reset state
   */
  function reset(): void {
    data.value = null
    error.value = null
    isWriting.value = false
  }

  return {
    data: data.value,
    isWriting: isWriting.value,
    error: error.value,
    write,
    reset,
  }
}

/**
 * Use contract read operations
 * 
 * @param params - Read parameters
 * @returns Contract read composable
 * 
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { useContractRead } from '@mixaspro/vue'
 * 
 * const { data, isLoading, error, refetch } = useContractRead({
 *   address: '0x...',
 *   abi: contractABI,
 *   functionName: 'balanceOf',
 *   args: [address],
 *   enabled: true,
 *   pollingInterval: 10000
 * })
 * </script>
 * 
 * <template>
 *   <div v-if="isLoading">Loading...</div>
 *   <div v-else-if="error">Error: {{ error.message }}</div>
 *   <div v-else>Balance: {{ data }}</div>
 * </template>
 * ```
 */
export function useContractRead<T = unknown>(
  params: UseContractReadParams
): UseContractReadReturn<T> {
  const { client } = useFHEVM()
  
  const data = ref<T | null>(null)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)
  
  let intervalId: ReturnType<typeof setInterval> | null = null

  /**
   * Fetch contract data
   */
  async function refetch(): Promise<T> {
    if (client === null || client === undefined) {
      throw new Error('FHEVM client not initialized')
    }

    isLoading.value = true
    error.value = null

    try {
      const contractParams: ContractFunctionParams = {
        address: params.address,
        abi: params.abi,
        functionName: params.functionName,
        args: params.args,
      }

      // Note: readContract doesn't exist, using executeContract for now
      const receipt = await client.executeContract(contractParams)
      const result = receipt as unknown as T
      data.value = result
      return result
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Contract read failed')
      throw error.value
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Start polling
   */
  function startPolling(): void {
    if (intervalId !== null || params.pollingInterval === null || params.pollingInterval === undefined || params.pollingInterval === 0) {
      return
    }

    intervalId = setInterval(() => {
      refetch().catch(() => {
        // Error already set in refetch
      })
    }, params.pollingInterval)
  }

  /**
   * Stop polling
   */
  function stopPolling(): void {
    if (intervalId !== null) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  // Watch enabled param
  watch(
    () => params.enabled,
    (enabled) => {
      if (enabled !== false) {
        refetch().catch(() => {
          // Error already set in refetch
        })
        startPolling()
      } else {
        stopPolling()
      }
    },
    { immediate: true }
  )

  // Cleanup on unmount
  onUnmounted(() => {
    stopPolling()
  })

  return {
    data: data.value as T | null,
    isLoading: isLoading.value,
    error: error.value,
    refetch,
  }
}
