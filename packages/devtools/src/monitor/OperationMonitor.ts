/**
 * Operation monitor for DevTools
 * 
 * @packageDocumentation
 */

/**
 * Operation type
 */
export type OperationType = 'encrypt' | 'decrypt' | 'transaction' | 'contract-read' | 'contract-write'

/**
 * Operation record
 */
export interface OperationRecord {
  /**
   * Operation ID
   */
  id: string

  /**
   * Operation type
   */
  type: OperationType

  /**
   * Timestamp when operation started
   */
  timestamp: number

  /**
   * Duration in milliseconds (if completed)
   */
  duration?: number

  /**
   * Operation status
   */
  status: 'pending' | 'success' | 'failed'

  /**
   * Operation data
   */
  data?: unknown

  /**
   * Error if failed
   */
  error?: string
}

/**
 * Monitor statistics
 */
export interface MonitorStats {
  total: number
  successful: number
  failed: number
  avgDuration: number
  byType: Record<OperationType, number>
}

/**
 * Operation Monitor class
 * 
 * @example
 * ```typescript
 * import { OperationMonitor } from '@mixaspro/devtools'
 * 
 * const monitor = new OperationMonitor()
 * 
 * // Record encryption
 * const id = monitor.startOperation('encrypt', { value: 42 })
 * await encrypt(42)
 * monitor.completeOperation(id, { handle: '0x...' })
 * 
 * // Get stats
 * const stats = monitor.getStats()
 * console.log(`Success rate: ${stats.successful / stats.total * 100}%`)
 * ```
 */
export class OperationMonitor {
  private operations: Map<string, OperationRecord> = new Map()
  private maxRecords: number

  constructor(maxRecords = 1000) {
    this.maxRecords = maxRecords
  }

  /**
   * Start tracking an operation
   * 
   * @param type - Operation type
   * @param data - Operation data
   * @returns Operation ID
   */
  startOperation(type: OperationType, data?: unknown): string {
    const id = `op-${Date.now()}-${Math.random().toString(36).slice(2)}`
    
    const record: OperationRecord = {
      id,
      type,
      timestamp: Date.now(),
      status: 'pending',
      data,
    }

    this.operations.set(id, record)
    this.evictOldRecords()
    
    return id
  }

  /**
   * Mark operation as completed
   * 
   * @param id - Operation ID
   * @param result - Operation result
   */
  completeOperation(id: string, result?: unknown): void {
    const record = this.operations.get(id)
    
    if (record === null || record === undefined) {
      return
    }

    record.status = 'success'
    record.duration = Date.now() - record.timestamp
    record.data = result
    
    this.operations.set(id, record)
  }

  /**
   * Mark operation as failed
   * 
   * @param id - Operation ID
   * @param error - Error message or object
   */
  failOperation(id: string, error: string | Error): void {
    const record = this.operations.get(id)
    
    if (record === null || record === undefined) {
      return
    }

    record.status = 'failed'
    record.duration = Date.now() - record.timestamp
    record.error = error instanceof Error ? error.message : error
    
    this.operations.set(id, record)
  }

  /**
   * Get operation by ID
   * 
   * @param id - Operation ID
   * @returns Operation record or undefined
   */
  getOperation(id: string): OperationRecord | undefined {
    return this.operations.get(id)
  }

  /**
   * Get all operations
   * 
   * @param filter - Optional filter by type or status
   * @returns Array of operations
   */
  getOperations(filter?: {
    type?: OperationType
    status?: 'pending' | 'success' | 'failed'
  }): OperationRecord[] {
    const ops = Array.from(this.operations.values())
    
    if (filter === null || filter === undefined) {
      return ops
    }

    return ops.filter((op) => {
      if (filter.type !== null && filter.type !== undefined && op.type !== filter.type) {
        return false
      }
      if (filter.status !== null && filter.status !== undefined && op.status !== filter.status) {
        return false
      }
      return true
    })
  }

  /**
   * Get statistics
   * 
   * @returns Monitor statistics
   */
  getStats(): MonitorStats {
    const operations = Array.from(this.operations.values())
    
    const successful = operations.filter((op) => op.status === 'success')
    const failed = operations.filter((op) => op.status === 'failed')
    
    const totalDuration = successful.reduce((sum, op) => sum + (op.duration ?? 0), 0)
    const avgDuration = successful.length > 0 ? totalDuration / successful.length : 0
    
    const byType: Record<OperationType, number> = {
      encrypt: 0,
      decrypt: 0,
      transaction: 0,
      'contract-read': 0,
      'contract-write': 0,
    }
    
    operations.forEach((op) => {
      byType[op.type]++
    })

    return {
      total: operations.length,
      successful: successful.length,
      failed: failed.length,
      avgDuration,
      byType,
    }
  }

  /**
   * Clear all operations
   */
  clear(): void {
    this.operations.clear()
  }

  /**
   * Evict old records if exceeding max
   */
  private evictOldRecords(): void {
    if (this.operations.size <= this.maxRecords) {
      return
    }

    const operations = Array.from(this.operations.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp)
    
    const toRemove = operations.slice(0, operations.length - this.maxRecords)
    
    toRemove.forEach(([id]) => {
      this.operations.delete(id)
    })
  }
}
