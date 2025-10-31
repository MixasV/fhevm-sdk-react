/**
 * Operation batcher for optimizing bulk operations
 * 
 * @packageDocumentation
 */

/**
 * Batch operation configuration
 */
export interface BatcherConfig {
  /**
   * Maximum batch size
   */
  maxBatchSize?: number

  /**
   * Maximum wait time before processing batch (ms)
   */
  maxWaitTime?: number

  /**
   * Minimum batch size to trigger processing
   */
  minBatchSize?: number
}

/**
 * Batch item with promise resolvers
 */
interface BatchItem<T, R> {
  item: T
  resolve: (value: R) => void
  reject: (error: Error) => void
  timestamp: number
}

/**
 * Operation batcher for combining multiple async operations
 * 
 * @example
 * ```typescript
 * const batcher = new OperationBatcher<number, EncryptedValue>(
 *   async (values) => {
 *     return Promise.all(values.map(v => client.encrypt(v, 'euint32')))
 *   },
 *   { maxBatchSize: 10, maxWaitTime: 100 }
 * )
 * 
 * // These will be batched together
 * const result1 = batcher.add(42)
 * const result2 = batcher.add(100)
 * const result3 = batcher.add(200)
 * 
 * const [encrypted1, encrypted2, encrypted3] = await Promise.all([result1, result2, result3])
 * ```
 */
export class OperationBatcher<T, R> {
  private config: Required<BatcherConfig>
  private queue: BatchItem<T, R>[] = []
  private timer: ReturnType<typeof setTimeout> | null = null
  private processor: (items: T[]) => Promise<R[]>
  private isProcessing = false

  constructor(processor: (items: T[]) => Promise<R[]>, config: BatcherConfig = {}) {
    this.processor = processor
    this.config = {
      maxBatchSize: config.maxBatchSize ?? 50,
      maxWaitTime: config.maxWaitTime ?? 100,
      minBatchSize: config.minBatchSize ?? 1,
    }
  }

  /**
   * Add item to batch
   * 
   * @param item - Item to process
   * @returns Promise that resolves when item is processed
   */
  add(item: T): Promise<R> {
    return new Promise((resolve, reject) => {
      this.queue.push({
        item,
        resolve,
        reject,
        timestamp: Date.now(),
      })

      if (this.queue.length >= this.config.maxBatchSize) {
        this.processBatch()
      } else if (!this.timer) {
        this.timer = setTimeout(() => {
          this.processBatch()
        }, this.config.maxWaitTime)
      }
    })
  }

  /**
   * Process current batch
   */
  private async processBatch(): Promise<void> {
    if (this.isProcessing) {
      return
    }

    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }

    if (this.queue.length === 0) {
      return
    }

    if (this.queue.length < this.config.minBatchSize) {
      const oldestItem = this.queue[0]
      if (!oldestItem) {
        return
      }
      const waitTime = Date.now() - oldestItem.timestamp
      
      if (waitTime < this.config.maxWaitTime) {
        this.timer = setTimeout(() => {
          this.processBatch()
        }, this.config.maxWaitTime - waitTime)
        return
      }
    }

    this.isProcessing = true
    const batch = this.queue.splice(0, this.config.maxBatchSize)

    try {
      const items = batch.map((b) => b.item)
      const results = await this.processor(items)

      if (results.length !== batch.length) {
        throw new Error(
          `Batch processor returned ${results.length} results but expected ${batch.length}`
        )
      }

      batch.forEach((item, index) => {
        const result = results[index]
        if (result === undefined) {
          throw new Error(`Result at index ${index} is undefined`)
        }
        item.resolve(result)
      })
    } catch (error) {
      batch.forEach((item) => {
        item.reject(error instanceof Error ? error : new Error('Batch processing failed'))
      })
    } finally {
      this.isProcessing = false

      if (this.queue.length > 0) {
        setImmediate(() => this.processBatch())
      }
    }
  }

  /**
   * Flush remaining items immediately
   */
  async flush(): Promise<void> {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }

    while (this.queue.length > 0) {
      await this.processBatch()
    }
  }

  /**
   * Get current queue size
   */
  getQueueSize(): number {
    return this.queue.length
  }

  /**
   * Clear queue and reject all pending items
   */
  clear(): void {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }

    const error = new Error('Batcher cleared')
    this.queue.forEach((item) => {
      item.reject(error)
    })

    this.queue = []
  }
}
