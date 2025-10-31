/**
 * Retry utilities with exponential backoff
 * 
 * @packageDocumentation
 */

/**
 * Retry configuration
 */
export interface RetryConfig {
  /**
   * Maximum number of retry attempts
   */
  maxAttempts?: number

  /**
   * Initial delay in milliseconds
   */
  initialDelay?: number

  /**
   * Maximum delay in milliseconds
   */
  maxDelay?: number

  /**
   * Backoff multiplier
   */
  backoffMultiplier?: number

  /**
   * Add random jitter to delays
   */
  jitter?: boolean

  /**
   * Callback on retry
   */
  onRetry?: (error: Error, attempt: number, delay: number) => void

  /**
   * Function to determine if error is retryable
   */
  shouldRetry?: (error: Error) => boolean
}

/**
 * Retry result
 */
export interface RetryResult<T> {
  /**
   * Operation result
   */
  result: T

  /**
   * Number of attempts made
   */
  attempts: number

  /**
   * Total time taken in milliseconds
   */
  totalTime: number

  /**
   * Whether operation succeeded
   */
  success: boolean
}

/**
 * Default retryable errors
 */
const DEFAULT_RETRYABLE_ERRORS = [
  'ETIMEDOUT',
  'ECONNRESET',
  'ECONNREFUSED',
  'ENOTFOUND',
  'ENETUNREACH',
  'NetworkError',
  'FetchError',
]

/**
 * Check if error is retryable by default
 */
function isRetryableError(error: Error): boolean {
  const errorMessage = error.message.toLowerCase()
  const errorName = error.name.toLowerCase()

  return DEFAULT_RETRYABLE_ERRORS.some((retryable) => {
    const check = retryable.toLowerCase()
    return errorMessage.includes(check) || errorName.includes(check)
  })
}

/**
 * Calculate delay with exponential backoff and optional jitter
 */
function calculateDelay(
  attempt: number,
  config: Required<RetryConfig>
): number {
  const exponentialDelay = Math.min(
    config.initialDelay * Math.pow(config.backoffMultiplier, attempt - 1),
    config.maxDelay
  )

  if (config.jitter) {
    const jitterRange = exponentialDelay * 0.1
    const jitter = Math.random() * jitterRange * 2 - jitterRange
    return Math.max(0, exponentialDelay + jitter)
  }

  return exponentialDelay
}

/**
 * Retry an async operation with exponential backoff
 * 
 * @param fn - Function to retry
 * @param config - Retry configuration
 * @returns Promise resolving to retry result
 * 
 * @throws {Error} If all retry attempts fail
 * 
 * @example
 * ```typescript
 * const result = await retry(
 *   async () => {
 *     return await fetch('https://api.example.com/data')
 *   },
 *   {
 *     maxAttempts: 3,
 *     initialDelay: 1000,
 *     backoffMultiplier: 2,
 *     onRetry: (error, attempt) => {
 *       console.log(`Retry attempt ${attempt}: ${error.message}`)
 *     }
 *   }
 * )
 * 
 * console.log(`Success after ${result.attempts} attempts`)
 * ```
 */
export async function retry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<RetryResult<T>> {
  const cfg: Required<RetryConfig> = {
    maxAttempts: config.maxAttempts ?? 3,
    initialDelay: config.initialDelay ?? 1000,
    maxDelay: config.maxDelay ?? 30000,
    backoffMultiplier: config.backoffMultiplier ?? 2,
    jitter: config.jitter ?? true,
    onRetry: config.onRetry ?? (() => {}),
    shouldRetry: config.shouldRetry ?? isRetryableError,
  }

  const startTime = Date.now()
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= cfg.maxAttempts; attempt++) {
    try {
      const result = await fn()
      
      return {
        result,
        attempts: attempt,
        totalTime: Date.now() - startTime,
        success: true,
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (attempt === cfg.maxAttempts) {
        break
      }

      if (!cfg.shouldRetry(lastError)) {
        throw lastError
      }

      const delay = calculateDelay(attempt, cfg)
      cfg.onRetry(lastError, attempt, delay)

      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw new Error(
    `Operation failed after ${cfg.maxAttempts} attempts: ${lastError?.message || 'Unknown error'}`
  )
}

/**
 * Retry with timeout
 * 
 * @param fn - Function to retry
 * @param timeoutMs - Timeout in milliseconds
 * @param config - Retry configuration
 * @returns Promise resolving to retry result
 * 
 * @throws {Error} If operation times out or all retries fail
 */
export async function retryWithTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  config: RetryConfig = {}
): Promise<RetryResult<T>> {
  return Promise.race([
    retry(fn, config),
    new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Operation timed out after ${timeoutMs}ms`))
      }, timeoutMs)
    }),
  ])
}

/**
 * Circuit breaker for failing operations
 */
export class CircuitBreaker {
  private failureCount = 0
  private lastFailureTime = 0
  private state: 'closed' | 'open' | 'half-open' = 'closed'

  constructor(
    private config: {
      failureThreshold: number
      resetTimeout: number
      monitoringPeriod: number
    }
  ) {}

  /**
   * Execute operation through circuit breaker
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.config.resetTimeout) {
        this.state = 'half-open'
      } else {
        throw new Error('Circuit breaker is open')
      }
    }

    try {
      const result = await fn()

      if (this.state === 'half-open') {
        this.reset()
      }

      return result
    } catch (error) {
      this.recordFailure()
      throw error
    }
  }

  private recordFailure(): void {
    this.failureCount++
    this.lastFailureTime = Date.now()

    if (this.failureCount >= this.config.failureThreshold) {
      this.state = 'open'
    }
  }

  private reset(): void {
    this.failureCount = 0
    this.lastFailureTime = 0
    this.state = 'closed'
  }

  /**
   * Get current circuit breaker state
   */
  getState(): 'closed' | 'open' | 'half-open' {
    return this.state
  }

  /**
   * Force circuit breaker to open state
   */
  forceOpen(): void {
    this.state = 'open'
    this.lastFailureTime = Date.now()
  }

  /**
   * Force circuit breaker to reset
   */
  forceReset(): void {
    this.reset()
  }
}
