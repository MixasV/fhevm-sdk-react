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
          <button 
            @click="handleViewBalance" 
            :disabled="isViewing"
            class="btn"
          >
            {{ isViewing ? 'Viewing...' : 'View Balance' }}
          </button>
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
import { useFHEVM, useWallet, useEncrypt } from '@mixaspro/vue'

const fhevm = useFHEVM({
  chainId: 11155111,
  rpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com'
})

const wallet = useWallet()
const encrypt = useEncrypt()

const balance = ref<string | null>(null)
const recipient = ref('')
const amount = ref(0)
const txHash = ref('')
const isViewing = ref(false)
const isTransferring = ref(false)

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
    // In real app, would call contract and decrypt
    balance.value = '1000'
    alert('Balance retrieved!')
  } catch (error) {
    console.error('Failed to view balance:', error)
    alert('Failed to view balance')
  } finally {
    isViewing.value = false
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
</style>
