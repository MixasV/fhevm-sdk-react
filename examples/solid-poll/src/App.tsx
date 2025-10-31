import { createSignal, Show, For } from 'solid-js'
import { FHEVMProvider, useFHEVM } from '@mixaspro/solid'
import { createWallet } from '@mixaspro/solid'
import { createEncrypt } from '@mixaspro/solid'

const POLL_ABI = [
  {
    inputs: [{ name: 'encryptedChoice', type: 'bytes' }],
    name: 'vote',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getResults',
    outputs: [{ name: '', type: 'euint32[]' }],
    stateMutability: 'view',
    type: 'function',
  },
]

const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'

const pollOptions = [
  { id: 0, title: '🍕 Pizza', description: 'Classic choice' },
  { id: 1, title: '🍔 Burger', description: 'American favorite' },
  { id: 2, title: '🍜 Ramen', description: 'Asian delight' },
  { id: 3, title: '🌮 Tacos', description: 'Mexican taste' },
]

function PollContent() {
  const fhevm = useFHEVM()
  const wallet = createWallet()
  const encrypt = createEncrypt()
  
  const [selectedOption, setSelectedOption] = createSignal<number | null>(null)
  const [isVoting, setIsVoting] = createSignal(false)
  const [hasVoted, setHasVoted] = createSignal(false)
  const [txHash, setTxHash] = createSignal('')

  const handleConnect = async () => {
    try {
      await wallet.connect((window as any).ethereum)
    } catch (error) {
      console.error('Failed to connect:', error)
      alert('Failed to connect wallet')
    }
  }

  const handleVote = async () => {
    const choice = selectedOption()
    if (choice === null) {
      alert('Please select an option')
      return
    }

    setIsVoting(true)
    try {
      const encrypted = await encrypt.encrypt(choice, 'euint32')
      
      // In real app, would call contract
      setTxHash('0x1234567890abcdef')
      setHasVoted(true)
      alert('Vote submitted successfully!')
    } catch (error) {
      console.error('Vote failed:', error)
      alert(`Failed to vote: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsVoting(false)
    }
  }

  const shortAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <div class="container">
      <header>
        <h1>📊 Private Poll</h1>
        <p class="subtitle">Solid.js + FHEVM SDK</p>
        <Show when={fhevm.network()}>
          <p class="network">Network: {fhevm.network()?.name || 'Unknown'}</p>
        </Show>
      </header>

      <Show when={!fhevm.isInitialized()}>
        <div class="loading">Initializing FHEVM...</div>
      </Show>

      <Show when={fhevm.isInitialized()}>
        <Show
          when={wallet.address()}
          fallback={
            <div class="wallet-section">
              <button 
                onClick={handleConnect}
                disabled={wallet.isConnecting()}
                class="btn btn-primary"
              >
                {wallet.isConnecting() ? 'Connecting...' : 'Connect Wallet'}
              </button>
            </div>
          }
        >
          <div class="main-content">
            <div class="wallet-info">
              <p><strong>Connected:</strong> {shortAddress(wallet.address()!)}</p>
              <button onClick={() => wallet.disconnect()} class="btn btn-secondary">
                Disconnect
              </button>
            </div>

            <Show when={!hasVoted()}>
              <div class="card">
                <h2>🗳️ What's your favorite food?</h2>
                <p class="poll-description">
                  Your vote is encrypted and completely private. No one can see what you voted for!
                </p>

                <div class="options">
                  <For each={pollOptions}>
                    {(option) => (
                      <div
                        class={`option ${selectedOption() === option.id ? 'selected' : ''}`}
                        onClick={() => setSelectedOption(option.id)}
                      >
                        <div class="option-title">{option.title}</div>
                        <div class="option-description">{option.description}</div>
                      </div>
                    )}
                  </For>
                </div>

                <button
                  onClick={handleVote}
                  disabled={isVoting() || selectedOption() === null}
                  class="btn btn-primary"
                >
                  {isVoting() ? 'Submitting Vote...' : 'Submit Private Vote'}
                </button>
              </div>
            </Show>

            <Show when={hasVoted()}>
              <div class="card success-card">
                <h2>✅ Vote Submitted!</h2>
                <p>Your vote has been recorded privately on the blockchain.</p>
                <p class="tx-hash">TX: {shortAddress(txHash())}</p>
                <p class="privacy-note">
                  🔒 Your choice is encrypted and cannot be viewed by anyone, 
                  including the contract owner.
                </p>
              </div>
            </Show>

            <div class="card info-card">
              <h3>ℹ️ How it works</h3>
              <ul>
                <li>Your vote is encrypted using Fully Homomorphic Encryption (FHE)</li>
                <li>Only encrypted data is stored on-chain</li>
                <li>Results can be computed without revealing individual votes</li>
                <li>Complete privacy guaranteed by cryptography</li>
              </ul>
            </div>
          </div>
        </Show>
      </Show>
    </div>
  )
}

export default function App() {
  return (
    <FHEVMProvider
      config={{
        chainId: 11155111,
        rpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com'
      }}
      autoInit={true}
    >
      <PollContent />
    </FHEVMProvider>
  )
}
