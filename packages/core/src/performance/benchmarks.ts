/**
 * Performance benchmarks for FHEVM SDK
 * 
 * @packageDocumentation
 */

/**
 * Benchmark result interface
 */
export interface BenchmarkResult {
  /**
   * Operation name
   */
  operation: string

  /**
   * Number of iterations
   */
  iterations: number

  /**
   * Total time in milliseconds
   */
  totalTime: number

  /**
   * Average time per operation in milliseconds
   */
  avgTime: number

  /**
   * Operations per second
   */
  opsPerSecond: number

  /**
   * Memory usage in bytes (if available)
   */
  memoryUsed?: number
}

/**
 * Run benchmark for an async operation
 * 
 * @param name - Operation name
 * @param fn - Function to benchmark
 * @param iterations - Number of iterations (default: 100)
 * @returns Benchmark result
 * 
 * @example
 * ```typescript
 * const result = await benchmark('encryption', async () => {
 *   await client.encrypt(42, 'euint32')
 * }, 1000)
 * 
 * console.log(`Avg time: ${result.avgTime}ms`)
 * console.log(`Throughput: ${result.opsPerSecond} ops/sec`)
 * ```
 */
export async function benchmark(
  name: string,
  fn: () => Promise<void>,
  iterations = 100
): Promise<BenchmarkResult> {
  const startMemory = getMemoryUsage()
  const startTime = performance.now()

  for (let i = 0; i < iterations; i++) {
    await fn()
  }

  const endTime = performance.now()
  const endMemory = getMemoryUsage()

  const totalTime = endTime - startTime
  const avgTime = totalTime / iterations
  const opsPerSecond = (iterations / totalTime) * 1000

  return {
    operation: name,
    iterations,
    totalTime,
    avgTime,
    opsPerSecond,
    memoryUsed: endMemory !== null && startMemory !== null ? endMemory - startMemory : undefined,
  }
}

/**
 * Run benchmark for a sync operation
 * 
 * @param name - Operation name
 * @param fn - Function to benchmark
 * @param iterations - Number of iterations
 * @returns Benchmark result
 */
export function benchmarkSync(
  name: string,
  fn: () => void,
  iterations = 10000
): BenchmarkResult {
  const startMemory = getMemoryUsage()
  const startTime = performance.now()

  for (let i = 0; i < iterations; i++) {
    fn()
  }

  const endTime = performance.now()
  const endMemory = getMemoryUsage()

  const totalTime = endTime - startTime
  const avgTime = totalTime / iterations
  const opsPerSecond = (iterations / totalTime) * 1000

  return {
    operation: name,
    iterations,
    totalTime,
    avgTime,
    opsPerSecond,
    memoryUsed: endMemory !== null && startMemory !== null ? endMemory - startMemory : undefined,
  }
}

/**
 * Compare two benchmark results
 * 
 * @param baseline - Baseline result
 * @param current - Current result
 * @returns Comparison statistics
 * 
 * @example
 * ```typescript
 * const baseline = await benchmark('old', oldFn)
 * const current = await benchmark('new', newFn)
 * const comparison = compareBenchmarks(baseline, current)
 * 
 * console.log(`Speedup: ${comparison.speedup}x`)
 * ```
 */
export function compareBenchmarks(
  baseline: BenchmarkResult,
  current: BenchmarkResult
): {
  speedup: number
  percentFaster: number
  timeDiff: number
} {
  const speedup = baseline.avgTime / current.avgTime
  const percentFaster = ((baseline.avgTime - current.avgTime) / baseline.avgTime) * 100
  const timeDiff = baseline.avgTime - current.avgTime

  return {
    speedup,
    percentFaster,
    timeDiff,
  }
}

/**
 * Format benchmark result for display
 * 
 * @param result - Benchmark result
 * @returns Formatted string
 */
export function formatBenchmark(result: BenchmarkResult): string {
  return `
Operation: ${result.operation}
Iterations: ${result.iterations}
Total Time: ${result.totalTime.toFixed(2)}ms
Avg Time: ${result.avgTime.toFixed(4)}ms
Throughput: ${result.opsPerSecond.toFixed(0)} ops/sec
${result.memoryUsed !== undefined ? `Memory: ${(result.memoryUsed / 1024 / 1024).toFixed(2)}MB` : ''}
`.trim()
}

/**
 * Get current memory usage
 */
function getMemoryUsage(): number | null {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    return process.memoryUsage().heapUsed
  }
  
  if (typeof performance !== 'undefined' && (performance as any).memory) {
    return (performance as any).memory.usedJSHeapSize
  }
  
  return null
}
