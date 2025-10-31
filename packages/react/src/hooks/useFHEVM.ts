/**
 * Main FHEVM hook
 * 
 * @packageDocumentation
 */

import { useContext } from 'react'

import { FHEVMContext, type FHEVMContextValue } from '../context/FHEVMContext'

/**
 * Hook to access FHEVM context
 * 
 * Provides access to FHEVM client instance, initialization state, wallet info, and utility functions
 * 
 * @returns FHEVM context value
 * @throws Error if used outside FHEVMProvider
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { client, isInitialized, wallet, network } = useFHEVM()
 *   
 *   if (!isInitialized) {
 *     return <div>Initializing FHEVM...</div>
 *   }
 *   
 *   return (
 *     <div>
 *       Connected to {network?.name}
 *       {wallet && <p>Wallet: {wallet.address}</p>}
 *     </div>
 *   )
 * }
 * ```
 * 
 * @example
 * ```tsx
 * function WalletConnect() {
 *   const { connectWallet, disconnectWallet, wallet } = useFHEVM()
 *   
 *   const handleConnect = async () => {
 *     try {
 *       await connectWallet(window.ethereum)
 *     } catch (error) {
 *       console.error('Failed to connect:', error)
 *     }
 *   }
 *   
 *   return (
 *     <button onClick={wallet ? disconnectWallet : handleConnect}>
 *       {wallet ? `Disconnect ${wallet.address}` : 'Connect Wallet'}
 *     </button>
 *   )
 * }
 * ```
 */
export function useFHEVM(): FHEVMContextValue {
  const context = useContext(FHEVMContext)
  
  if (context === null) {
    throw new Error('useFHEVM must be used within FHEVMProvider')
  }
  
  return context
}
