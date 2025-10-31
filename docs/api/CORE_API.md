# Core API Reference

## FHEVMClient

Main client for FHEVM operations.

### Methods

#### `initialize(config: FHEVMConfig): Promise<void>`
Initialize FHEVM client with configuration.

**Example:**
```typescript
const client = new FHEVMClient()
await client.initialize({ chainId: 31337 })
```

#### `connectWallet(provider?: Eip1193Provider): Promise<WalletInfo>`
Connect Ethereum wallet.

#### `encrypt(value: number | bigint | boolean, type: EncryptedType, options?: EncryptionOptions): Promise<EncryptedValue>`
Encrypt a value.

#### `requestDecryption(ciphertext: Uint8Array): Promise<DecryptionRequest>`
Request decryption of ciphertext.

#### `waitForDecryption(requestId: string, timeout?: number): Promise<DecryptionResult>`
Wait for decryption result.

#### `executeContract(params: ContractFunctionParams): Promise<TransactionReceipt>`
Execute contract function.

## TransactionQueue

Priority-based transaction queue manager.

### Constructor
```typescript
new TransactionQueue({ maxConcurrent: 2, rateLimit: 100 })
```

### Methods

#### `enqueue(request: TransactionRequest): Promise<TransactionResult>`
Add transaction to queue.

#### `getQueueStatus(): QueueStatus`
Get current queue status.

#### `cancelTransaction(id: string): boolean`
Cancel pending transaction.

## EncryptionCache

In-memory cache for encrypted values.

### Constructor
```typescript
new EncryptionCache({ maxSize: 1000, defaultTTL: 3600000 })
```

### Methods

#### `set(key: string, value: EncryptedValue, ttl?: number): void`
Cache encrypted value.

#### `get(key: string): EncryptedValue | null`
Retrieve cached value.

#### `invalidate(pattern?: string | RegExp): number`
Invalidate matching entries.

#### `getStats(): CacheStats`
Get cache statistics.
