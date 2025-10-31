# Security

## Known Vulnerabilities

### bigint-buffer (HIGH)
- **Status**: Dependency of fhevmjs@0.5.8
- **Impact**: Buffer overflow in toBigIntLE() function
- **Mitigation**: Not directly used by SDK, waiting for fhevmjs update
- **Tracking**: https://github.com/advisories/GHSA-3gc7-fjrx-p6mg

## Security Best Practices

### 1. Never Expose Private Keys

```typescript
// ❌ Bad
const privateKey = '0x1234...'

// ✅ Good
const privateKey = process.env.PRIVATE_KEY
if (!privateKey) throw new Error('Missing PRIVATE_KEY')
```

### 2. Validate All Inputs

```typescript
import { isValidAddress, isValidEncryptedType } from '@fhevm-sdk/core'

if (!isValidAddress(contractAddress)) {
  throw new Error('Invalid contract address')
}

if (!isValidEncryptedType(type)) {
  throw new Error('Invalid encryption type')
}
```

### 3. Use Circuit Breaker for External Calls

```typescript
const breaker = new CircuitBreaker({
  failureThreshold: 3,
  resetTimeout: 60000
})

await breaker.execute(async () => {
  return await externalApiCall()
})
```

### 4. Implement Rate Limiting

```typescript
const queue = new TransactionQueue({
  rateLimit: 100, // Max 100ms between transactions
  maxConcurrent: 2
})
```

### 5. Sanitize User Input

```typescript
function sanitizeValue(value: unknown): number {
  if (typeof value !== 'number') {
    throw new ValidationError('Value must be number')
  }
  
  if (!Number.isFinite(value)) {
    throw new ValidationError('Value must be finite')
  }
  
  return value
}
```

## Reporting Security Issues

Please report security vulnerabilities to: security@fhevm-sdk.dev

**Do not** open public GitHub issues for security vulnerabilities.
