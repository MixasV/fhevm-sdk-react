/**
 * Solid.js primitive for wallet management
 * 
 * @packageDocumentation
 */

import type { WalletInfo } from '@mixaspro/core'
import { createSignal } from 'solid-js'

import { useFHEVM } from '../context'

/**
 * EIP-1193 provider interface
 */
export interface Eip1193Provider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
}

/**
 * Create wallet primitive return type
 */
export interface CreateWalletReturn {
  wallet: () => WalletInfo | null
  isConnecting: () => boolean
  isConnected: () => boolean
  error: () => Error | null
  connect: (provider: Eip1193Provider) => Promise<WalletInfo>
  disconnect: () => void
}

/**
 * Create wallet primitive
 * 
 * @returns Wallet primitive
 * 
 * @example
 * ```tsx
 * import { createWallet } from '@mixaspro/solid'
 * 
 * function WalletButton() {
 *   const { wallet, isConnecting, isConnected, connect, disconnect } = createWallet()
 * 
 *   async function handleConnect() {
 *     await connect(window.ethereum)
 *   }
 * 
 *   return (
 *     <Show when={!isConnected()} fallback={
 *       <div>
 *         <span>{wallet()!.address}</span>
 *         <button onClick={disconnect}>Disconnect</button>
 *       </div>
 *     }>
 *       <button onClick={handleConnect} disabled={isConnecting()}>
 *         {isConnecting() ? 'Connecting...' : 'Connect Wallet'}
 *       </button>
 *     </Show>
 *   )
 * }
 * ```
 */
export function createWallet(): CreateWalletReturn {
  const { client, wallet: contextWallet } = useFHEVM()
  
  const [isConnecting, setIsConnecting] = createSignal(false)
  const [error, setError] = createSignal<Error | null>(null)

  const connect = async (provider: Eip1193Provider): Promise<WalletInfo> => {
    const fhevmClient = client()
    
    if (fhevmClient === null || fhevmClient === undefined) {
      throw new Error('FHEVM client not initialized')
    }

    setIsConnecting(true)
    setError(null)

    try {
      const walletInfo = await fhevmClient.connectWallet(provider)
      return walletInfo
    } catch (err) {
      const connectError = err instanceof Error ? err : new Error('Wallet connection failed')
      setError(connectError)
      throw connectError
    } finally {
      setIsConnecting(false)
    }
  }

  function disconnect() {
    setError(null)
  }

  return {
    wallet: contextWallet,
    isConnecting,
    isConnected: () => contextWallet() !== null,
    error,
    connect,
    disconnect,
  }
}
