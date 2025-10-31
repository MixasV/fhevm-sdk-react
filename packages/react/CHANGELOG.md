# @fhevm-sdk/react

## 1.0.0 (2025-10-31)

### Features

**React Integration:**
- ⚛️ FHEVMProvider context provider
- 🪝 6 production-ready hooks:
  - `useFHEVM()` - Access FHEVM context
  - `useWallet()` - Wallet connection management
  - `useEncrypt()` - Encrypt values with loading states
  - `useDecrypt()` - Decrypt ciphertexts with polling
  - `useReadEncrypted()` - Read encrypted contract state
  - `useWriteEncrypted()` - Write encrypted contract state

**Developer Experience:**
- 🎯 Full TypeScript support
- ⚡ Automatic initialization option
- 🔄 Auto-connect wallet support
- 📦 Tree-shakeable build
- 🧪 Comprehensive test coverage

### Bundle Size

- **ESM**: 9.45 KB
- **CJS**: 9.85 KB

### Peer Dependencies

- `react`: ^18.0.0
- `@fhevm-sdk/core`: ^1.0.0
- `ethers`: ^6.0.0

### Examples

- [React Counter Example](../../examples/react-counter)

### Documentation

- [React API Reference](../../docs/api/REACT_API.md)
