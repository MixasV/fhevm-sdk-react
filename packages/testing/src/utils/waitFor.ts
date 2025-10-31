/**
 * Testing utilities
 * 
 * @packageDocumentation
 */

/**
 * Wait for a condition to be true
 * 
 * @param condition - Condition function
 * @param options - Wait options
 * @returns Promise that resolves when condition is true
 * 
 * @example
 * ```typescript
 * await waitFor(() => component.isLoaded(), { timeout: 5000 })
 * ```
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  options: {
    timeout?: number
    interval?: number
    message?: string
  } = {}
): Promise<void> {
  const { timeout = 5000, interval = 50, message = 'Timeout waiting for condition' } = options

  const startTime = Date.now()

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const result = await condition()

    if (result) {
      return
    }

    if (Date.now() - startTime > timeout) {
      throw new Error(message)
    }

    await new Promise((resolve) => setTimeout(resolve, interval))
  }
}

/**
 * Wait for specified milliseconds
 * 
 * @param ms - Milliseconds to wait
 * @returns Promise that resolves after delay
 * 
 * @example
 * ```typescript
 * await sleep(1000) // Wait 1 second
 * ```
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Flush all pending promises
 * 
 * @returns Promise that resolves after all pending promises
 * 
 * @example
 * ```typescript
 * await flushPromises()
 * expect(component.data).toBeDefined()
 * ```
 */
export async function flushPromises(): Promise<void> {
  await new Promise((resolve) => setImmediate(resolve))
}
