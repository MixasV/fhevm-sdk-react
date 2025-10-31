# @fhevm-sdk/svelte

## 1.0.0 (2025-10-31)

### Features

**Svelte Integration:**
- 🎨 Reactive stores for FHEVM operations
- 📦 4 production-ready stores:
  - `fhevmStore` - Core FHEVM state
  - `encryptionStore` - Encryption operations
  - `decryptionStore` - Decryption operations  
  - `contractsStore` - Contract interactions

**Helper Functions:**
- `initializeFHEVM()` - Initialize FHEVM client
- `connectWallet()` - Connect wallet
- `encrypt()` - Encrypt values
- `decrypt()` - Decrypt ciphertexts
- `readContract()` - Read encrypted state
- `writeContract()` - Write encrypted state

### Bundle Size

- **ESM**: 5.61 KB
- **CJS**: 6.37 KB

### Peer Dependencies

- `svelte`: ^4.0.0
- `@fhevm-sdk/core`: ^1.0.0
- `ethers`: ^6.0.0

### Examples

- [Svelte Voting Example](../../examples/svelte-voting)
