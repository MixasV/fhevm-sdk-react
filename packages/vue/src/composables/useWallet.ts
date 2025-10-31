/**
 * Vue composable for wallet management
 * 
 * @packageDocumentation
 */

import type { WalletInfo } from '@mixaspro/core'
import { ref, computed } from 'vue'


import { useFHEVM } from './useFHEVM'

/**
 * EIP-1193 provider interface
 */
export interface Eip1193Provider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
}

/**
 * Wallet composable return type
 */
export interface UseWalletReturn {
  /**
   * Connected wallet info
   */
  wallet: WalletInfo | null

  /**
   * Whether wallet is connected
   */
  isConnected: boolean

  /**
   * Whether wallet is connecting
   */
  isConnecting: boolean

  /**
   * Connection error if any
   */
  error: Error | null

  /**
   * Connect wallet
   */
  connect: (provider?: Eip1193Provider) => Promise<WalletInfo>

  /**
   * Disconnect wallet
   */
  disconnect: () => void
}

/**
 * Use wallet management
 * 
 * @returns Wallet composable
 * 
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { useWallet } from '@mixaspro/vue'
 * 
 * const { wallet, isConnected, connect, disconnect } = useWallet()
 * 
 * async function handleConnect() {
 *   await connect(window.ethereum)
 * }
 * </script>
 * 
 * <template>
 *   <button v-if="!isConnected" @click="handleConnect">Connect</button>
 *   <div v-else>
 *     Connected: {{ wallet?.address }}
 *     <button @click="disconnect">Disconnect</button>
 *   </div>
 * </template>
 * ```
 */
export function useWallet(): UseWalletReturn {
  const { client, wallet: contextWallet } = useFHEVM()
  
  const isConnecting = ref(false)
  const error = ref<Error | null>(null)
  
  const isConnected = computed(() => contextWallet !== null)

  /**
   * Connect wallet
   */
  async function connect(provider?: Eip1193Provider): Promise<WalletInfo> {
    if (client === null || client === undefined) {
      throw new Error('FHEVM client not initialized')
    }

    if (provider === null || provider === undefined) {
      throw new Error('Provider is required')
    }

    isConnecting.value = true
    error.value = null

    try {
      const walletInfo = await client.connectWallet(provider)
      return walletInfo
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to connect wallet')
      throw error.value
    } finally {
      isConnecting.value = false
    }
  }

  /**
   * Disconnect wallet
   */
  function disconnect(): void {
    // Note: disconnectWallet() needs to be implemented in FHEVMClient
    // For now, this is a placeholder that clears local state
    error.value = null
  }

  return {
    wallet: contextWallet,
    isConnected: isConnected.value,
    isConnecting: isConnecting.value,
    error: error.value,
    connect,
    disconnect,
  }
}
