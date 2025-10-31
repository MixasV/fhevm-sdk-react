# @fhevm-sdk/core

Framework-agnostic core SDK for FHEVM (Fully Homomorphic Encryption Virtual Machine).

## Installation

```bash
npm install @fhevm-sdk/core
# or
pnpm add @fhevm-sdk/core
# or
yarn add @fhevm-sdk/core
```

## Usage

```typescript
import { FHEVMClient } from '@fhevm-sdk/core'

const client = new FHEVMClient()
await client.initialize({ chainId: 31337 })
```

## Features

- ✅ Framework-agnostic
- ✅ TypeScript strict mode
- ✅ Tree-shakeable
- ✅ <30KB gzipped
- ✅ Comprehensive error handling
- ✅ >95% test coverage

## Documentation

Full documentation available at [https://fhevm-sdk.dev](https://fhevm-sdk.dev)

## License

MIT © FHEVM SDK Contributors
