/**
 * FHEVM Context Provider
 * 
 * @packageDocumentation
 */

import { FHEVMClient, type FHEVMConfig, type WalletInfo, type NetworkInfo } from '@mixaspro/core'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'

import { FHEVMContext, type FHEVMContextValue } from './FHEVMContext'

/**
 * FHEVMProvider props
 */
export interface FHEVMProviderProps {
  /**
   * Child components
   */
  children: ReactNode

  /**
   * FHEVM configuration
   */
  config: FHEVMConfig

  /**
   * Auto-initialize on mount
   * @default true
   */
  autoInit?: boolean

  /**
   * Auto-connect wallet if available
   * @default false
   */
  autoConnect?: boolean
}

/**
 * Provider component for FHEVM context
 * 
 * Manages FHEVM client lifecycle and provides context to child components
 * 
 * @param props - Component props
 * @returns Provider component
 * 
 * @example
 * ```tsx
 * <FHEVMProvider config={{ chainId: 31337 }}>
 *   <App />
 * </FHEVMProvider>
 * ```
 * 
 * @example
 * ```tsx
 * <FHEVMProvider 
 *   config={{ chainId: 31337, rpcUrl: 'http://localhost:8545' }}
 *   autoInit={true}
 *   autoConnect={true}
 * >
 *   <App />
 * </FHEVMProvider>
 * ```
 */
export function FHEVMProvider({ 
  children, 
  config,
  autoInit = true,
  autoConnect = false
}: FHEVMProviderProps): JSX.Element {
  const [client, setClient] = useState<FHEVMClient | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [initError, setInitError] = useState<Error | null>(null)
  const [wallet, setWallet] = useState<WalletInfo | null>(null)
  const [network, setNetwork] = useState<NetworkInfo | null>(null)

  /**
   * Initialize FHEVM client
   */
  const initialize = useCallback(async (initConfig?: Partial<FHEVMConfig>) => {
    const finalConfig = { ...config, ...initConfig }

    setIsInitializing(true)
    setInitError(null)

    try {
      const newClient = new FHEVMClient()
      await newClient.initialize(finalConfig)
      
      setClient(newClient)
      setIsInitialized(true)
      setNetwork(newClient.getNetwork())

      return newClient
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to initialize FHEVM')
      setInitError(err)
      setIsInitialized(false)
      throw err
    } finally {
      setIsInitializing(false)
    }
  }, [config])

  /**
   * Connect wallet
   */
  const connectWallet = useCallback(async (provider?: unknown): Promise<WalletInfo> => {
    if (client === null) {
      throw new Error('FHEVM client not initialized')
    }

    try {
      const walletInfo = await client.connectWallet(provider as Parameters<typeof client.connectWallet>[0])
      setWallet(walletInfo)
      return walletInfo
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to connect wallet')
      throw err
    }
  }, [client])

  /**
   * Disconnect wallet
   */
  const disconnectWallet = useCallback(() => {
    setWallet(null)
  }, [])

  /**
   * Reinitialize client
   */
  const reinitialize = useCallback(async (newConfig?: Partial<FHEVMConfig>) => {
    if (client !== null) {
      await client.reset()
    }

    await initialize(newConfig)
  }, [client, initialize])

  /**
   * Auto-initialize on mount
   */
  useEffect(() => {
    if (autoInit && !isInitialized && !isInitializing && client === null) {
      initialize().catch((error) => {
        console.error('Failed to auto-initialize FHEVM:', error)
      })
    }
  }, [autoInit, isInitialized, isInitializing, client, initialize])

  /**
   * Auto-connect wallet
   */
  useEffect(() => {
    if (autoConnect && isInitialized && wallet === null && typeof globalThis.window !== 'undefined') {
      // Check if ethereum provider is available
      const windowWithEthereum = globalThis.window as unknown as { ethereum?: unknown }
      if (windowWithEthereum.ethereum !== undefined && windowWithEthereum.ethereum !== null) {
        connectWallet(windowWithEthereum.ethereum).catch((error) => {
          console.error('Failed to auto-connect wallet:', error)
        })
      }
    }
  }, [autoConnect, isInitialized, wallet, connectWallet])

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (client !== null) {
        client.reset().catch((error: unknown) => {
          console.error('Failed to cleanup FHEVM client:', error)
        })
      }
    }
  }, [client])

  /**
   * Context value
   */
  const value = useMemo<FHEVMContextValue>(() => ({
    client,
    isInitialized,
    isInitializing,
    initError,
    wallet,
    network,
    connectWallet,
    disconnectWallet,
    reinitialize,
  }), [
    client,
    isInitialized,
    isInitializing,
    initError,
    wallet,
    network,
    connectWallet,
    disconnectWallet,
    reinitialize,
  ])

  return (
    <FHEVMContext.Provider value={value}>
      {children}
    </FHEVMContext.Provider>
  )
}
