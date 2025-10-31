/**
 * FHEVM Solid.js context
 * 
 * @packageDocumentation
 */


import { FHEVMClient } from '@mixaspro/core'
import type { Eip1193Provider, FHEVMConfig, NetworkInfo, WalletInfo } from '@mixaspro/core'
import { createContext, useContext, createSignal, createEffect, onCleanup, type ParentComponent } from 'solid-js'

/**
 * FHEVM context interface
 */
export interface FHEVMContextValue {
  client: () => FHEVMClient | null
  isInitialized: () => boolean
  network: () => NetworkInfo | null
  wallet: () => WalletInfo | null
  error: () => Error | null
}

const FHEVMContext = createContext<FHEVMContextValue>()

/**
 * FHEVM Provider props
 */
export interface FHEVMProviderOptions {
  config: FHEVMConfig
  autoInit?: boolean
  autoConnect?: boolean
}

/**
 * FHEVM Provider component
 * 
 * @example
 * ```tsx
 * import { FHEVMProvider } from '@mixaspro/solid'
 * 
 * function App() {
 *   return (
 *     <FHEVMProvider config={{ chainId: 31337 }} autoInit>
 *       <Counter />
 *     </FHEVMProvider>
 *   )
 * }
 * ```
 */
export const FHEVMProvider: ParentComponent<FHEVMProviderOptions> = (props) => {
  const [client, setClient] = createSignal<FHEVMClient | null>(null)
  const [isInitialized, setIsInitialized] = createSignal(false)
  const [network, setNetwork] = createSignal<NetworkInfo | null>(null)
  const [wallet, setWallet] = createSignal<WalletInfo | null>(null)
  const [error, setError] = createSignal<Error | null>(null)

  async function initialize() {
    try {
      setError(null)

      const fhevmClient = new FHEVMClient()
      await fhevmClient.initialize(props.config)

      setClient(fhevmClient)
      setIsInitialized(true)
      setNetwork(fhevmClient.getNetwork())

      // Auto-connect if requested
      const windowWithEthereum = window as unknown as { ethereum?: unknown }
      if (props.autoConnect === true && windowWithEthereum.ethereum !== null && windowWithEthereum.ethereum !== undefined) {
        try {
          const walletInfo = await fhevmClient.connectWallet(windowWithEthereum.ethereum as unknown as Eip1193Provider)
          setWallet(walletInfo)
        } catch (walletError) {
          console.warn('Auto-connect failed:', walletError)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Initialization failed'))
      throw err
    }
  }

  // Auto-initialize
  createEffect(() => {
    if (props.autoInit === true) {
      initialize().catch((err) => {
        console.error('FHEVM initialization failed:', err)
      })
    }
  })

  // Cleanup
  onCleanup(() => {
    // Cleanup if needed
  })

  const value: FHEVMContextValue = {
    client,
    isInitialized,
    network,
    wallet,
    error,
  }

  // Return provider without JSX to avoid type issues
  const Provider = FHEVMContext.Provider
  return Provider({ value, get children() { return props.children } })
}

/**
 * Use FHEVM context
 * 
 * @returns FHEVM context value
 * 
 * @throws {Error} If used outside FHEVMProvider
 * 
 * @example
 * ```tsx
 * import { useFHEVM } from '@mixaspro/solid'
 * 
 * function Counter() {
 *   const { client, isInitialized, wallet } = useFHEVM()
 * 
 *   return (
 *     <Show when={isInitialized()}>
 *       <div>Wallet: {wallet()?.address}</div>
 *     </Show>
 *   )
 * }
 * ```
 */
export function useFHEVM(): FHEVMContextValue {
  const context = useContext(FHEVMContext)
  
  if (context === null || context === undefined) {
    throw new Error('useFHEVM must be used within FHEVMProvider')
  }
  
  return context
}
