/**
 * Vue composable for FHEVM context
 * 
 * @packageDocumentation
 */

import type { FHEVMClient, NetworkInfo, WalletInfo } from '@mixaspro/core'
import { inject, type InjectionKey } from 'vue'


/**
 * FHEVM context interface
 */
export interface FHEVMContext {
  /**
   * FHEVM client instance
   */
  client: FHEVMClient | null

  /**
   * Whether FHEVM is initialized
   */
  isInitialized: boolean

  /**
   * Current network information
   */
  network: NetworkInfo | null

  /**
   * Connected wallet information
   */
  wallet: WalletInfo | null

  /**
   * Initialization error if any
   */
  error: Error | null
}

/**
 * Injection key for FHEVM context
 */
export const FHEVMContextKey: InjectionKey<FHEVMContext> = Symbol('fhevm-context')

/**
 * Use FHEVM context
 * 
 * @returns FHEVM context
 * 
 * @throws {Error} If used outside FHEVMProvider
 * 
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { useFHEVM } from '@mixaspro/vue'
 * 
 * const { client, isInitialized, wallet } = useFHEVM()
 * </script>
 * ```
 */
export function useFHEVM(): FHEVMContext {
  const context = inject(FHEVMContextKey)
  
  if (context === null || context === undefined) {
    throw new Error('useFHEVM must be used within FHEVMProvider')
  }
  
  return context
}
