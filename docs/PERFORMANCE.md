# Performance Optimization Guide

## Bundle Sizes

Current production bundle sizes (gzipped):

- **@fhevm-sdk/core**: 28.47 KB (target: <30KB) ✅
- **@fhevm-sdk/react**: 9.45 KB (target: <10KB) ✅
- **@fhevm-sdk/svelte**: 5.61 KB (target: <8KB) ✅
- **@fhevm-sdk/cli**: 20.89 KB ✅

## Best Practices

### 1. Use Operation Batching

Batch multiple encryption operations together:

```typescript
import { OperationBatcher } from '@fhevm-sdk/core'

const batcher = new OperationBatcher(
  async (values) => {
    return Promise.all(values.map(v => client.encrypt(v, 'euint32')))
  },
  { maxBatchSize: 10, maxWaitTime: 100 }
)

// These will be batched automatically
const [r1, r2, r3] = await Promise.all([
  batcher.add(42),
  batcher.add(100),
  batcher.add(200)
])
```

### 2. Enable Caching

```typescript
import { EncryptionCache } from '@fhevm-sdk/core'

const cache = new EncryptionCache({
  maxSize: 1000,
  defaultTTL: 3600000 // 1 hour
})

// Cache encrypted values
cache.set('balance', encryptedValue)
const cached = cache.get('balance')
```

### 3. Use Retry with Circuit Breaker

```typescript
import { retry, CircuitBreaker } from '@fhevm-sdk/core'

const breaker = new CircuitBreaker({
  failureThreshold: 3,
  resetTimeout: 60000,
  monitoringPeriod: 10000
})

const result = await breaker.execute(async () => {
  return await retry(
    async () => client.decrypt(ciphertext),
    { maxAttempts: 3, initialDelay: 1000 }
  )
})
```

### 4. Optimize React Hooks

Use selective hooks instead of full context:

```typescript
// Good - only subscribes to wallet changes
const { wallet } = useWallet()

// Avoid - subscribes to all FHEVM context changes
const context = useFHEVM()
```

## Benchmarking

```typescript
import { benchmark } from '@fhevm-sdk/core'

const result = await benchmark(
  'encryption',
  async () => {
    await client.encrypt(42, 'euint32')
  },
  1000
)

console.log(`Avg: ${result.avgTime}ms`)
console.log(`Throughput: ${result.opsPerSecond} ops/sec`)
```

## Memory Management

- Clear encryption cache periodically
- Cancel pending transactions when unmounting
- Use weak references for large objects

## Network Optimization

- Batch RPC calls when possible
- Use WebSocket for real-time updates
- Implement request deduplication
