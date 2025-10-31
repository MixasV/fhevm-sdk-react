<script lang="ts">
  import { onMount } from 'svelte'
  import { 
    initializeFHEVM, 
    isInitialized, 
    connectWallet, 
    wallet,
    encrypt,
    isEncrypting,
    encryptedData,
    writeContract,
    isWriting,
    transactionReceipt
  } from '@mixaspro/svelte'

  const VOTING_ABI = [
    {
      inputs: [{ name: 'encryptedVote', type: 'bytes' }],
      name: 'vote',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'getTotalVotes',
      outputs: [{ name: '', type: 'euint32' }],
      stateMutability: 'view',
      type: 'function',
    },
  ]

  const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'

  let selectedOption = 0

  onMount(async () => {
    await initializeFHEVM({ 
      chainId: 11155111,
      rpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com'
    })
  })

  async function handleConnect() {
    try {
      await connectWallet((window as any).ethereum)
    } catch (error) {
      console.error('Failed to connect:', error)
      alert('Failed to connect wallet')
    }
  }

  async function handleVote() {
    try {
      // Encrypt vote (0, 1, or 2 for option A, B, or C)
      const encrypted = await encrypt(selectedOption, 'euint32')
      
      // Submit vote
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: VOTING_ABI,
        functionName: 'vote',
        args: [encrypted.value],
      })
      
      alert('Vote submitted successfully!')
    } catch (error) {
      console.error('Failed to vote:', error)
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
</script>

<div class="container">
  <header>
    <h1>🗳️ FHEVM Private Voting</h1>
    <p class="subtitle">Svelte + FHEVM SDK Example</p>
  </header>

  {#if !$isInitialized}
    <div class="loading">Initializing FHEVM...</div>
  {:else if !$wallet}
    <div class="wallet-section">
      <button on:click={handleConnect} class="btn btn-primary">
        Connect Wallet
      </button>
    </div>
  {:else}
    <div class="wallet-info">
      <p>Connected: <code>{$wallet.address.slice(0, 6)}...{$wallet.address.slice(-4)}</code></p>
    </div>

    <div class="voting-section">
      <h2>Cast Your Vote</h2>
      <p class="info">Your vote is encrypted and remains private</p>

      <div class="options">
        <label class="option">
          <input 
            type="radio" 
            bind:group={selectedOption} 
            value={0}
            disabled={$isEncrypting || $isWriting}
          />
          <span>Option A</span>
        </label>

        <label class="option">
          <input 
            type="radio" 
            bind:group={selectedOption} 
            value={1}
            disabled={$isEncrypting || $isWriting}
          />
          <span>Option B</span>
        </label>

        <label class="option">
          <input 
            type="radio" 
            bind:group={selectedOption} 
            value={2}
            disabled={$isEncrypting || $isWriting}
          />
          <span>Option C</span>
        </label>
      </div>

      <button
        on:click={handleVote}
        disabled={$isEncrypting || $isWriting}
        class="btn btn-primary btn-vote"
      >
        {$isEncrypting ? 'Encrypting...' : $isWriting ? 'Submitting...' : 'Submit Vote'}
      </button>

      {#if $transactionReceipt}
        <div class="success">
          ✅ Vote submitted successfully!
          <br />
          <code>{$transactionReceipt.hash.slice(0, 10)}...</code>
        </div>
      {/if}
    </div>

    <div class="info-section">
      <h3>How Private Voting Works:</h3>
      <ol>
        <li>Select your preferred option</li>
        <li>Vote is encrypted locally using FHE</li>
        <li>Encrypted vote is submitted to blockchain</li>
        <li>Vote remains private until reveal phase</li>
        <li>Results can be computed without decryption</li>
      </ol>
    </div>
  {/if}
</div>

<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :global(body) {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .container {
    max-width: 600px;
    width: 90%;
    background: white;
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  }

  header {
    text-align: center;
    margin-bottom: 2rem;
  }

  h1 {
    font-size: 2rem;
    color: #333;
    margin-bottom: 0.5rem;
  }

  .subtitle {
    color: #666;
    font-size: 1rem;
  }

  .loading {
    text-align: center;
    padding: 2rem;
    color: #666;
  }

  .wallet-section {
    text-align: center;
    padding: 2rem 0;
  }

  .wallet-info {
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
    margin-bottom: 1.5rem;
    text-align: center;
  }

  .wallet-info code {
    background: #e9ecef;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
  }

  .voting-section {
    margin-top: 1.5rem;
    padding: 1.5rem;
    border: 2px solid #e9ecef;
    border-radius: 8px;
  }

  h2 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    color: #333;
  }

  .info {
    color: #666;
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
  }

  .options {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .option {
    display: flex;
    align-items: center;
    padding: 1rem;
    border: 2px solid #e9ecef;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .option:hover {
    border-color: #667eea;
    background: #f8f9ff;
  }

  .option input {
    margin-right: 1rem;
  }

  .option span {
    font-size: 1.1rem;
    color: #333;
  }

  .btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    width: 100%;
  }

  .btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  .btn-vote {
    margin-top: 1rem;
  }

  .success {
    margin-top: 1rem;
    padding: 1rem;
    background: #d4edda;
    border: 1px solid #c3e6cb;
    border-radius: 8px;
    color: #155724;
  }

  .success code {
    background: #c3e6cb;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
  }

  .info-section {
    margin-top: 2rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
  }

  h3 {
    font-size: 1.2rem;
    margin-bottom: 0.75rem;
    color: #333;
  }

  ol {
    margin-left: 1.5rem;
    color: #666;
    line-height: 1.8;
  }
</style>
