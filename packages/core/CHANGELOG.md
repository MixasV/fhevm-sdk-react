# @fhevm-sdk/core

## 1.0.0 (2025-10-31)

### Features

**Core Functionality:**
- ✨ Full FHEVM encryption/decryption support
- 🔐 Wallet integration (MetaMask, WalletConnect compatible)
- 📝 Smart contract interactions with encrypted parameters
- 🎯 Type-safe API with TypeScript strict mode

**Advanced Features:**
- ⚡ Transaction Queue with priority and retry logic
- 💾 Encryption Cache with TTL and LRU eviction
- 🔄 Operation Batching for improved performance
- 🛡️ Circuit Breaker pattern for resilience
- 📊 Performance benchmarking utilities
- 🔁 Advanced retry strategies with exponential backoff

**Developer Experience:**
- 📦 Tree-shakeable ESM/CJS builds
- 📘 Complete TypeScript type definitions
- 📖 Comprehensive JSDoc documentation
- 🧪 100+ unit tests with 80% coverage

### Bundle Size

- **ESM**: 37.34 KB
- **CJS**: 37.96 KB
- **Types**: 27.94 KB

### Breaking Changes

None (initial release)

### Security

- ⚠️ Known dependency vulnerability in `bigint-buffer` (from fhevmjs)
  - Impact: Minimal (not directly used)
  - Status: Tracking upstream fix
  - See: [SECURITY.md](../../docs/SECURITY.md)

### Documentation

- [Core API Reference](../../docs/api/CORE_API.md)
- [Performance Guide](../../docs/PERFORMANCE.md)
- [Security Guide](../../docs/SECURITY.md)
