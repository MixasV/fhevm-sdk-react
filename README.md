# FHEVM SDK Pro - Complete FHEVM Development Suite

🔥 **Live Demo:** https://fhevm.mixas.pro/

A **complete, production-ready FHEVM development suite** with:
- 🎯 **Universal SDK** - Framework-agnostic core with adapters for React, Vue 3, Svelte, Solid.js, Angular
- ⚡ **CLI Tool** - Scaffold new projects and generate type-safe code
- 🔧 **DevTools** - Browser extension for debugging FHEVM apps
- 🧪 **Testing Suite** - Mocks, fixtures, and utilities for testing
- 📦 **Hardhat Integration** - Smart contract development with Zama's FHEVM
- 🚀 **Next.js Template** - Production-ready app template

## 🚀 What is FHEVM?

FHEVM (Fully Homomorphic Encryption Virtual Machine) enables **computation on encrypted data** directly on Ethereum. Build dApps that perform operations on private data without ever exposing it to the blockchain.

## ✨ Features

### 🎯 Core SDK (`@mixaspro/core`)
- **🔐 Complete FHEVM Integration**: Full encryption/decryption workflow
- **🔗 Wallet Management**: MetaMask, WalletConnect, and EIP-6963 support
- **⚡ Optimized Performance**: Dynamic SDK loading, minimal bundle size (~440KB)
- **🛡️ Type-Safe**: Full TypeScript support with strict types
- **🌐 Multi-Network**: Sepolia testnet and local Hardhat support

### 🎨 Framework Adapters
- **⚛️ React** (`@mixaspro/react`): Hooks-based API with composable patterns
- **🟢 Vue 3** (`@mixaspro/vue`): Composition API with reactive stores
- **🔴 Svelte** (`@mixaspro/svelte`): Store-based reactivity
- **🔷 Solid.js** (`@mixaspro/solid`): Fine-grained reactive primitives
- **🅰️ Angular** (`@mixaspro/angular`): Service-based architecture
- **⚡ Vanilla JS** (`@mixaspro/core`): Zero dependencies, pure JavaScript

### 📦 Monorepo Structure
- **Unified API**: Consistent encryption/decryption patterns across all frameworks
- **Tree-shakeable**: Import only what you need
- **Examples Included**: 6 working examples demonstrating each framework

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v18 or higher)
- **pnpm** package manager (`npm install -g pnpm`)
- **MetaMask** browser extension
- **Git** for cloning the repository

## 🛠️ Quick Start

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/fhevm-sdk-pro.git
cd fhevm-sdk-pro

# Install dependencies
pnpm install

# Build all packages
pnpm build
```

### 2. Run Examples Locally

```bash
# Build all 6 examples
pnpm -r --filter "./examples/*" run build

# Start local server (from project root)
cd local-deploy
python -m http.server 8080

# Open http://localhost:8080 in your browser
```

### 3. Try Individual Examples

Each example can be run independently:

```bash
# React Counter
cd examples/react-counter
pnpm dev

# Vue Token
cd examples/vue-token
pnpm dev

# Svelte Voting
cd examples/svelte-voting
pnpm dev

# Solid Poll
cd examples/solid-poll
pnpm dev

# Angular Auction
cd examples/angular-auction
pnpm start

# Vanilla Message
cd examples/vanilla-message
pnpm dev
```

## 💻 Usage Examples

### React

```typescript
import { FHEVMProvider, useFHEVM, useWallet, useEncrypt } from '@mixaspro/react'

function App() {
  return (
    <FHEVMProvider config={{ chainId: 11155111, rpcUrl: '...' }}>
      <Counter />
    </FHEVMProvider>
  )
}

function Counter() {
  const { isInitialized } = useFHEVM()
  const { wallet, connect } = useWallet()
  const { encrypt } = useEncrypt()
  
  const handleEncrypt = async () => {
    const encrypted = await encrypt(42, 'euint32')
    console.log('Encrypted:', encrypted.handle)
  }
}
```

### Vue 3

```vue
<script setup>
import { useFHEVM, useWallet, useEncrypt } from '@mixaspro/vue'

const fhevm = useFHEVM()
const wallet = useWallet()
const encrypt = useEncrypt()

async function handleEncrypt() {
  const encrypted = await encrypt.encrypt(100, 'euint32')
  console.log('Encrypted:', encrypted.handle)
}
</script>
```

### Angular

```typescript
import { FHEVMClient } from '@mixaspro/core'

export class AppComponent {
  private fhevm = new FHEVMClient()
  
  async ngOnInit() {
    await this.fhevm.initialize({
      chainId: 11155111,
      rpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com',
      wasmPath: '/assets/wasm/'
    })
    
    const encrypted = await this.fhevm.encrypt(42, 'euint32')
  }
}
```

### Vanilla JS

```javascript
import { FHEVMClient } from '@mixaspro/core'

const client = new FHEVMClient()

await client.initialize({
  chainId: 11155111,
  rpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com'
})

const encrypted = await client.encrypt(42, 'euint32')
console.log('Handle:', encrypted.handle)
```

## 🔧 Troubleshooting

### Common MetaMask + Hardhat Issues

When developing with MetaMask and Hardhat, you may encounter these common issues:

#### ❌ Nonce Mismatch Error

**Problem**: MetaMask tracks transaction nonces, but when you restart Hardhat, the node resets while MetaMask doesn't update its tracking.

**Solution**:
1. Open MetaMask extension
2. Select the Hardhat network
3. Go to **Settings** → **Advanced**
4. Click **"Clear Activity Tab"** (red button)
5. This resets MetaMask's nonce tracking

#### ❌ Cached View Function Results

**Problem**: MetaMask caches smart contract view function results. After restarting Hardhat, you may see outdated data.

**Solution**:
1. **Restart your entire browser** (not just refresh the page)
2. MetaMask's cache is stored in extension memory and requires a full browser restart to clear

> 💡 **Pro Tip**: Always restart your browser after restarting Hardhat to avoid cache issues.

For more details, see the [MetaMask development guide](https://docs.metamask.io/wallet/how-to/run-devnet/).

## 📁 Project Structure

Complete monorepo with 12 packages:

```
fhevm-sdk-pro/
├── packages/
│   ├── core/                   # @mixaspro/core - Core SDK (framework-agnostic)
│   │   ├── client/             # FHEVMClient, wallet management
│   │   ├── encryption/         # Encryption/decryption workflow
│   │   └── types/              # TypeScript type definitions
│   │
│   ├── react/                  # @mixaspro/react - React hooks & components
│   ├── vue/                    # @mixaspro/vue - Vue 3 composables
│   ├── svelte/                 # @mixaspro/svelte - Svelte stores
│   ├── solid/                  # @mixaspro/solid - Solid.js signals
│   ├── angular/                # @mixaspro/angular - Angular services
│   │
│   ├── cli/                    # @mixaspro/cli - Project scaffolding tool
│   ├── devtools/               # @mixaspro/devtools - Browser DevTools extension
│   ├── testing/                # @mixaspro/testing - Testing utilities & mocks
│   │
│   ├── hardhat/                # Smart contract development (Zama FHEVM)
│   ├── nextjs/                 # Next.js production template
│   └── fhevm-sdk/              # Legacy SDK (deprecated)
│
├── examples/
│   ├── react-counter/          # React: Private counter
│   ├── vue-token/              # Vue 3: Token balance
│   ├── svelte-voting/          # Svelte: Anonymous voting
│   ├── solid-poll/             # Solid.js: Private poll
│   ├── angular-auction/        # Angular: Blind auction
│   └── vanilla-message/        # Vanilla JS: Secret messages
│
└── docs/                       # Documentation & guides
```

### Package Architecture

```
         @mixaspro/core (Foundation)
                 │
      ┌──────────┼──────────┐
      │          │          │
   Framework  Developer  Smart
   Adapters    Tools    Contracts
      │          │          │
   ┌──┴──┬───┬───┴───┬──┐   │
react vue svelte cli testing hardhat
       solid angular devtools nextjs
```

## 🎯 Core Packages

### Framework Adapters

| Package | Description | Features |
|---------|-------------|----------|
| `@mixaspro/core` | Framework-agnostic SDK | FHEVMClient, encryption, wallet management |
| `@mixaspro/react` | React integration | Hooks: `useFHEVM`, `useWallet`, `useEncrypt` |
| `@mixaspro/vue` | Vue 3 integration | Composables with Composition API |
| `@mixaspro/svelte` | Svelte integration | Reactive stores |
| `@mixaspro/solid` | Solid.js integration | Fine-grained signals |
| `@mixaspro/angular` | Angular integration | Injectable services |

### Developer Tools

| Package | Description | Use Case |
|---------|-------------|----------|
| `@mixaspro/cli` | Scaffolding tool | `npx @mixaspro/cli create my-app` |
| `@mixaspro/devtools` | Browser extension | Debug encrypted data, inspect transactions |
| `@mixaspro/testing` | Testing utilities | Mock FHEVM, fixtures for unit tests |

### Infrastructure

| Package | Description | Purpose |
|---------|-------------|---------|
| `hardhat` | Smart contracts | Zama FHEVM contract development |
| `nextjs` | Production template | Full-stack Next.js app with FHEVM |

## ⚡ CLI Usage

Create a new project in seconds:

```bash
# Interactive project creation
npx @mixaspro/cli create my-fhevm-app

# Choose framework: React | Vue | Svelte | Solid | Angular
# Auto-installs dependencies and sets up project structure

cd my-fhevm-app
pnpm dev
```

Generate type-safe contract bindings:

```bash
# Generate TypeScript types from ABIs
npx @mixaspro/cli generate --contracts ./contracts
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Run tests: `pnpm test`
5. Build packages: `pnpm build`
6. Submit a pull request

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm --filter @mixaspro/core test
pnpm --filter @mixaspro/react test
```

## 📚 Additional Resources

### Official Documentation
- [FHEVM Documentation](https://docs.zama.ai/protocol/solidity-guides/) - Complete FHEVM guide
- [FHEVM Hardhat Guide](https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat) - Hardhat integration
- [Relayer SDK Documentation](https://docs.zama.ai/protocol/relayer-sdk-guides/) - SDK reference
- [Environment Setup](https://docs.zama.ai/protocol/solidity-guides/getting-started/setup#set-up-the-hardhat-configuration-variables-optional) - MNEMONIC & API keys

### Development Tools
- [MetaMask + Hardhat Setup](https://docs.metamask.io/wallet/how-to/run-devnet/) - Local development
- [React Documentation](https://reactjs.org/) - React framework guide

### Community & Support
- [FHEVM Discord](https://discord.com/invite/zama) - Community support
- [GitHub Issues](https://github.com/zama-ai/fhevm-react-template/issues) - Bug reports & feature requests

## 📄 License

This project is licensed under the **BSD-3-Clause-Clear License**. See the [LICENSE](LICENSE) file for details.
