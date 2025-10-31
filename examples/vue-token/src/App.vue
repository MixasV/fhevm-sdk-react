<template>
  <div class="container">
    <header>
      <h1>🪙 FHEVM Encrypted Token</h1>
      <p class="subtitle">Vue 3 + FHEVM SDK Example</p>
      <p v-if="fhevm.network.value" class="network">
        Network: {{ fhevm.network.value.name }}
      </p>
    </header>

    <div v-if="!fhevm.isInitialized.value" class="loading">
      Initializing FHEVM...
    </div>

    <template v-else>
      <div v-if="!wallet.address.value" class="wallet-section">
        <button 
          @click="wallet.connect((window as any).ethereum)" 
          :disabled="wallet.isConnecting.value"
          class="btn btn-primary"
        >
          {{ wallet.isConnecting.value ? 'Connecting...' : 'Connect Wallet' }}
        </button>
      </div>

      <div v-else class="main-content">
        <div class="wallet-info">
          <p><strong>Connected:</strong> {{ shortAddress(wallet.address.value!) }}</p>
          <button @click="wallet.disconnect" class="btn btn-secondary">
            Disconnect
          </button>
        </div>

        <div class="card">
          <h2>💰 Private Balance</h2>
          <p class="balance">{{ balance || '***' }} TOKENS</p>
          <div class="button-group">
            <button 
              @click="handleViewBalance" 
              :disabled="isViewing || encrypt.isEncrypting.value"
              class="btn"
            >
              {{ isViewing ? 'Encrypting...' : '🔒 Encrypt Balance' }}
            </button>
            <button 
              v-if="lastEncryptedHandle"
              @click="handleRevealBalance" 
              :disabled="decrypt.isDecrypting.value"
              class="btn btn-reveal"
            >
              {{ decrypt.isDecrypting.value ? 'Decrypting...' : '🔓 Reveal Balance' }}
            </button>
          </div>
          <div v-if="decryptedBalance !== null" class="decrypted-info">
            ✅ Decrypted: <strong>{{ decryptedBalance.toString() }} TOKENS</strong>
          </div>
        </div>

        <div class="card">
          <h2>📤 Transfer Tokens</h2>
          <div class="form-group">
            <label>Recipient Address:</label>
            <input 
              v-model="recipient" 
              type="text"
              placeholder="0x..."
              class="input"
            />
          </div>
          <div class="form-group">
            <label>Amount:</label>
            <input 
              v-model.number="amount" 
              type="number"
              placeholder="0"
              class="input"
            />
          </div>
          <button 
            @click="handleTransfer" 
            :disabled="isTransferring"
            class="btn btn-primary"
          >
            {{ isTransferring ? 'Transferring...' : 'Transfer' }}
          </button>
        </div>

        <div v-if="txHash" class="success">
          ✅ Transaction: {{ shortAddress(txHash) }}
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useFHEVM, useWallet, useEncrypt, useDecrypt } from '@mixaspro/vue'

const fhevm = useFHEVM({
  chainId: 11155111,
  rpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com'
})

const wallet = useWallet()
const encrypt = useEncrypt()
const decrypt = useDecrypt()

const balance = ref<string | null>(null)
const recipient = ref('')
const amount = ref(0)
const txHash = ref('')
const isViewing = ref(false)
const isTransferring = ref(false)
const lastEncryptedHandle = ref<string | null>(null)
const decryptedBalance = ref<bigint | null>(null)

const TOKEN_ABI = [
  {
    inputs: [],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'euint64' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'encryptedAmount', type: 'bytes' }
    ],
    name: 'transfer',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
]

const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'

async function handleViewBalance() {
  isViewing.value = true
  try {
    // Encrypt a mock balance to demonstrate encryption
    const mockBalance = 1000
    const encrypted = await encrypt.encrypt(mockBalance, 'euint64')
    
    // Store handle for decryption
    if (encrypted && encrypted.handle) {
      lastEncryptedHandle.value = encrypted.handle
      balance.value = '***'
      alert('Balance encrypted! Click "Reveal Balance" to decrypt.')
    }
  } catch (error) {
    console.error('Failed to encrypt balance:', error)
    alert('Failed to encrypt balance')
  } finally {
    isViewing.value = false
  }
}

async function handleRevealBalance() {
  if (!lastEncryptedHandle.value) {
    alert('No encrypted balance. Click "View Balance" first.')
    return
  }

  try {
    const result = await decrypt.decrypt(lastEncryptedHandle.value)
    decryptedBalance.value = result as bigint
    balance.value = decryptedBalance.value.toString()
  } catch (error) {
    console.error('Failed to decrypt balance:', error)
    alert(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

async function handleTransfer() {
  if (!recipient.value || !amount.value) {
    alert('Please fill all fields')
    return
  }

  isTransferring.value = true
  try {
    const encrypted = await encrypt.encrypt(amount.value, 'euint64')
    
    // In real app, would call contract
    txHash.value = '0x1234...5678'
    alert('Transfer successful!')
    
    recipient.value = ''
    amount.value = 0
  } catch (error) {
    console.error('Transfer failed:', error)
    alert('Transfer failed')
  } finally {
    isTransferring.value = false
  }
}

function shortAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}
</script>

<style scoped>
.balance {
  font-size: 2rem;
  font-weight: bold;
  color: #10b981;
  margin: 1rem 0;
}

.button-group {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}

.button-group .btn {
  flex: 1;
}

.btn-reveal {
  background: linear-gradient(135deg, #38b2ac 0%, #319795 100%);
}

.btn-reveal:hover:not(:disabled) {
  background: linear-gradient(135deg, #319795 0%, #2c7a7b 100%);
}

.decrypted-info {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 8px;
  color: #155724;
  text-align: center;
}

.decrypted-info strong {
  font-size: 1.1rem;
}
</style>
