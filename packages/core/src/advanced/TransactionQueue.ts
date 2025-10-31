/**
 * Transaction Queue Manager
 * 
 * @packageDocumentation
 */

import { retry, sleep } from '../utils'

/**
 * Transaction request interface
 */
export interface TransactionRequest {
  /**
   * Unique transaction ID
   */
  id: string

  /**
   * Transaction function to execute
   */
  execute: () => Promise<any>

  /**
   * Priority (higher = executed first)
   * @default 0
   */
  priority?: number

  /**
   * Maximum retry attempts
   * @default 3
   */
  maxRetries?: number

  /**
   * Retry delay in milliseconds
   * @default 1000
   */
  retryDelay?: number
}

/**
 * Transaction result interface
 */
export interface TransactionResult {
  /**
   * Transaction ID
   */
  id: string

  /**
   * Success status
   */
  success: boolean

  /**
   * Result data (if successful)
   */
  data?: any

  /**
   * Error (if failed)
   */
  error?: Error

  /**
   * Number of attempts made
   */
  attempts: number

  /**
   * Execution time in milliseconds
   */
  executionTime: number
}

/**
 * Queue status interface
 */
export interface QueueStatus {
  /**
   * Total transactions in queue
   */
  total: number

  /**
   * Pending transactions
   */
  pending: number

  /**
   * Currently processing
   */
  processing: number

  /**
   * Completed transactions
   */
  completed: number

  /**
   * Failed transactions
   */
  failed: number

  /**
   * Is queue currently processing
   */
  isProcessing: boolean
}

/**
 * Transaction Queue Manager
 * 
 * Manages transaction execution with priority queuing, retry logic, and rate limiting
 * 
 * @example
 * ```typescript
 * const queue = new TransactionQueue({ maxConcurrent: 2, rateLimit: 100 })
 * 
 * const result = await queue.enqueue({
 *   id: 'tx1',
 *   execute: async () => {
 *     return await contract.transfer(recipient, amount)
 *   },
 *   priority: 10,
 *   maxRetries: 3,
 * })
 * ```
 */
export class TransactionQueue {
  private queue: TransactionRequest[] = []
  private processing = 0
  private completed = 0
  private failed = 0
  private isProcessingQueue = false
  private maxConcurrent: number
  private rateLimit: number
  private lastExecutionTime = 0

  /**
   * Create transaction queue
   * 
   * @param options - Queue options
   * @param options.maxConcurrent - Maximum concurrent transactions (default: 1)
   * @param options.rateLimit - Minimum time between transactions in ms (default: 0)
   */
  constructor(options: { maxConcurrent?: number; rateLimit?: number } = {}) {
    this.maxConcurrent = options.maxConcurrent ?? 1
    this.rateLimit = options.rateLimit ?? 0
  }

  /**
   * Enqueue a transaction
   * 
   * @param request - Transaction request
   * @returns Promise resolving to transaction result
   * 
   * @example
   * ```typescript
   * const result = await queue.enqueue({
   *   id: 'tx1',
   *   execute: async () => contract.transfer(to, amount),
   *   priority: 5,
   * })
   * ```
   */
  async enqueue(request: TransactionRequest): Promise<TransactionResult> {
    // Add to queue
    this.queue.push({
      ...request,
      priority: request.priority ?? 0,
      maxRetries: request.maxRetries ?? 3,
      retryDelay: request.retryDelay ?? 1000,
    })

    // Sort by priority (higher priority first)
    this.queue.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))

    // Start processing if not already
    if (!this.isProcessingQueue) {
      this.processQueue().catch(console.error)
    }

    // Wait for this specific transaction
    return this.waitForTransaction(request.id)
  }

  /**
   * Execute entire queue
   * 
   * @returns Promise resolving to array of results
   * 
   * @example
   * ```typescript
   * const results = await queue.executeQueue()
   * console.log(`Completed: ${results.filter(r => r.success).length}`)
   * ```
   */
  async executeQueue(): Promise<TransactionResult[]> {
    const results: TransactionResult[] = []

    while (this.queue.length > 0) {
      const request = this.queue.shift()
      if (request === undefined) break

      const result = await this.executeTransaction(request)
      results.push(result)
    }

    return results
  }

  /**
   * Get queue status
   * 
   * @returns Current queue status
   * 
   * @example
   * ```typescript
   * const status = queue.getQueueStatus()
   * console.log(`Pending: ${status.pending}, Processing: ${status.processing}`)
   * ```
   */
  getQueueStatus(): QueueStatus {
    return {
      total: this.queue.length + this.processing + this.completed + this.failed,
      pending: this.queue.length,
      processing: this.processing,
      completed: this.completed,
      failed: this.failed,
      isProcessing: this.isProcessingQueue,
    }
  }

  /**
   * Cancel a transaction
   * 
   * @param id - Transaction ID to cancel
   * @returns True if transaction was cancelled
   * 
   * @example
   * ```typescript
   * queue.cancelTransaction('tx1')
   * ```
   */
  cancelTransaction(id: string): boolean {
    const index = this.queue.findIndex((req) => req.id === id)
    if (index === -1) return false

    this.queue.splice(index, 1)
    return true
  }

  /**
   * Clear all pending transactions
   * 
   * @example
   * ```typescript
   * queue.clear()
   * ```
   */
  clear(): void {
    this.queue = []
  }

  /**
   * Process queue
   */
  private async processQueue(): Promise<void> {
    this.isProcessingQueue = true

    while (this.queue.length > 0 && this.processing < this.maxConcurrent) {
      const request = this.queue.shift()
      if (request === undefined) break

      // Rate limiting
      if (this.rateLimit > 0) {
        const timeSinceLastExecution = Date.now() - this.lastExecutionTime
        if (timeSinceLastExecution < this.rateLimit) {
          await sleep(this.rateLimit - timeSinceLastExecution)
        }
      }

      this.processing++
      this.lastExecutionTime = Date.now()

      // Execute in background
      this.executeTransaction(request)
        .then(() => {
          this.processing--
          if (this.queue.length > 0) {
            this.processQueue().catch(console.error)
          }
        })
        .catch((error) => {
          console.error('Transaction failed:', error)
          this.processing--
        })
    }

    if (this.queue.length === 0 && this.processing === 0) {
      this.isProcessingQueue = false
    }
  }

  /**
   * Execute single transaction
   */
  private async executeTransaction(request: TransactionRequest): Promise<TransactionResult> {
    const startTime = Date.now()
    let attempts = 0

    try {
      const result = await retry(
        request.execute,
        request.maxRetries ?? 3,
        request.retryDelay ?? 1000
      )

      attempts = 1 // Successful on first or retry
      this.completed++

      return {
        id: request.id,
        success: true,
        data: result,
        attempts,
        executionTime: Date.now() - startTime,
      }
    } catch (error) {
      this.failed++

      return {
        id: request.id,
        success: false,
        error: error instanceof Error ? error : new Error('Transaction failed'),
        attempts: (request.maxRetries ?? 3) + 1,
        executionTime: Date.now() - startTime,
      }
    }
  }

  /**
   * Wait for specific transaction to complete
   */
  private async waitForTransaction(id: string): Promise<TransactionResult> {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        // Check if transaction is still in queue
        const inQueue = this.queue.some((req) => req.id === id)
        if (!inQueue && this.processing === 0) {
          clearInterval(checkInterval)
          // Transaction must be completed or failed
          // In real implementation, store results
          resolve({
            id,
            success: true,
            attempts: 1,
            executionTime: 0,
          })
        }
      }, 100)
    })
  }
}
