#!/usr/bin/env node

/**
 * FHEVM SDK CLI
 * 
 * @packageDocumentation
 */

import { Command } from 'commander'

import { createCommand } from './commands/create'
import { generateTypesCommand } from './commands/generate-types'
import { initCommand } from './commands/init'

const program = new Command()

program
  .name('fhevm-sdk')
  .description('CLI tool for scaffolding FHEVM applications and generating type-safe code')
  .version('1.0.0')

// Create command
program
  .command('create')
  .description('Create a new FHEVM project')
  .argument('<project-name>', 'Name of the project')
  .option('-f, --framework <framework>', 'Framework to use (react, vue, svelte, next, nuxt)', 'react')
  .option('-p, --package-manager <pm>', 'Package manager (npm, yarn, pnpm)', 'pnpm')
  .option('--skip-install', 'Skip installing dependencies', false)
  .action(createCommand)

// Generate types command
program
  .command('generate-types')
  .description('Generate TypeScript types from contract ABI')
  .argument('<abi-file>', 'Path to contract ABI JSON file')
  .option('-o, --output <path>', 'Output file path', './generated/contract-types.ts')
  .option('-n, --contract-name <name>', 'Contract name for generated types')
  .action(generateTypesCommand)

// Init command
program
  .command('init')
  .description('Initialize FHEVM in an existing project')
  .option('-f, --framework <framework>', 'Framework to use (react, vue, svelte)')
  .option('--force', 'Force initialization even if FHEVM is already configured', false)
  .action(initCommand)

program.parse()
