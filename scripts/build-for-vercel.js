#!/usr/bin/env node

const { execSync } = require('child_process')
const path = require('path')

// Ensure we're in the project root
const projectRoot = path.resolve(__dirname, '..')
process.chdir(projectRoot)

console.log('🔨 Building examples for deployment...')
console.log('📁 Working directory:', process.cwd())
console.log()

// Note: Skipping package builds as they're already built in node_modules
// during pnpm install (via workspace links)
console.log('ℹ️  Using pre-built packages from workspace (installed during pnpm install)')
console.log('ℹ️  Proceeding directly to example builds...\n')

// Now run the prepare-vercel script
console.log('\n📦 Building examples...\n')
try {
  execSync('node scripts/prepare-vercel.js', { 
    stdio: 'inherit',
    cwd: projectRoot
  })
} catch (error) {
  console.error('❌ Failed to prepare examples for Vercel')
  process.exit(1)
}

console.log('\n✅ All done! Deployment ready.')
process.exit(0)
