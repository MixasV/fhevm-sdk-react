# @fhevm-sdk/react

React hooks and components for FHEVM SDK.

## Installation

```bash
npm install @fhevm-sdk/react
# or
pnpm add @fhevm-sdk/react
# or
yarn add @fhevm-sdk/react
```

## Usage

```tsx
import { FHEVMProvider, useFHEVM } from '@fhevm-sdk/react'

function App() {
  return (
    <FHEVMProvider>
      <MyComponent />
    </FHEVMProvider>
  )
}

function MyComponent() {
  const { isInitialized } = useFHEVM()

  return <div>{isInitialized ? 'Ready' : 'Loading...'}</div>
}
```

## Features

- ✅ React 18+ support
- ✅ TypeScript strict mode
- ✅ Tree-shakeable
- ✅ Comprehensive hooks
- ✅ >90% test coverage

## Documentation

Full documentation available at [https://fhevm-sdk.dev](https://fhevm-sdk.dev)

## License

MIT © FHEVM SDK Contributors
