#!/usr/bin/env node

const { execSync } = require('child_process')

console.log('🔨 Building packages for Vercel deployment...\n')

// List of packages to build (excluding fhevm-sdk which has build issues)
const packages = [
  'core',
  'react',
  'vue',
  'svelte',
  'solid',
  'angular',
  'cli',
  'devtools',
  'testing'
]

let successCount = 0
let failCount = 0

for (const pkg of packages) {
  try {
    console.log(`📦 Building @mixaspro/${pkg}...`)
    execSync(`pnpm --filter @mixaspro/${pkg} build`, { 
      stdio: 'inherit',
      cwd: __dirname + '/..'
    })
    successCount++
    console.log(`✓ @mixaspro/${pkg} built successfully\n`)
  } catch (error) {
    failCount++
    console.error(`⚠️ Failed to build @mixaspro/${pkg}\n`)
    // Continue with other packages instead of failing
  }
}

console.log(`\n✅ Package build complete: ${successCount}/${packages.length} successful`)

if (failCount > 0) {
  console.warn(`⚠️ ${failCount} package(s) failed to build, but continuing...`)
}

// Now run the prepare-vercel script
console.log('\n📦 Building examples...\n')
try {
  execSync('node scripts/prepare-vercel.js', { 
    stdio: 'inherit',
    cwd: __dirname + '/..'
  })
} catch (error) {
  console.error('❌ Failed to prepare examples for Vercel')
  process.exit(1)
}
