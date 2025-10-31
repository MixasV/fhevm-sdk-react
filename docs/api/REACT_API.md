# React API Reference

## FHEVMProvider

Context provider for FHEVM.

### Props
- `config: FHEVMConfig` - FHEVM configuration
- `autoInit?: boolean` - Auto-initialize (default: true)
- `autoConnect?: boolean` - Auto-connect wallet (default: false)

### Example
```tsx
<FHEVMProvider config={{ chainId: 31337 }}>
  <App />
</FHEVMProvider>
```

## Hooks

### useFHEVM()
Access FHEVM context.

**Returns:** `FHEVMContextValue`

### useWallet()
Manage wallet connection.

**Returns:**
- `wallet: WalletInfo | null`
- `connect(provider): Promise<WalletInfo>`
- `disconnect(): void`
- `isConnecting: boolean`
- `isConnected: boolean`

### useEncrypt()
Encrypt values with loading states.

**Returns:**
- `encrypt(value, type, options?): Promise<EncryptedValue>`
- `isEncrypting: boolean`
- `error: Error | null`
- `data: EncryptedValue | null`

### useDecrypt()
Decrypt ciphertexts with polling.

**Returns:**
- `decrypt(ciphertext, timeout?): Promise<unknown>`
- `isDecrypting: boolean`
- `error: Error | null`
- `data: unknown | null`

### useReadEncrypted(params)
Read encrypted contract state.

**Params:**
- `address: string`
- `abi: any[]`
- `functionName: string`
- `args?: unknown[]`
- `enabled?: boolean`
- `pollingInterval?: number`

**Returns:**
- `data: T | null`
- `isLoading: boolean`
- `error: Error | null`
- `refetch(): Promise<T>`

### useWriteEncrypted(params)
Write encrypted contract state.

**Params:**
- `address: string`
- `abi: any[]`
- `functionName: string`

**Returns:**
- `write(params?): Promise<TransactionReceipt>`
- `isWriting: boolean`
- `error: Error | null`
- `data: TransactionReceipt | null`
