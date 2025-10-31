# @fhevm-sdk/cli

## 1.0.0 (2025-10-31)

### Features

**CLI Commands:**
- 🚀 `create` - Scaffold new FHEVM projects
  - React template
  - Vue template
  - Svelte template
  - Next.js template
  - Full project setup with dependencies

- 🔧 `generate-types` - Generate TypeScript types from contract ABIs
  - Automatic type inference
  - Function parameter interfaces
  - Type-safe contract helpers
  - Complete type definitions

- ⚡ `init` - Initialize FHEVM in existing projects
  - Framework detection
  - Dependency installation
  - Example file generation
  - Package manager detection (npm/yarn/pnpm)

**Developer Experience:**
- 📝 Interactive prompts
- 🎨 Colored output
- ⏳ Progress indicators
- ✅ Error handling and validation

### Bundle Size

- **ESM**: 20.89 KB
- **CJS**: 22.92 KB

### Installation

```bash
npx @fhevm-sdk/cli create my-app
```

### Examples

```bash
# Create new project
fhevm create my-dapp

# Generate types from ABI
fhevm generate-types ./MyContract.json -o ./types/contract.ts

# Initialize in existing project
fhevm init
```
