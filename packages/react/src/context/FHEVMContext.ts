/**
 * FHEVM React Context
 * 
 * @packageDocumentation
 */

import type { FHEVMClient, FHEVMConfig, WalletInfo, NetworkInfo } from '@mixaspro/core'
import { createContext } from 'react'

/**
 * FHEVM Context value interface
 */
export interface FHEVMContextValue {
  /**
   * FHEVM client instance
   */
  client: FHEVMClient | null

  /**
   * Initialization state
   */
  isInitialized: boolean

  /**
   * Loading state during initialization
   */
  isInitializing: boolean

  /**
   * Error during initialization
   */
  initError: Error | null

  /**
   * Connected wallet information
   */
  wallet: WalletInfo | null

  /**
   * Current network information
   */
  network: NetworkInfo | null

  /**
   * Connect wallet function
   */
  connectWallet: (provider?: unknown) => Promise<WalletInfo>

  /**
   * Disconnect wallet function
   */
  disconnectWallet: () => void

  /**
   * Reinitialize FHEVM client
   */
  reinitialize: (config?: Partial<FHEVMConfig>) => Promise<void>
}

/**
 * FHEVM React Context
 * 
 * Provides FHEVM client and state to all child components
 */
export const FHEVMContext = createContext<FHEVMContextValue | null>(null)

FHEVMContext.displayName = 'FHEVMContext'
