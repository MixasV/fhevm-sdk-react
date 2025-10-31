/**
 * Init command - initializes FHEVM in existing project
 * 
 * @packageDocumentation
 */

import { execSync } from 'child_process'
import * as path from 'path'

import chalk from 'chalk'
import * as fs from 'fs-extra'
import ora from 'ora'
import prompts from 'prompts'

interface InitOptions {
  framework?: string
  force: boolean
}

/**
 * Initialize FHEVM in existing project
 * 
 * @param options - Init options
 */
export async function initCommand(options: InitOptions): Promise<void> {
  const spinner = ora('Initializing FHEVM...').start()

  try {
    const projectPath = process.cwd()

    // Check if package.json exists
    const packageJsonPath = path.join(projectPath, 'package.json')
    if (!await fs.pathExists(packageJsonPath)) {
      spinner.fail(chalk.red('No package.json found. Are you in a project directory?'))
      process.exit(1)
    }

    spinner.stop()

    // Prompt for framework if not provided
    let framework = options.framework
    
    if (!framework) {
      const response = await prompts({
        type: 'select',
        name: 'framework',
        message: 'Which framework are you using?',
        choices: [
          { title: 'React', value: 'react' },
          { title: 'Vue 3', value: 'vue' },
          { title: 'Svelte', value: 'svelte' },
          { title: 'Next.js', value: 'next' },
          { title: 'None (Core only)', value: 'core' },
        ],
      })

      framework = response.framework

      if (!framework) {
        console.log(chalk.yellow('Initialization cancelled'))
        process.exit(0)
      }
    }

    spinner.start('Reading project configuration...')

    // Read package.json
    const packageJson = await fs.readJSON(packageJsonPath)

    // Check if FHEVM is already configured
    const hasFHEVM = packageJson.dependencies && 
                    Object.keys(packageJson.dependencies).some((dep: string) => dep.startsWith('@mixaspro-fhevm/'))

    if (hasFHEVM && !options.force) {
      spinner.warn(chalk.yellow('FHEVM packages already installed'))
      console.log(chalk.white('Use --force to reinstall'))
      process.exit(0)
    }

    spinner.text = 'Adding FHEVM dependencies...'

    // Add dependencies
    const dependencies = {
      '@mixaspro/core': '^1.0.0',
      'ethers': '^6.0.0',
    }

    if (framework === 'react') {
      Object.assign(dependencies, { '@mixaspro/react': '^1.0.0' })
    } else if (framework === 'vue') {
      Object.assign(dependencies, { '@mixaspro/vue': '^1.0.0' })
    } else if (framework === 'svelte') {
      Object.assign(dependencies, { '@mixaspro/svelte': '^1.0.0' })
    }

    packageJson.dependencies = {
      ...packageJson.dependencies,
      ...dependencies,
    }

    await fs.writeJSON(packageJsonPath, packageJson, { spaces: 2 })

    spinner.succeed(chalk.green('Dependencies added to package.json'))

    // Detect package manager
    const packageManager = await detectPackageManager(projectPath)
    
    spinner.start('Installing dependencies...')

    try {
      const installCmd = getInstallCommand(packageManager)
      execSync(installCmd, { cwd: projectPath, stdio: 'inherit' })
      spinner.succeed(chalk.green('Dependencies installed!'))
    } catch (error) {
      spinner.fail(chalk.red('Failed to install dependencies'))
      console.log(chalk.yellow('\nYou can install them manually by running:'))
      console.log(chalk.cyan(`  ${packageManager} install`))
    }

    // Create example file
    if (framework !== 'core') {
      spinner.start('Creating example file...')
      await createExampleFile(projectPath, framework)
      spinner.succeed(chalk.green('Example file created!'))
    }

    // Success message
    console.log(chalk.green('\n✨ FHEVM initialized successfully!\n'))
    console.log(chalk.white('Next steps:'))
    
    if (framework !== 'core') {
      console.log(chalk.cyan('  Check the example file for usage'))
    }
    
    console.log(chalk.cyan('  Read the docs: https://docs.fhevm-sdk.dev'))
    console.log()

  } catch (error) {
    spinner.fail(chalk.red('Failed to initialize FHEVM'))
    console.error(error)
    process.exit(1)
  }
}

/**
 * Detect package manager
 */
async function detectPackageManager(projectPath: string): Promise<string> {
  if (await fs.pathExists(path.join(projectPath, 'pnpm-lock.yaml'))) {
    return 'pnpm'
  }
  
  if (await fs.pathExists(path.join(projectPath, 'yarn.lock'))) {
    return 'yarn'
  }
  
  return 'npm'
}

/**
 * Get install command
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

/**
 * Create example file
 */
async function createExampleFile(projectPath: string, framework: string): Promise<void> {
  const srcPath = path.join(projectPath, 'src')
  await fs.ensureDir(srcPath)

  const examplePath = path.join(srcPath, `fhevm-example.${framework === 'svelte' ? 'svelte' : 'tsx'}`)

  let exampleContent = ''

  if (framework === 'react') {
    exampleContent = `import { FHEVMProvider, useFHEVM, useEncrypt } from '@mixaspro/react'

export function FHEVMExample() {
  return (
    <FHEVMProvider config={{ chainId: 31337 }}>
      <EncryptionDemo />
    </FHEVMProvider>
  )
}

function EncryptionDemo() {
  const { isInitialized } = useFHEVM()
  const { encrypt, isEncrypting, data } = useEncrypt()

  if (!isInitialized) {
    return <div>Initializing FHEVM...</div>
  }

  return (
    <div>
      <h2>FHEVM Example</h2>
      <button onClick={() => encrypt(42, 'euint32')} disabled={isEncrypting}>
        Encrypt Value
      </button>
      {data && <p>Encrypted: {data.handle}</p>}
    </div>
  )
}`
  } else if (framework === 'svelte') {
    exampleContent = `<script lang="ts">
  import { onMount } from 'svelte'
  import { initializeFHEVM, encrypt, isEncrypting, encryptedData } from '@mixaspro/svelte'

  onMount(async () => {
    await initializeFHEVM({ chainId: 31337 })
  })

  async function handleEncrypt() {
    await encrypt(42, 'euint32')
  }
</script>

<div>
  <h2>FHEVM Example</h2>
  <button on:click={handleEncrypt} disabled={$isEncrypting}>
    Encrypt Value
  </button>
  {#if $encryptedData}
    <p>Encrypted: {$encryptedData.handle}</p>
  {/if}
</div>`
  }

  await fs.writeFile(examplePath, exampleContent)
}
