#!/usr/bin/env node

/**
 * Verification script for Sprint 0 setup
 * 
 * Checks that all required files and directories exist
 */

const fs = require('fs')
const path = require('path')

const rootDir = path.join(__dirname, '..')

const requiredFiles = [
  'package.json',
  'pnpm-workspace.yaml',
  'tsconfig.json',
  'turbo.json',
  '.eslintrc.json',
  '.prettierrc.json',
  '.gitignore',
  '.npmignore',
  'README.md',
  'LICENSE.md',
  'CHANGELOG.md',
  'CONTRIBUTING.md',
  'CODE_OF_CONDUCT.md',
]

const requiredDirs = [
  '.github',
  '.github/workflows',
  '.husky',
  '.changeset',
  'packages',
  'packages/core',
  'packages/react',
  'packages/vue',
  'packages/svelte',
  'packages/angular',
  'packages/solid',
  'packages/testing',
  'packages/cli',
  'packages/devtools',
]

const requiredPackageFiles = [
  'packages/core/package.json',
  'packages/core/tsconfig.json',
  'packages/core/src/index.ts',
  'packages/react/package.json',
  'packages/react/tsconfig.json',
  'packages/react/src/index.ts',
]

let errors = 0
const warnings = 0

console.log('🔍 Verifying Sprint 0 setup...\n')

// Check required files
console.log('📄 Checking required files...')
for (const file of requiredFiles) {
  const filePath = path.join(rootDir, file)
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file}`)
  } else {
    console.log(`  ❌ ${file} - MISSING`)
    errors++
  }
}

// Check required directories
console.log('\n📁 Checking required directories...')
for (const dir of requiredDirs) {
  const dirPath = path.join(rootDir, dir)
  if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
    console.log(`  ✅ ${dir}/`)
  } else {
    console.log(`  ❌ ${dir}/ - MISSING`)
    errors++
  }
}

// Check package files
console.log('\n📦 Checking package files...')
for (const file of requiredPackageFiles) {
  const filePath = path.join(rootDir, file)
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file}`)
  } else {
    console.log(`  ❌ ${file} - MISSING`)
    errors++
  }
}

// Check GitHub Actions
console.log('\n🔧 Checking GitHub Actions...')
const ciWorkflow = path.join(rootDir, '.github/workflows/ci.yml')
const releaseWorkflow = path.join(rootDir, '.github/workflows/release.yml')

if (fs.existsSync(ciWorkflow)) {
  console.log('  ✅ CI workflow configured')
} else {
  console.log('  ❌ CI workflow missing')
  errors++
}

if (fs.existsSync(releaseWorkflow)) {
  console.log('  ✅ Release workflow configured')
} else {
  console.log('  ❌ Release workflow missing')
  errors++
}

// Summary
console.log('\n' + '='.repeat(50))
if (errors === 0 && warnings === 0) {
  console.log('✅ All checks passed! Sprint 0 setup is complete.')
  console.log('\nNext steps:')
  console.log('  1. Initialize git: git init')
  console.log('  2. Install dependencies: pnpm install')
  console.log('  3. Build packages: pnpm build')
  console.log('  4. Run tests: pnpm test')
  process.exit(0)
} else {
  console.log(`❌ Setup incomplete: ${errors} errors, ${warnings} warnings`)
  console.log('\nPlease fix the errors above and run verification again.')
  process.exit(1)
}
