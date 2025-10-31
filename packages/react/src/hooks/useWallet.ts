/**
 * useWallet hook - wallet connection management
 * 
 * @packageDocumentation
 */

import { useCallback, useState } from 'react'
import type { WalletInfo } from '@mixaspro/core'

import { useFHEVM } from './useFHEVM'

/**
 * Wallet hook return type
 */
export interface UseWalletReturn {
  /**
   * Connected wallet info
   */
  wallet: WalletInfo | null

  /**
   * Connect wallet
   */
  connect: (provider?: unknown) => Promise<WalletInfo>

  /**
   * Disconnect wallet
   */
  disconnect: () => void

  /**
   * Is connection in progress
   */
  isConnecting: boolean

  /**
   * Connection error
   */
  error: Error | null

  /**
   * Is wallet connected
   */
  isConnected: boolean
}

/**
 * Hook for wallet connection management
 * 
 * Provides wallet connection functionality with automatic state management
 * 
 * @returns Wallet hook methods and state
 * 
 * @example
 * ```tsx
 * function WalletButton() {
 *   const { wallet, connect, disconnect, isConnecting, isConnected } = useWallet()
 *   
 *   const handleClick = async () => {
 *     if (isConnected) {
 *       disconnect()
 *     } else {
 *       try {
 *         await connect(window.ethereum)
 *       } catch (err) {
 *         console.error('Connection failed:', err)
 *       }
 *     }
 *   }
 *   
 *   return (
 *     <button onClick={handleClick} disabled={isConnecting}>
 *       {isConnecting ? 'Connecting...' : 
 *        isConnected ? `Disconnect ${wallet?.address.slice(0, 6)}...` : 
 *        'Connect Wallet'}
 *     </button>
 *   )
 * }
 * ```
 * 
 * @example
 * ```tsx
 * function UserProfile() {
 *   const { wallet, isConnected } = useWallet()
 *   
 *   if (!isConnected) {
 *     return <div>Please connect wallet</div>
 *   }
 *   
 *   return (
 *     <div>
 *       <p>Address: {wallet?.address}</p>
 *       <p>Chain ID: {wallet?.chainId}</p>
 *     </div>
 *   )
 * }
 * ```
 */
export function useWallet(): UseWalletReturn {
  const { wallet, connectWallet, disconnectWallet } = useFHEVM()
  
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const connect = useCallback(
    async (provider?: unknown): Promise<WalletInfo> => {
      setIsConnecting(true)
      setError(null)

      try {
        const walletInfo = await connectWallet(provider)
        return walletInfo
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to connect wallet')
        setError(error)
        throw error
      } finally {
        setIsConnecting(false)
      }
    },
    [connectWallet]
  )

  const disconnect = useCallback(() => {
    disconnectWallet()
    setError(null)
  }, [disconnectWallet])

  const isConnected = wallet !== null

  return {
    wallet,
    connect,
    disconnect,
    isConnecting,
    error,
    isConnected,
  }
}
