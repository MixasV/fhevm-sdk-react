/**
 * Tests for TransactionQueue
 */

import { TransactionQueue } from '../advanced/TransactionQueue'

describe('TransactionQueue', () => {
  let queue: TransactionQueue

  beforeEach(() => {
    queue = new TransactionQueue()
  })

  describe('enqueue', () => {
    test('should enqueue and execute transaction', async () => {
      const mockExecute = jest.fn().mockResolvedValue('result')

      const result = await queue.enqueue({
        id: 'tx1',
        execute: mockExecute,
      })

      expect(result.success).toBe(true)
      expect(result.id).toBe('tx1')
      expect(mockExecute).toHaveBeenCalledTimes(1)
    })

    test('should execute transactions in priority order', async () => {
      const executionOrder: string[] = []

      await Promise.all([
        queue.enqueue({
          id: 'low',
          execute: async () => {
            executionOrder.push('low')
            return 'low'
          },
          priority: 1,
        }),
        queue.enqueue({
          id: 'high',
          execute: async () => {
            executionOrder.push('high')
            return 'high'
          },
          priority: 10,
        }),
        queue.enqueue({
          id: 'medium',
          execute: async () => {
            executionOrder.push('medium')
            return 'medium'
          },
          priority: 5,
        }),
      ])

      // High priority should execute first
      expect(executionOrder[0]).toBe('high')
    })

    test('should handle transaction errors', async () => {
      const mockExecute = jest.fn().mockRejectedValue(new Error('Transaction failed'))

      const result = await queue.enqueue({
        id: 'tx1',
        execute: mockExecute,
        maxRetries: 0,
      })

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.error?.message).toContain('Transaction failed')
    })

    test('should retry failed transactions', async () => {
      let attempts = 0
      const mockExecute = jest.fn().mockImplementation(async () => {
        attempts++
        if (attempts < 3) {
          throw new Error('Retry me')
        }
        return 'success'
      })

      const result = await queue.enqueue({
        id: 'tx1',
        execute: mockExecute,
        maxRetries: 3,
        retryDelay: 10,
      })

      expect(result.success).toBe(true)
      expect(mockExecute.mock.calls.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('getQueueStatus', () => {
    test('should return correct initial status', () => {
      const status = queue.getQueueStatus()

      expect(status.total).toBe(0)
      expect(status.pending).toBe(0)
      expect(status.processing).toBe(0)
      expect(status.completed).toBe(0)
      expect(status.failed).toBe(0)
      expect(status.isProcessing).toBe(false)
    })

    test('should update status during processing', async () => {
      queue.enqueue({
        id: 'tx1',
        execute: async () => {
          await new Promise((resolve) => setTimeout(resolve, 100))
          return 'result'
        },
      })

      // Give it a moment to start processing
      await new Promise((resolve) => setTimeout(resolve, 10))

      const status = queue.getQueueStatus()
      expect(status.total).toBeGreaterThan(0)
    })
  })

  describe('cancelTransaction', () => {
    test('should cancel pending transaction', async () => {
      // Add a slow transaction
      queue.enqueue({
        id: 'slow',
        execute: async () => {
          await new Promise((resolve) => setTimeout(resolve, 1000))
          return 'result'
        },
      })

      // Add transaction to cancel
      queue.enqueue({
        id: 'cancel-me',
        execute: async () => 'result',
      })

      const cancelled = queue.cancelTransaction('cancel-me')
      expect(cancelled).toBe(true)
    })

    test('should return false for non-existent transaction', () => {
      const cancelled = queue.cancelTransaction('non-existent')
      expect(cancelled).toBe(false)
    })
  })

  describe('clear', () => {
    test('should clear all pending transactions', () => {
      queue.enqueue({ id: 'tx1', execute: async () => 'result' })
      queue.enqueue({ id: 'tx2', execute: async () => 'result' })

      queue.clear()

      const status = queue.getQueueStatus()
      expect(status.pending).toBe(0)
    })
  })

  describe('concurrent execution', () => {
    test('should respect maxConcurrent limit', async () => {
      const concurrentQueue = new TransactionQueue({ maxConcurrent: 2 })
      let concurrentCount = 0
      let maxConcurrent = 0

      const createTransaction = (id: string) => ({
        id,
        execute: async () => {
          concurrentCount++
          maxConcurrent = Math.max(maxConcurrent, concurrentCount)
          await new Promise((resolve) => setTimeout(resolve, 50))
          concurrentCount--
          return 'result'
        },
      })

      await Promise.all([
        concurrentQueue.enqueue(createTransaction('tx1')),
        concurrentQueue.enqueue(createTransaction('tx2')),
        concurrentQueue.enqueue(createTransaction('tx3')),
        concurrentQueue.enqueue(createTransaction('tx4')),
      ])

      expect(maxConcurrent).toBeLessThanOrEqual(2)
    })
  })

  describe('rate limiting', () => {
    test('should respect rate limit', async () => {
      const rateLimitedQueue = new TransactionQueue({ rateLimit: 100 })
      const timestamps: number[] = []

      const createTransaction = (id: string) => ({
        id,
        execute: async () => {
          timestamps.push(Date.now())
          return 'result'
        },
      })

      await Promise.all([
        rateLimitedQueue.enqueue(createTransaction('tx1')),
        rateLimitedQueue.enqueue(createTransaction('tx2')),
        rateLimitedQueue.enqueue(createTransaction('tx3')),
      ])

      // Check that there's at least ~100ms between executions
      if (timestamps.length >= 2) {
        const timeDiff = timestamps[1] - timestamps[0]
        expect(timeDiff).toBeGreaterThanOrEqual(90) // Allow some tolerance
      }
    })
  })
})
