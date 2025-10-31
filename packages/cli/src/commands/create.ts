/**
 * Create command - scaffolds new FHEVM project
 * 
 * @packageDocumentation
 */

import { execSync } from 'child_process'
import * as path from 'path'

import chalk from 'chalk'
import * as fs from 'fs-extra'
import ora from 'ora'

interface CreateOptions {
  framework: string
  packageManager: string
  skipInstall: boolean
}

/**
 * Create a new FHEVM project
 * 
 * @param projectName - Name of the project
 * @param options - Create options
 */
export async function createCommand(
  projectName: string,
  options: CreateOptions
): Promise<void> {
  const spinner = ora('Creating FHEVM project...').start()

  try {
    const projectPath = path.join(process.cwd(), projectName)

    // Check if directory exists
    if (await fs.pathExists(projectPath)) {
      spinner.fail(chalk.red(`Directory ${projectName} already exists!`))
      process.exit(1)
    }

    // Create project directory
    await fs.ensureDir(projectPath)
    spinner.text = 'Creating project structure...'

    // Create package.json
    const packageJson = {
      name: projectName,
      version: '1.0.0',
      private: true,
      scripts: {
        dev: options.framework === 'next' ? 'next dev' : 'vite',
        build: options.framework === 'next' ? 'next build' : 'vite build',
        start: options.framework === 'next' ? 'next start' : 'vite preview',
        lint: 'eslint . --ext .ts,.tsx',
      },
      dependencies: {
        '@mixaspro/core': '^1.0.0',
        ...(options.framework === 'react' && {
          '@mixaspro/react': '^1.0.0',
          'react': '^18.2.0',
          'react-dom': '^18.2.0',
          'ethers': '^6.0.0',
        }),
        ...(options.framework === 'vue' && {
          '@mixaspro/vue': '^1.0.0',
          'vue': '^3.3.0',
          'ethers': '^6.0.0',
        }),
        ...(options.framework === 'svelte' && {
          '@mixaspro/svelte': '^1.0.0',
          'svelte': '^4.2.0',
          'ethers': '^6.0.0',
        }),
      },
      devDependencies: {
        '@types/node': '^20.0.0',
        'typescript': '^5.3.0',
        'vite': '^5.0.0',
        ...(options.framework === 'react' && {
          '@vitejs/plugin-react': '^4.2.0',
          '@types/react': '^18.2.0',
          '@types/react-dom': '^18.2.0',
        }),
        ...(options.framework === 'vue' && {
          '@vitejs/plugin-vue': '^5.0.0',
        }),
        ...(options.framework === 'svelte' && {
          '@sveltejs/vite-plugin-svelte': '^3.0.0',
        }),
      },
    }

    await fs.writeJSON(path.join(projectPath, 'package.json'), packageJson, { spaces: 2 })

    // Create basic files
    await createBasicFiles(projectPath, options.framework)

    spinner.succeed(chalk.green('Project structure created!'))

    // Install dependencies
    if (!options.skipInstall) {
      spinner.start('Installing dependencies...')
      try {
        const installCmd = getInstallCommand(options.packageManager)
        execSync(installCmd, { cwd: projectPath, stdio: 'inherit' })
        spinner.succeed(chalk.green('Dependencies installed!'))
      } catch (error) {
        spinner.fail(chalk.red('Failed to install dependencies'))
        console.log(chalk.yellow('\nYou can install them manually by running:'))
        console.log(chalk.cyan(`  cd ${projectName}`))
        console.log(chalk.cyan(`  ${options.packageManager} install`))
      }
    }

    // Success message
    console.log(chalk.green('\n✨ Project created successfully!\n'))
    console.log(chalk.white('Next steps:'))
    console.log(chalk.cyan(`  cd ${projectName}`))
    if (options.skipInstall) {
      console.log(chalk.cyan(`  ${options.packageManager} install`))
    }
    console.log(chalk.cyan(`  ${options.packageManager} run dev`))
    console.log()

  } catch (error) {
    spinner.fail(chalk.red('Failed to create project'))
    console.error(error)
    process.exit(1)
  }
}

/**
 * Create basic project files
 */
async function createBasicFiles(projectPath: string, framework: string): Promise<void> {
  // Create src directory
  const srcPath = path.join(projectPath, 'src')
  await fs.ensureDir(srcPath)

  // Create TypeScript config
  const tsconfig = {
    compilerOptions: {
      target: 'ES2020',
      useDefineForClassFields: true,
      lib: ['ES2020', 'DOM', 'DOM.Iterable'],
      module: 'ESNext',
      skipLibCheck: true,
      moduleResolution: 'bundler',
      allowImportingTsExtensions: true,
      resolveJsonModule: true,
      isolatedModules: true,
      noEmit: true,
      jsx: framework === 'react' ? 'react-jsx' : 'preserve',
      strict: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      noFallthroughCasesInSwitch: true,
    },
    include: ['src'],
  }

  await fs.writeJSON(path.join(projectPath, 'tsconfig.json'), tsconfig, { spaces: 2 })

  // Create basic app file based on framework
  if (framework === 'react') {
    await createReactApp(srcPath)
  } else if (framework === 'vue') {
    await createVueApp(srcPath)
  } else if (framework === 'svelte') {
    await createSvelteApp(srcPath)
  }

  // Create index.html
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>FHEVM App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.${framework === 'react' ? 'tsx' : framework === 'svelte' ? 'ts' : 'ts'}"></script>
  </body>
</html>`

  await fs.writeFile(path.join(projectPath, 'index.html'), indexHtml)

  // Create vite.config
  const viteConfig = framework === 'react' 
    ? `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})`
    : framework === 'vue'
    ? `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
})`
    : `import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [svelte()],
})`

  await fs.writeFile(path.join(projectPath, 'vite.config.ts'), viteConfig)

  // Create .gitignore
  const gitignore = `node_modules
dist
.DS_Store
*.local
.env
.env.local`

  await fs.writeFile(path.join(projectPath, '.gitignore'), gitignore)
}

/**
 * Create React app files
 */
async function createReactApp(srcPath: string): Promise<void> {
  const appTsx = `import { FHEVMProvider, useFHEVM, useWallet, useEncrypt } from '@mixaspro/react'
import { useState } from 'react'

function App() {
  return (
    <FHEVMProvider config={{ chainId: 31337, rpcUrl: 'http://localhost:8545' }}>
      <EncryptionDemo />
    </FHEVMProvider>
  )
}

function EncryptionDemo() {
  const { isInitialized, network } = useFHEVM()
  const { wallet, connect, isConnecting } = useWallet()
  const { encrypt, isEncrypting, data } = useEncrypt()
  const [value, setValue] = useState('')

  const handleEncrypt = async () => {
    if (!value) return
    await encrypt(parseInt(value), 'euint32')
  }

  if (!isInitialized) {
    return <div>Initializing FHEVM...</div>
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>FHEVM Encryption Demo</h1>
      <p>Network: {network?.name}</p>
      
      {!wallet ? (
        <button onClick={() => connect(window.ethereum)} disabled={isConnecting}>
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      ) : (
        <div>
          <p>Connected: {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}</p>
          
          <div style={{ marginTop: '2rem' }}>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter a number"
            />
            <button onClick={handleEncrypt} disabled={isEncrypting}>
              {isEncrypting ? 'Encrypting...' : 'Encrypt'}
            </button>
          </div>

          {data && (
            <div style={{ marginTop: '1rem' }}>
              <p>Encrypted! Handle: {data.handle.slice(0, 10)}...</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default App`

  await fs.writeFile(path.join(srcPath, 'App.tsx'), appTsx)

  const mainTsx = `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)`

  await fs.writeFile(path.join(srcPath, 'main.tsx'), mainTsx)
}

/**
 * Create Vue app files
 */
async function createVueApp(srcPath: string): Promise<void> {
  const appVue = `<template>
  <div style="padding: 2rem">
    <h1>FHEVM Encryption Demo</h1>
    <p>Framework: Vue 3</p>
    <p>Coming soon...</p>
  </div>
</template>

<script setup lang="ts">
// Vue implementation coming soon
</script>`

  await fs.writeFile(path.join(srcPath, 'App.vue'), appVue)

  const mainTs = `import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')`

  await fs.writeFile(path.join(srcPath, 'main.ts'), mainTs)
}

/**
 * Create Svelte app files
 */
async function createSvelteApp(srcPath: string): Promise<void> {
  const appSvelte = `<script lang="ts">
  import { onMount } from 'svelte'
  import { initializeFHEVM, isInitialized, connectWallet, wallet, encrypt, isEncrypting, encryptedData } from '@mixaspro/svelte'

  let value = ''

  onMount(async () => {
    await initializeFHEVM({ chainId: 31337, rpcUrl: 'http://localhost:8545' })
  })

  async function handleConnect() {
    await connectWallet(window.ethereum)
  }

  async function handleEncrypt() {
    if (!value) return
    await encrypt(parseInt(value), 'euint32')
  }
</script>

<div style="padding: 2rem">
  <h1>FHEVM Encryption Demo</h1>
  
  {#if !$isInitialized}
    <p>Initializing FHEVM...</p>
  {:else}
    {#if !$wallet}
      <button on:click={handleConnect}>Connect Wallet</button>
    {:else}
      <p>Connected: {$wallet.address.slice(0, 6)}...{$wallet.address.slice(-4)}</p>
      
      <div style="margin-top: 2rem">
        <input type="number" bind:value placeholder="Enter a number" />
        <button on:click={handleEncrypt} disabled={$isEncrypting}>
          {$isEncrypting ? 'Encrypting...' : 'Encrypt'}
        </button>
      </div>

      {#if $encryptedData}
        <div style="margin-top: 1rem">
          <p>Encrypted! Handle: {$encryptedData.handle.slice(0, 10)}...</p>
        </div>
      {/if}
    {/if}
  {/if}
</div>`

  await fs.writeFile(path.join(srcPath, 'App.svelte'), appSvelte)

  const mainTs = `import App from './App.svelte'

const app = new App({
  target: document.getElementById('app')!,
})

export default app`

  await fs.writeFile(path.join(srcPath, 'main.ts'), mainTs)
}

/**
 * Get install command for package manager
 */
function getInstallCommand(packageManager: string): string {
  switch (packageManager) {
    case 'npm':
      return 'npm install'
    case 'yarn':
      return 'yarn'
    case 'pnpm':
      return 'pnpm install'
    default:
      return 'npm install'
  }
}
