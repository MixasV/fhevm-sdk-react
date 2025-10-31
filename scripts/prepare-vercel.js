const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('📦 Building examples...')

// Build examples
const examples = [
  'fhevm-react-counter-example',
  'fhevm-svelte-voting-example',
  'fhevm-vue-token-example',
  'fhevm-solid-poll-example',
  'fhevm-angular-auction-example',
  'fhevm-vanilla-message-example'
]

// Build examples with error handling
const builtExamples = []
for (const example of examples) {
  console.log(`Building ${example}...`)
  try {
    execSync(`pnpm --filter ${example} build`, { stdio: 'inherit' })
    builtExamples.push(example)
    console.log(`✓ ${example} built successfully`)
  } catch (error) {
    console.error(`⚠️ Failed to build ${example}:`, error.message)
    console.log(`Skipping ${example}...`)
  }
}

if (builtExamples.length === 0) {
  console.error('❌ No examples built successfully')
  process.exit(1)
}

console.log(`\n✓ Successfully built ${builtExamples.length}/${examples.length} examples`)

const publicDir = path.join(__dirname, '..', 'public')
const reactDist = path.join(__dirname, '..', 'examples', 'react-counter', 'dist')
const svelteDist = path.join(__dirname, '..', 'examples', 'svelte-voting', 'dist')
const vueDist = path.join(__dirname, '..', 'examples', 'vue-token', 'dist')
const solidDist = path.join(__dirname, '..', 'examples', 'solid-poll', 'dist')
const angularDist = path.join(__dirname, '..', 'examples', 'angular-auction', 'dist')
const vanillaDist = path.join(__dirname, '..', 'examples', 'vanilla-message', 'dist')

// Create public directory
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true })
}

// Copy react-counter
const reactTarget = path.join(publicDir, 'react-counter')
if (fs.existsSync(reactDist)) {
  fs.cpSync(reactDist, reactTarget, { recursive: true })
  console.log('✓ Copied react-counter to public/')
}

// Copy svelte-voting
const svelteTarget = path.join(publicDir, 'svelte-voting')
if (fs.existsSync(svelteDist)) {
  fs.cpSync(svelteDist, svelteTarget, { recursive: true })
  console.log('✓ Copied svelte-voting to public/')
}

// Copy vue-token
const vueTarget = path.join(publicDir, 'vue-token')
if (fs.existsSync(vueDist)) {
  fs.cpSync(vueDist, vueTarget, { recursive: true })
  console.log('✓ Copied vue-token to public/')
}

// Copy solid-poll
const solidTarget = path.join(publicDir, 'solid-poll')
if (fs.existsSync(solidDist)) {
  fs.cpSync(solidDist, solidTarget, { recursive: true })
  console.log('✓ Copied solid-poll to public/')
}

// Copy angular-auction
const angularTarget = path.join(publicDir, 'angular-auction')
if (fs.existsSync(angularDist)) {
  fs.cpSync(angularDist, angularTarget, { recursive: true })
  console.log('✓ Copied angular-auction to public/')
}

// Copy vanilla-message
const vanillaTarget = path.join(publicDir, 'vanilla-message')
if (fs.existsSync(vanillaDist)) {
  fs.cpSync(vanillaDist, vanillaTarget, { recursive: true })
  console.log('✓ Copied vanilla-message to public/')
}

// Create index.html with links
const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FHEVM SDK Pro - Examples</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 800px;
      margin: 50px auto;
      padding: 20px;
      line-height: 1.6;
    }
    h1 { color: #333; }
    .example {
      border: 1px solid #ddd;
      padding: 20px;
      margin: 20px 0;
      border-radius: 8px;
    }
    .example h2 { margin-top: 0; }
    .example a {
      display: inline-block;
      padding: 10px 20px;
      background: #0070f3;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      margin-top: 10px;
    }
    .example a:hover { background: #0051cc; }
  </style>
</head>
<body>
  <h1>🔐 FHEVM SDK Pro - Live Examples</h1>
  <p>Enterprise-Grade Universal FHEVM SDK with Production-Ready Tooling</p>
  
  <div class="example">
    <h2>⚛️ React Counter Example</h2>
    <p>Encrypted counter using React hooks and FHEVM SDK</p>
    <a href="/react-counter/">View Demo →</a>
  </div>
  
  <div class="example">
    <h2>🎯 Svelte Voting Example</h2>
    <p>Private voting application built with Svelte stores</p>
    <a href="/svelte-voting/">View Demo →</a>
  </div>

  <div class="example">
    <h2>💚 Vue 3 Token Example</h2>
    <p>Encrypted ERC20 token with private balances using Vue composables</p>
    <a href="/vue-token/">View Demo →</a>
  </div>

  <div class="example">
    <h2>🔵 Solid.js Private Poll</h2>
    <p>Anonymous polling with encrypted votes using Solid.js signals</p>
    <a href="/solid-poll/">View Demo →</a>
  </div>

  <div class="example">
    <h2>🔴 Angular Blind Auction</h2>
    <p>Sealed-bid auction with encrypted bids using Angular services</p>
    <a href="/angular-auction/">View Demo →</a>
  </div>

  <div class="example">
    <h2>🟡 Vanilla JS Secret Message</h2>
    <p>Pure JavaScript example with encrypted messages</p>
    <a href="/vanilla-message/">View Demo →</a>
  </div>

  <hr style="margin: 40px 0;">
  
  <p>
    <strong>Links:</strong><br>
    📦 <a href="https://www.npmjs.com/search?q=%40mixaspro">NPM Packages</a><br>
    💻 <a href="https://github.com/MixasV/fhevm-sdk-pro">GitHub Repository</a><br>
    📚 <a href="https://github.com/MixasV/fhevm-sdk-pro#readme">Documentation</a>
  </p>
</body>
</html>
`

fs.writeFileSync(path.join(publicDir, 'index.html'), indexHtml)
console.log('✓ Created index.html')

console.log('\n✅ Vercel deployment prepared successfully!')
