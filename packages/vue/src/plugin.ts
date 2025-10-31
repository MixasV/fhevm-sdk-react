/**
 * FHEVM Vue plugin
 * 
 * @packageDocumentation
 */

import { FHEVMClient } from '@mixaspro/core'
import type { FHEVMConfig } from '@mixaspro/core'
import { reactive, type App, type Plugin } from 'vue'

import { FHEVMContextKey, type FHEVMContext } from './composables/useFHEVM'


/**
 * FHEVM plugin options
 */
export interface FHEVMPluginOptions {
  /**
   * FHEVM configuration
   */
  config: FHEVMConfig

  /**
   * Auto-initialize on install
   */
  autoInit?: boolean

  /**
   * Auto-connect wallet on install
   */
  autoConnect?: boolean
}

/**
 * Create FHEVM plugin
 * 
 * @param options - Plugin options
 * @returns Vue plugin
 * 
 * @example
 * ```typescript
 * import { createApp } from 'vue'
 * import { createFHEVMPlugin } from '@mixaspro/vue'
 * import App from './App.vue'
 * 
 * const app = createApp(App)
 * 
 * app.use(createFHEVMPlugin({
 *   config: { chainId: 31337 },
 *   autoInit: true
 * }))
 * 
 * app.mount('#app')
 * ```
 */
export function createFHEVMPlugin(options: FHEVMPluginOptions): Plugin {
  const context: FHEVMContext = reactive({
    client: null,
    isInitialized: false,
    network: null,
    wallet: null,
    error: null,
  })

  async function initialize(): Promise<void> {
    try {
      context.error = null

      const fhevmClient = new FHEVMClient()
      await fhevmClient.initialize(options.config)

      context.client = fhevmClient
      context.isInitialized = true
      context.network = fhevmClient.getNetwork()

      // Auto-connect if requested
      const windowWithEthereum = window as unknown as { ethereum?: unknown }
      if (options.autoConnect === true && windowWithEthereum.ethereum !== null && windowWithEthereum.ethereum !== undefined) {
        try {
          const walletInfo = await fhevmClient.connectWallet(windowWithEthereum.ethereum as Parameters<typeof fhevmClient.connectWallet>[0])
          context.wallet = walletInfo
        } catch (walletError) {
          console.warn('Auto-connect failed:', walletError)
        }
      }
    } catch (err) {
      context.error = err instanceof Error ? err : new Error('Initialization failed')
      throw context.error
    }
  }

  return {
    install(app: App) {
      // Provide context
      app.provide(FHEVMContextKey, context)

      // Auto-initialize if requested
      if (options.autoInit === true) {
        initialize().catch((err) => {
          console.error('FHEVM initialization failed:', err)
        })
      }

      // Expose globally (optional)
      app.config.globalProperties['$fhevm'] = context
    },
  }
}

// Declare module augmentation for global properties
declare module 'vue' {
  export interface ComponentCustomProperties {
    $fhevm: FHEVMContext
  }
}
