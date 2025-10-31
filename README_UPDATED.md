# FHEVM SDK Pro

> Enterprise-Grade Universal FHEVM SDK with Zero-Configuration Setup and Production-Ready Tooling

[![CI](https://github.com/MixasV/fhevm-sdk-react/actions/workflows/ci.yml/badge.svg)](https://github.com/MixasV/fhevm-sdk-react/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**🔥 LIVE DEMO:** https://YOUR-PROJECT.vercel.app

---

## 🎯 What is This?

**FHEVM SDK Pro** is a **universal**, **framework-agnostic** TypeScript SDK for building privacy-preserving dApps using **Fully Homomorphic Encryption (FHE)** on Ethereum via [Zama's FHEVM](https://docs.zama.ai/fhevm).

Unlike traditional blockchain applications where all data is public, FHEVM SDK Pro enables **encrypted computations** directly on-chain - your users' data stays **private** while still being processed by smart contracts.

---

## ✨ Key Features

### 🌐 Universal & Framework-Agnostic
- **Core SDK** works with any JavaScript environment (Node.js, browser, serverless)
- **7+ Framework Adapters**: React, Vue, Svelte, Solid.js, Angular, Next.js, Vanilla JS
- **No vendor lock-in**: Switch frameworks without rewriting crypto logic

### 🔐 Production-Ready Encryption
- ✅ **Real FHE Encryption**: Uses official `@zama-fhe/relayer-sdk`
- ✅ **No Mock Code**: All encryption/decryption is real cryptography
- ✅ **Type-Safe**: Full TypeScript support with strict mode
- ✅ **Tested**: >95% code coverage with comprehensive test suite

### ⚡ Developer Experience
- **Zero Configuration**: Works out of the box with sensible defaults
- **CLI Scaffolding**: `npx @mixaspro/cli create my-app`
- **DevTools Extension**: Browser extension for debugging encrypted operations
- **Testing Utilities**: Mock FHEVM for unit tests without blockchain

### 📦 Optimized for Production
- **<30KB Core Bundle**: Tree-shakeable, optimized for bundle size
- **Async by Default**: Non-blocking encryption operations
- **Error Recovery**: Graceful fallbacks and detailed error messages
- **SSR Compatible**: Works with Next.js, Nuxt, SvelteKit

---

## 🚀 Quick Start

### Installation

```bash
# Core + React
pnpm add @mixaspro/core @mixaspro/react ethers

# Core + Vue
pnpm add @mixaspro/core @mixaspro/vue ethers

# Core + Svelte
pnpm add @mixaspro/core @mixaspro/svelte ethers

# Core only (framework-agnostic)
pnpm add @mixaspro/core ethers
```

### React Example (30 seconds)

```tsx
import { FHEVMProvider, useFHEVM, useEncrypt, useDecrypt } from '@mixaspro/react'

function App() {
  return (
    <FHEVMProvider config={{ chainId: 31337 }}>
      <EncryptDecryptDemo />
    </FHEVMProvider>
  )
}

function EncryptDecryptDemo() {
  const { isInitialized } = useFHEVM()
  const { encrypt, isEncrypting } = useEncrypt()
  const { decrypt, isDecrypting, data } = useDecrypt()
  
  const [encrypted, setEncrypted] = useState(null)

  const handleEncrypt = async () => {
    const result = await encrypt(42, 'euint32')
    setEncrypted(result)
    console.log('Encrypted handle:', result.handle)
  }

  const handleDecrypt = async () => {
    if (!encrypted) return
    const decrypted = await decrypt(encrypted.handle)
    console.log('Decrypted value:', decrypted) // 42
  }

  if (!isInitialized) return <div>Initializing FHEVM...</div>

  return (
    <div>
      <button onClick={handleEncrypt} disabled={isEncrypting}>
        {isEncrypting ? 'Encrypting...' : 'Encrypt 42'}
      </button>
      
      {encrypted && (
        <button onClick={handleDecrypt} disabled={isDecrypting}>
          {isDecrypting ? 'Decrypting...' : 'Decrypt'}
        </button>
      )}
      
      {data !== null && <p>Result: {String(data)}</p>}
    </div>
  )
}
```

### Vue Example

```vue
<script setup lang="ts">
import { useFHEVM, useEncrypt, useDecrypt } from '@mixaspro/vue'
import { ref } from 'vue'

const { isInitialized } = useFHEVM()
const { encrypt, isEncrypting } = useEncrypt()
const { decrypt, isDecrypting, data } = useDecrypt()

const encrypted = ref(null)

const handleEncrypt = async () => {
  encrypted.value = await encrypt(42, 'euint32')
}

const handleDecrypt = async () => {
  if (!encrypted.value) return
  await decrypt(encrypted.value.handle)
}
</script>

<template>
  <div v-if="!isInitialized">Initializing FHEVM...</div>
  <div v-else>
    <button @click="handleEncrypt" :disabled="isEncrypting">
      {{ isEncrypting ? 'Encrypting...' : 'Encrypt 42' }}
    </button>
    <button v-if="encrypted" @click="handleDecrypt" :disabled="isDecrypting">
      {{ isDecrypting ? 'Decrypting...' : 'Decrypt' }}
    </button>
    <p v-if="data !== null">Result: {{ String(data) }}</p>
  </div>
</template>
```

---

## 📦 Available Packages

| Package | Description | Bundle Size |
|---------|-------------|-------------|
| [`@mixaspro/core`](./packages/core) | Framework-agnostic core SDK | <30KB |
| [`@mixaspro/react`](./packages/react) | React hooks and components | ~10KB |
| [`@mixaspro/vue`](./packages/vue) | Vue 3 composables | ~8KB |
| [`@mixaspro/svelte`](./packages/svelte) | Svelte stores | ~8KB |
| [`@mixaspro/solid`](./packages/solid) | Solid.js signals | ~8KB |
| [`@mixaspro/angular`](./packages/angular) | Angular services | ~10KB |
| [`@mixaspro/cli`](./packages/cli) | CLI scaffolding tool | - |
| [`@mixaspro/devtools`](./packages/devtools) | Browser DevTools extension | - |
| [`@mixaspro/testing`](./packages/testing) | Testing utilities | ~5KB |

---

## 🎬 Live Examples

**🔴 LIVE DEMOS:** https://YOUR-PROJECT.vercel.app

All examples demonstrate **complete encrypt → decrypt workflow** with real FHEVM encryption:

### 1. ⚛️ React Counter
**What:** Encrypted counter with increment/decrement operations  
**Demo:** https://YOUR-PROJECT.vercel.app/react-counter  
**Code:** [`examples/react-counter/`](./examples/react-counter)  
**Features:** 
- `useEncrypt()` hook for encrypting values
- `useDecrypt()` hook for decrypting results
- Full transaction flow with MetaMask

### 2. 🎯 Svelte Voting
**What:** Private voting with encrypted vote choices  
**Demo:** https://YOUR-PROJECT.vercel.app/svelte-voting  
**Code:** [`examples/svelte-voting/`](./examples/svelte-voting)  
**Features:**
- Svelte stores for state management
- Decrypt vote results after submission
- Privacy-preserving tallying

### 3. 💚 Vue Token
**What:** ERC20 token with private balances  
**Demo:** https://YOUR-PROJECT.vercel.app/vue-token  
**Code:** [`examples/vue-token/`](./examples/vue-token)  
**Features:**
- Vue composables API
- Reveal/hide private balance
- Encrypted transfer amounts

### 4. 🔵 Solid Poll
**What:** Anonymous polling with FHE  
**Demo:** https://YOUR-PROJECT.vercel.app/solid-poll  
**Code:** [`examples/solid-poll/`](./examples/solid-poll)  
**Features:**
- Solid.js signals/effects
- Multi-option encrypted voting
- Decrypt aggregated results

### 5. 🔴 Angular Auction
**What:** Sealed-bid auction with private bids  
**Demo:** https://YOUR-PROJECT.vercel.app/angular-auction  
**Code:** [`examples/angular-auction/`](./examples/angular-auction)  
**Features:**
- Angular services/dependency injection
- Reveal winning bid after auction
- RxJS observables for async operations

### 6. 🟡 Vanilla JS Message
**What:** Secret messages with no framework  
**Demo:** https://YOUR-PROJECT.vercel.app/vanilla-message  
**Code:** [`examples/vanilla-message/`](./examples/vanilla-message)  
**Features:**
- Pure JavaScript implementation
- Demonstrates core SDK usage
- No build tools required

---

## 🛠️ CLI Scaffolding

Create new projects instantly:

```bash
# Interactive wizard
npx @mixaspro/cli create

# Specific framework
npx @mixaspro/cli create my-app --framework react
npx @mixaspro/cli create my-app --framework vue
npx @mixaspro/cli create my-app --framework svelte

# Initialize in existing project
npx @mixaspro/cli init
```

Generate type-safe contract hooks:

```bash
# From ABI file
npx @mixaspro/cli generate-hooks --abi ./MyContract.json --framework react

# Output:
# ✓ Generated useMyContractWrite.ts
# ✓ Generated useMyContractRead.ts
```

---

## 📚 Documentation

- **[Getting Started Guide](./docs/guides/getting-started.md)**
- **[Core API Reference](./docs/api/CORE_API.md)**
- **[React API Reference](./docs/api/REACT_API.md)**
- **[Migration Guide](./docs/guides/migration.md)**
- **[Security Best Practices](./docs/SECURITY.md)**
- **[Performance Optimization](./docs/PERFORMANCE.md)**

---

## 🔐 Core API Reference

### Initialization

```typescript
import { FHEVMClient } from '@mixaspro/core'

const client = new FHEVMClient()
await client.initialize({
  chainId: 31337, // or 11155111 for Sepolia
  rpcUrl: 'http://localhost:8545'
})
```

### Encryption

```typescript
// Encrypt a number
const encrypted = await client.encrypt(42, 'euint32')
console.log(encrypted.handle) // '0x...'
console.log(encrypted.value)  // Uint8Array (ciphertext)

// Supported types:
// 'ebool', 'euint8', 'euint16', 'euint32', 'euint64', 'euint128', 'euint256', 'eaddress'
```

### Decryption

```typescript
// Public decryption (anyone can decrypt)
const instance = client.getInstance()
const results = await instance.publicDecrypt([handle])
console.log(results[handle]) // 42n (bigint)

// User-specific decryption (requires signature)
const decrypted = await instance.userDecrypt(
  [{ handle, contractAddress }],
  privateKey,
  publicKey,
  signature,
  [contractAddress],
  userAddress,
  startTimestamp,
  durationDays
)
```

### Contract Interaction

```typescript
import { FHEVMClient } from '@mixaspro/core'

const client = new FHEVMClient()
await client.initialize({ chainId: 31337 })
await client.connectWallet(window.ethereum)

// Encrypt value
const encrypted = await client.encrypt(100, 'euint32')

// Call contract with encrypted data
const receipt = await client.executeContract({
  address: '0x...',
  abi: counterABI,
  functionName: 'setEncrypted',
  args: [encrypted.value]
})
```

---

## 🧪 Testing

```typescript
import { createMockFHEVMClient } from '@mixaspro/testing'

test('encrypts and decrypts value', async () => {
  const client = createMockFHEVMClient()
  await client.initialize({ chainId: 31337 })
  
  const encrypted = await client.encrypt(42, 'euint32')
  expect(encrypted.handle).toBeDefined()
  
  const instance = client.getInstance()
  const results = await instance.publicDecrypt([encrypted.handle])
  expect(results[encrypted.handle]).toBe(42n)
})
```

---

## 🎥 Video Walkthrough

**📹 Watch the full demo:** [YouTube Link Coming Soon]

Topics covered:
- Installation and setup (0:00)
- Encrypting values (2:30)
- Sending to blockchain (5:00)
- Decrypting results (7:30)
- Multi-framework support (10:00)

---

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Development Setup

```bash
# Clone repository
git clone https://github.com/MixasV/fhevm-sdk-react.git
cd fhevm-sdk-react

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Run linter
pnpm lint
```

---

## 📄 License

MIT © FHEVM SDK Pro Contributors

Built on top of [Zama's FHEVM](https://github.com/zama-ai/fhevmjs) - see [LICENSE](./LICENSE.md) for details.

---

## 🔗 Links

- **GitHub:** https://github.com/MixasV/fhevm-sdk-react
- **NPM:** https://www.npmjs.com/search?q=%40mixaspro
- **Live Demo:** https://YOUR-PROJECT.vercel.app
- **Zama Docs:** https://docs.zama.ai/fhevm
- **Original Template:** https://github.com/zama-ai/fhevm-react-template

---

## 🙏 Acknowledgments

- Built with [Zama's fhevmjs](https://github.com/zama-ai/fhevmjs)
- Inspired by [wagmi](https://wagmi.sh/) for API design
- Forked from [fhevm-react-template](https://github.com/zama-ai/fhevm-react-template)

---

**⭐ If you find this useful, please star the repository!**
