# FHEVM SDK Pro - Enhanced Multi-Framework Template

> **🏆 Zama x Linea Bounty Submission**  
> Fork of [fhevm-react-template](https://github.com/zama-ai/fhevm-react-template) with professional multi-framework SDK

## 🚀 What's New?

This enhanced version extends Zama's official React template into a **professional, production-ready, multi-framework FHEVM SDK**.

### ✨ Key Enhancements

#### 1. **Multi-Framework Support** (6 Frameworks!)
- ✅ **React** - Hooks-based API (`useFHEVM`, `useEncrypt`, `useDecrypt`)
- ✅ **Vue 3** - Composables API (`useFHEVM`, `useEncrypt`)
- ✅ **Svelte** - Stores API (`fhevm`, `encryption`)
- ✅ **Solid.js** - Reactive primitives (`useFHEVM`)
- ✅ **Angular** - Services & Dependency Injection
- ✅ **Vanilla JS** - Framework-agnostic core

#### 2. **Official SDK Integration**
- ✅ Uses `@zama-fhe/relayer-sdk@0.2.0` (official Zama SDK)
- ✅ `SepoliaConfig` pre-configured for testnet
- ✅ Automatic public key fetching
- ✅ Proper contract address management

#### 3. **Professional Package Structure**
```
packages/
├── core/              # Framework-agnostic FHEVM client
├── react/             # React hooks & providers
├── vue/               # Vue 3 composables
├── svelte/            # Svelte stores
├── solid/             # Solid.js primitives
├── angular/           # Angular services
├── cli/               # Project scaffolding tool
├── testing/           # Testing utilities
└── devtools/          # Browser devtools extension

examples/
├── react-counter/     # Encrypted counter (React)
├── svelte-voting/     # Private voting system (Svelte)
├── vue-token/         # Encrypted ERC20 (Vue)
├── solid-poll/        # Anonymous polls (Solid.js)
├── angular-auction/   # Blind auction (Angular)
└── vanilla-message/   # Secret messages (Vanilla JS)
```

#### 4. **Live Deployment**
- 🌐 **All 6 examples deployed to Vercel**
- ✅ Global polyfills for browser compatibility
- ✅ Vercel multi-app deployment configuration
- ✅ Production-ready builds

#### 5. **Developer Experience**
- 📚 Comprehensive `ENCRYPT_DECRYPT_GUIDE.md`
- 🔧 Turbo monorepo setup
- ✅ TypeScript strict mode
- ✅ Proper error handling
- ✅ Full type safety

---

## 📦 Installation & Quick Start

### Option A: Use Original Zama Template
```bash
# Clone and setup (as documented in original README.md)
git clone https://github.com/MixasV/fhevm-sdk-react
cd fhevm-sdk-react
git submodule update --init --recursive
pnpm install

# Start Next.js app (original)
pnpm start
```

### Option B: Use Enhanced Multi-Framework SDK
```bash
# Build all packages
pnpm build

# Try React example
cd examples/react-counter
pnpm dev

# Try Vue example
cd examples/vue-token
pnpm dev

# Try Svelte example
cd examples/svelte-voting
pnpm dev
```

---

## 🔐 What is FHEVM?

FHEVM (Fully Homomorphic Encryption Virtual Machine) enables computation on encrypted data directly on Ethereum.

### Why This Matters:
- ✅ **Private DeFi**: Encrypted balances, hidden transaction amounts
- ✅ **Confidential Voting**: Vote without revealing your choice
- ✅ **Sealed-Bid Auctions**: Bids remain private until reveal
- ✅ **Confidential Gaming**: Hidden game state on-chain

---

## 🛠️ SDK Usage

### React Example

```typescript
import { FHEVMProvider, useFHEVM, useEncrypt } from '@mixaspro/react'

function App() {
  return (
    <FHEVMProvider config={{ chainId: 11155111 }}>
      <EncryptionExample />
    </FHEVMProvider>
  )
}

function EncryptionExample() {
  const { client, isReady } = useFHEVM()
  const { encrypt, isEncrypting } = useEncrypt()

  const handleEncrypt = async () => {
    const encrypted = await encrypt(42, 'euint32')
    console.log('Encrypted:', encrypted)
  }

  return (
    <button onClick={handleEncrypt} disabled={!isReady}>
      Encrypt Number
    </button>
  )
}
```

### Vue 3 Example

```vue
<script setup>
import { useFHEVM, useEncrypt } from '@mixaspro/vue'
import { ref } from 'vue'

const { client, isReady } = useFHEVM()
const { encrypt } = useEncrypt()
const value = ref(100)

const handleEncrypt = async () => {
  const encrypted = await encrypt(value.value, 'euint32')
  console.log('Encrypted:', encrypted)
}
</script>

<template>
  <button @click="handleEncrypt" :disabled="!isReady">
    Encrypt {{ value }}
  </button>
</template>
```

### Svelte Example

```svelte
<script>
  import { fhevm, encryption } from '@mixaspro/svelte'

  async function handleEncrypt() {
    const encrypted = await $encryption.encrypt(42, 'euint32')
    console.log('Encrypted:', encrypted)
  }
</script>

<button on:click={handleEncrypt} disabled={!$fhevm.isReady}>
  Encrypt Number
</button>
```

---

## 🎯 Key Features of Enhanced SDK

### 1. Framework-Agnostic Core (`@mixaspro/core`)
- ✅ No framework dependencies
- ✅ Full TypeScript support
- ✅ Works in Node.js and browser
- ✅ Comprehensive error handling

### 2. React Integration (`@mixaspro/react`)
- ✅ `FHEVMProvider` with context
- ✅ Hooks: `useFHEVM`, `useEncrypt`, `useDecrypt`
- ✅ `useReadEncrypted` for contract reads
- ✅ `useWriteEncrypted` for contract writes
- ✅ `useWallet` for wallet management

### 3. Vue 3 Integration (`@mixaspro/vue`)
- ✅ Composition API
- ✅ Reactive state management
- ✅ Auto-cleanup on unmount
- ✅ TypeScript support

### 4. Svelte Integration (`@mixaspro/svelte`)
- ✅ Svelte stores
- ✅ Auto-subscriptions
- ✅ Reactive `$fhevm` state

### 5. Solid.js Integration (`@mixaspro/solid`)
- ✅ Fine-grained reactivity
- ✅ Context API
- ✅ Signals & effects

### 6. Angular Integration (`@mixaspro/angular`)
- ✅ Injectable services
- ✅ RxJS observables
- ✅ Dependency injection
- ✅ Zone.js compatible

---

## 📚 Documentation

- **Original Zama Docs**: See `README.md` for original template setup
- **Encryption Guide**: `ENCRYPT_DECRYPT_GUIDE.md` - Complete encryption/decryption workflows
- **API Reference**: Check each package's README in `packages/*/`
- **Examples**: Live code in `examples/*/`

---

## 🌐 Live Deployments

All examples are deployed to Vercel:

- **React Counter**: https://fhevm-sdk-pro-index-m0urhgwip-mixasvs-projects.vercel.app/react-counter
- **Svelte Voting**: https://fhevm-sdk-pro-index-m0urhgwip-mixasvs-projects.vercel.app/svelte-voting
- **Vue Token**: https://fhevm-sdk-pro-index-m0urhgwip-mixasvs-projects.vercel.app/vue-token
- **Solid Poll**: https://fhevm-sdk-pro-index-m0urhgwip-mixasvs-projects.vercel.app/solid-poll
- **Angular Auction**: https://fhevm-sdk-pro-index-m0urhgwip-mixasvs-projects.vercel.app/angular-auction
- **Vanilla Message**: https://fhevm-sdk-pro-index-m0urhgwip-mixasvs-projects.vercel.app/vanilla-message

---

## 🔧 Development

### Build All Packages
```bash
pnpm build
```

### Run Tests
```bash
pnpm test
```

### Lint & Format
```bash
pnpm lint
pnpm format
```

### Deploy to Vercel
```bash
pnpm vercel
```

---

## 🏗️ What Was Enhanced?

### From Original Template:
- ✅ Keep `packages/fhevm-sdk` (original Zama SDK wrapper)
- ✅ Keep `packages/hardhat` (smart contracts)
- ✅ Keep `packages/nextjs` (Next.js frontend)

### Added Enhancements:
- ✅ `packages/core` - Professional core client with `@zama-fhe/relayer-sdk`
- ✅ `packages/react` - React hooks library
- ✅ `packages/vue` - Vue 3 composables
- ✅ `packages/svelte` - Svelte stores
- ✅ `packages/solid` - Solid.js primitives
- ✅ `packages/angular` - Angular services
- ✅ `packages/cli` - Project generator
- ✅ `packages/testing` - Test utilities
- ✅ `packages/devtools` - Browser extension
- ✅ `examples/*` - 6 framework examples
- ✅ Turbo monorepo setup
- ✅ Vercel deployment configuration
- ✅ Comprehensive documentation

---

## 📖 Learning Resources

### Zama Official:
- **Docs**: https://docs.zama.ai/fhevm
- **Template**: https://github.com/zama-ai/fhevm-react-template
- **Discord**: https://discord.gg/zama
- **Forum**: https://community.zama.ai/

### This Enhanced SDK:
- Start with `ENCRYPT_DECRYPT_GUIDE.md`
- Explore `examples/react-counter` (simplest)
- Try other frameworks in `examples/`
- Read package READMEs for API details

---

## 🏆 Bounty Submission Notes

### What Makes This Submission Stand Out:

1. **Multi-Framework Support**: Not just React - 6 frameworks supported
2. **Official SDK Integration**: Uses `@zama-fhe/relayer-sdk` correctly
3. **Production Ready**: Deployed, documented, tested
4. **Developer Experience**: Clean APIs, TypeScript, error handling
5. **Comprehensive Examples**: Real use cases for each framework
6. **Proper Fork**: Built on top of official template, preserving original structure

### Technical Highlights:
- ✅ Proper fork of `zama-ai/fhevm-react-template`
- ✅ Uses `SepoliaConfig` from `@zama-fhe/relayer-sdk`
- ✅ All 6 examples work with Sepolia testnet
- ✅ No hardcoded values - proper configuration
- ✅ Clean monorepo structure with Turbo
- ✅ Global polyfills for browser compatibility

---

## 📄 License

BSD-3-Clause-Clear (same as original template)

---

## 🙏 Acknowledgments

- **Zama** for FHEVM protocol and original template
- **Linea** for bounty program
- Built with ❤️ for the FHEVM community

---

**For original template documentation, see `README.md`**
