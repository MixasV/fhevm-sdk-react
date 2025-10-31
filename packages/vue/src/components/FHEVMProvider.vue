<script setup lang="ts">
/**
 * FHEVM Provider component for Vue
 * 
 * @packageDocumentation
 */

import { ref, provide, onMounted, watch } from 'vue'
import { FHEVMClient } from '@fhevm-sdk/core'
import { FHEVMContextKey } from '../composables/useFHEVM'
import type { FHEVMConfig, NetworkInfo, WalletInfo } from '@fhevm-sdk/core'
import type { FHEVMContext } from '../composables/useFHEVM'

/**
 * Component props
 */
interface Props {
  /**
   * FHEVM configuration
   */
  config: FHEVMConfig

  /**
   * Auto-initialize on mount
   */
  autoInit?: boolean

  /**
   * Auto-connect wallet on mount
   */
  autoConnect?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  autoInit: true,
  autoConnect: false,
})

/**
 * Component emits
 */
interface Emits {
  (e: 'initialized', client: FHEVMClient): void
  (e: 'error', error: Error): void
  (e: 'wallet-connected', wallet: WalletInfo): void
  (e: 'wallet-disconnected'): void
}

const emit = defineEmits<Emits>()

// State
const client = ref<FHEVMClient | null>(null)
const isInitialized = ref(false)
const network = ref<NetworkInfo | null>(null)
const wallet = ref<WalletInfo | null>(null)
const error = ref<Error | null>(null)

/**
 * Initialize FHEVM client
 */
async function initialize(): Promise<void> {
  try {
    error.value = null
    
    const fhevmClient = new FHEVMClient()
    await fhevmClient.initialize(props.config)
    
    client.value = fhevmClient
    isInitialized.value = true
    network.value = fhevmClient.getNetwork()
    
    emit('initialized', fhevmClient)
    
    // Auto-connect if requested
    if (props.autoConnect && (window as any).ethereum) {
      try {
        const walletInfo = await fhevmClient.connectWallet((window as any).ethereum)
        wallet.value = walletInfo
        emit('wallet-connected', walletInfo)
      } catch (walletError) {
        console.warn('Auto-connect failed:', walletError)
      }
    }
  } catch (err) {
    error.value = err instanceof Error ? err : new Error('Initialization failed')
    emit('error', error.value)
    throw error.value
  }
}

// Setup wallet listeners
function setupWalletListeners(): void {
  if (!client.value) {
    return
  }

  // Listen for wallet connection
  client.value.on?.('wallet:connected', (walletInfo: WalletInfo) => {
    wallet.value = walletInfo
    emit('wallet-connected', walletInfo)
  })

  // Listen for wallet disconnection
  client.value.on?.('wallet:disconnected', () => {
    wallet.value = null
    emit('wallet-disconnected')
  })
}

// Provide context
const context: FHEVMContext = {
  get client() { return client.value },
  get isInitialized() { return isInitialized.value },
  get network() { return network.value },
  get wallet() { return wallet.value },
  get error() { return error.value },
}

provide(FHEVMContextKey, context)

// Initialize on mount
onMounted(() => {
  if (props.autoInit) {
    initialize().then(() => {
      setupWalletListeners()
    })
  }
})

// Watch for config changes
watch(
  () => props.config,
  () => {
    if (isInitialized.value) {
      initialize().then(() => {
        setupWalletListeners()
      })
    }
  },
  { deep: true }
)

// Expose for template ref
defineExpose({
  initialize,
  client: client.value,
  isInitialized: isInitialized.value,
})
</script>

<template>
  <slot 
    :client="client"
    :is-initialized="isInitialized"
    :network="network"
    :wallet="wallet"
    :error="error"
  />
</template>
