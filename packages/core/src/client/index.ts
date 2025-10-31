/**
 * FHEVM Client implementation
 * 
 * @packageDocumentation
 */

import type { FHEVMConfig } from '../types'

import { FHEVMClient } from './FHEVMClient'

export { FHEVMClient }

/**
 * Helper function to create and initialize FHEVM client
 * 
 * @param config - Client configuration
 * @returns Promise resolving to initialized client
 * 
 * @throws {InitializationError} If initialization fails
 * 
 * @example
 * ```typescript
 * const client = await createFHEVMClient({
 *   chainId: 31337,
 *   rpcUrl: 'http://localhost:8545'
 * })
 * ```
 */
export async function createFHEVMClient(config: FHEVMConfig): Promise<FHEVMClient> {
  const client = new FHEVMClient()
  await client.initialize(config)
  return client
}
