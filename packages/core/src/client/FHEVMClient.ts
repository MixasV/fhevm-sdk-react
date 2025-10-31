/**
 * Main FHEVM Client implementation
 * 
 * Provides encryption, decryption, and contract interaction for FHEVM
 * 
 * @packageDocumentation
 */

import { BrowserProvider, Contract, JsonRpcProvider, type Eip1193Provider } from 'ethers'
import type { FhevmInstance } from '@zama-fhe/relayer-sdk/web'

import { initSDK, getSDK } from './sdk-loader'
import {
  ContractError,
  DecryptionError,
  EncryptionError,
  InitializationError,
  ValidationError,
  WalletError,
} from '../errors'
import type {
  ContractFunctionParams,
  DecryptionCallback,
  DecryptionRequest,
  DecryptionResult,
  EncryptedType,
  EncryptedValue,
  EncryptionOptions,
  FHEVMConfig,
  NetworkInfo,
  TransactionReceipt,
  Unsubscribe,
  WalletInfo,
} from '../types'
import { isValidEncryptedType } from '../utils'

/**
 * Core FHEVM client for encryption, decryption, and contract interaction
 * 
 * @example
 * ```typescript
 * const client = new FHEVMClient()
 * await client.initialize({ chainId: 31337, rpcUrl: 'http://localhost:8545' })
 * 
 * const encrypted = await client.encrypt(42, 'euint32')
 * console.log('Encrypted:', encrypted)
 * ```
 */
export class FHEVMClient {
  private instance: FhevmInstance | null = null
  private config: FHEVMConfig | null = null
  private provider: JsonRpcProvider | BrowserProvider | null = null
  private wallet: WalletInfo | null = null
  private decryptionCallbacks: Map<string, DecryptionCallback> = new Map()
  private decryptionRequests: Map<string, DecryptionRequest> = new Map()

  /**
   * Initialize the FHEVM client
   * 
   * @param config - Configuration options including chainId and RPC URL
   * @returns Promise that resolves when initialization is complete
   * 
   * @throws {InitializationError} If WASM loading or setup fails
   * @throws {ValidationError} If configuration is invalid
   * 
   * @example
   * ```typescript
   * await client.initialize({
   *   chainId: 31337,
   *   rpcUrl: 'http://localhost:8545'
   * })
   * ```
   */
  async initialize(config: FHEVMConfig): Promise<void> {
    if (!config.chainId) {
      throw new ValidationError('chainId is required in config')
    }

    try {
      // Initialize FHEVM SDK with optional WASM path
      const initOptions: Parameters<typeof initSDK>[0] = {
        thread: 1 // Disable workers to avoid CORS issues
      }
      if (config.wasmPath) {
        // Pass URL strings directly as InitInput for WASM files
        initOptions.tfheParams = `${config.wasmPath}tfhe_bg.wasm`
        initOptions.kmsParams = `${config.wasmPath}kms_lib_bg.wasm`
      }
      await initSDK(initOptions)

      // Store config
      this.config = config

      // Create provider
      if (config.rpcUrl) {
        this.provider = new JsonRpcProvider(config.rpcUrl)
      }

      // Create FHEVM instance (relayer-sdk handles public key fetching)
      this.instance = await this.createFhevmInstance()
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error
      }
      throw new InitializationError(
        `Failed to initialize FHEVM: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Connect wallet to the client
   * 
   * @param provider - EIP-1193 provider (e.g., window.ethereum)
   * @returns Promise resolving to wallet information
   * 
   * @throws {WalletError} If wallet connection fails
   * @throws {ValidationError} If provider is invalid
   * 
   * @example
   * ```typescript
   * const wallet = await client.connectWallet(window.ethereum)
   * console.log('Connected:', wallet.address)
   * ```
   */
  async connectWallet(provider: Eip1193Provider): Promise<WalletInfo> {
    if (!provider) {
      throw new ValidationError('Provider is required')
    }

    try {
      const browserProvider = new BrowserProvider(provider)
      
      // Request account access
      const accounts = await browserProvider.send('eth_requestAccounts', [])
      
      if (!accounts || accounts.length === 0) {
        throw new WalletError('No accounts found')
      }

      const network = await browserProvider.getNetwork()
      
      const walletInfo: WalletInfo = {
        address: accounts[0] as string,
        chainId: Number(network.chainId),
        provider,
      }

      this.wallet = walletInfo
      this.provider = browserProvider

      return walletInfo
    } catch (error) {
      if (error instanceof ValidationError || error instanceof WalletError) {
        throw error
      }
      throw new WalletError(
        `Failed to connect wallet: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Encrypt a value using FHEVM
   * 
   * @param value - The plaintext value to encrypt
   * @param type - The encrypted type (e.g., 'euint32')
   * @param options - Optional encryption options
   * @returns Promise resolving to the encrypted value
   * 
   * @throws {ValidationError} If value or type is invalid
   * @throws {EncryptionError} If encryption operation fails
   * @throws {InitializationError} If FHEVM client not initialized
   * 
   * @example
   * ```typescript
   * const encrypted = await client.encrypt(42, 'euint32')
   * console.log(encrypted.handle) // '0x...'
   * ```
   */
  async encrypt(
    value: number | bigint | boolean,
    type: EncryptedType,
    options?: EncryptionOptions
  ): Promise<EncryptedValue> {
    if (!this.instance) {
      throw new InitializationError('FHEVM client not initialized. Call initialize() first.')
    }

    if (!isValidEncryptedType(type)) {
      throw new ValidationError(`Invalid encrypted type: ${type}`)
    }

    if (value === null || value === undefined) {
      throw new ValidationError('Value cannot be null or undefined')
    }

    // Validate contract address and user address for encryption
    const contractAddress = options?.contractAddress || '0x0000000000000000000000000000000000000000'
    const userAddress = options?.userAddress || this.wallet?.address || '0x0000000000000000000000000000000000000000'

    try {
      // Create encrypted input using relayer-sdk
      const encryptedInput = this.instance.createEncryptedInput(contractAddress, userAddress)

      // Add value based on type
      switch (type) {
        case 'ebool':
          encryptedInput.addBool(value)
          break
        case 'euint8':
          encryptedInput.add8(typeof value === 'boolean' ? (value ? 1 : 0) : value)
          break
        case 'euint16':
          encryptedInput.add16(typeof value === 'boolean' ? (value ? 1 : 0) : value)
          break
        case 'euint32':
          encryptedInput.add32(typeof value === 'boolean' ? (value ? 1 : 0) : value)
          break
        case 'euint64':
          encryptedInput.add64(typeof value === 'boolean' ? (value ? 1 : 0) : value)
          break
        case 'euint128':
          encryptedInput.add128(typeof value === 'boolean' ? (value ? 1 : 0) : value)
          break
        case 'euint256':
          encryptedInput.add256(typeof value === 'boolean' ? (value ? 1 : 0) : value)
          break
        case 'eaddress':
          if (typeof value === 'string') {
            encryptedInput.addAddress(value)
          } else {
            throw new ValidationError('Address type requires string value')
          }
          break
        default:
          throw new ValidationError(`Unsupported encrypted type: ${type}`)
      }

      // Encrypt using relayer-sdk
      const encryptionResult = await encryptedInput.encrypt()

      // Get the first handle (most common case - single value encryption)
      const handle = encryptionResult.handles[0]
      if (!handle) {
        throw new EncryptionError('Encryption did not return a handle')
      }

      // Convert handle to hex string
      const handleHex = '0x' + Array.from(handle)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')

      return {
        type,
        value: handle,
        handle: handleHex,
        inputProof: encryptionResult.inputProof,
        metadata: {
          encryptedAt: Date.now(),
          contractAddress,
          userAddress,
        },
      }
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error
      }
      throw new EncryptionError(
        `Failed to encrypt value: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Request decryption of an encrypted value
   * 
   * @param ciphertext - The encrypted value to decrypt
   * @returns Promise resolving to decryption request
   * 
   * @throws {ValidationError} If ciphertext is invalid
   * @throws {DecryptionError} If request creation fails
   * @throws {InitializationError} If FHEVM client not initialized
   * 
   * @example
   * ```typescript
   * const request = await client.requestDecryption(encrypted.value)
   * const result = await client.waitForDecryption(request.id)
   * console.log('Decrypted:', result.value)
   * ```
   */
  async requestDecryption(ciphertext: Uint8Array): Promise<DecryptionRequest> {
    if (!this.instance) {
      throw new InitializationError('FHEVM client not initialized. Call initialize() first.')
    }

    if (!ciphertext || ciphertext.length === 0) {
      throw new ValidationError('Ciphertext cannot be empty')
    }

    try {
      const requestId = this.generateRequestId()
      
      const request: DecryptionRequest = {
        id: requestId,
        ciphertext,
        requestedAt: Date.now(),
        status: 'pending',
      }

      this.decryptionRequests.set(requestId, request)

      // Simulate async decryption (in real implementation this would call gateway)
      this.simulateAsyncDecryption(requestId, ciphertext)

      return request
    } catch (error) {
      throw new DecryptionError(
        `Failed to request decryption: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Wait for decryption to complete
   * 
   * @param requestId - ID of the decryption request
   * @param timeout - Maximum time to wait in milliseconds
   * @returns Promise resolving to decrypted value
   * 
   * @throws {DecryptionError} If decryption fails or times out
   * @throws {ValidationError} If request ID is invalid
   * 
   * @example
   * ```typescript
   * const result = await client.waitForDecryption(request.id, 30000)
   * console.log('Value:', result.value)
   * ```
   */
  async waitForDecryption(requestId: string, timeout: number = 30000): Promise<DecryptionResult> {
    if (!requestId) {
      throw new ValidationError('Request ID is required')
    }

    const request = this.decryptionRequests.get(requestId)
    if (!request) {
      throw new ValidationError(`Decryption request not found: ${requestId}`)
    }

    return new Promise((resolve, reject) => {
      const startTime = Date.now()
      
      const checkStatus = (): void => {
        const currentRequest = this.decryptionRequests.get(requestId)
        
        if (!currentRequest) {
          reject(new DecryptionError('Decryption request was cancelled'))
          return
        }

        if (currentRequest.status === 'completed') {
          // Request completed, result should be available
          resolve({
            requestId,
            value: BigInt(0), // Placeholder - real implementation would have actual value
            completedAt: Date.now(),
          })
          return
        }

        if (currentRequest.status === 'failed') {
          reject(new DecryptionError('Decryption request failed'))
          return
        }

        if (Date.now() - startTime > timeout) {
          reject(new DecryptionError(`Decryption timeout after ${timeout}ms`))
          return
        }

        // Check again in 100ms
        setTimeout(checkStatus, 100)
      }

      checkStatus()
    })
  }

  /**
   * Subscribe to decryption events
   * 
   * @param callback - Function to call when decryption completes
   * @returns Unsubscribe function
   * 
   * @example
   * ```typescript
   * const unsubscribe = client.onDecryption((result) => {
   *   console.log('Decrypted:', result.value)
   * })
   * 
   * // Later: unsubscribe()
   * ```
   */
  onDecryption(callback: DecryptionCallback): Unsubscribe {
    const id = this.generateRequestId()
    this.decryptionCallbacks.set(id, callback)

    return () => {
      this.decryptionCallbacks.delete(id)
    }
  }

  /**
   * Execute a contract function with encrypted parameters
   * 
   * @param params - Contract function parameters
   * @returns Promise resolving to transaction receipt
   * 
   * @throws {ContractError} If contract call fails
   * @throws {ValidationError} If parameters are invalid
   * @throws {InitializationError} If wallet not connected
   * 
   * @example
   * ```typescript
   * const receipt = await client.executeContract({
   *   address: '0x...',
   *   abi: contractABI,
   *   functionName: 'setEncrypted',
   *   args: [encrypted.value]
   * })
   * ```
   */
  async executeContract(params: ContractFunctionParams): Promise<TransactionReceipt> {
    if (!this.provider) {
      throw new InitializationError('Provider not initialized')
    }

    if (!this.wallet) {
      throw new InitializationError('Wallet not connected. Call connectWallet() first.')
    }

    if (!params.address || !params.abi || !params.functionName) {
      throw new ValidationError('Address, ABI, and function name are required')
    }

    try {
      const signer = await (this.provider as BrowserProvider).getSigner()
      const contract = new Contract(params.address, params.abi as any, signer)

      // Get contract function
      const contractFunction = contract[params.functionName]
      if (!contractFunction || typeof contractFunction !== 'function') {
        throw new ContractError(`Function ${params.functionName} not found in contract`)
      }

      // Call contract function
      const tx = await contractFunction(...(params.args || []), {
        value: params.value ? BigInt(params.value) : undefined,
        gasLimit: params.gasLimit ? BigInt(params.gasLimit) : undefined,
      })

      // Wait for transaction
      const receipt = await tx.wait()

      return {
        hash: receipt.hash,
        blockNumber: receipt.blockNumber,
        blockHash: receipt.blockHash,
        status: receipt.status,
        gasUsed: receipt.gasUsed,
      }
    } catch (error) {
      throw new ContractError(
        `Failed to execute contract function: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Get current network information
   * 
   * @returns Network information or null if not connected
   * 
   * @example
   * ```typescript
   * const network = client.getNetwork()
   * console.log('Chain ID:', network?.chainId)
   * ```
   */
  getNetwork(): NetworkInfo | null {
    if (!this.config) {
      return null
    }

    return {
      chainId: this.config.chainId,
      name: this.getNetworkName(this.config.chainId),
      rpcUrl: this.config.rpcUrl,
    }
  }

  /**
   * Get current wallet information
   * 
   * @returns Wallet information or null if not connected
   * 
   * @example
   * ```typescript
   * const wallet = client.getWallet()
   * console.log('Address:', wallet?.address)
   * ```
   */
  getWallet(): WalletInfo | null {
    return this.wallet
  }

  /**
   * Get FHEVM instance for advanced operations
   * 
   * @returns FhevmInstance or null if not initialized
   * 
   * @example
   * ```typescript
   * const instance = client.getInstance()
   * if (instance) {
   *   const decrypted = await instance.publicDecrypt(['0x...'])
   * }
   * ```
   */
  getInstance(): FhevmInstance | null {
    return this.instance
  }

  /**
   * Check if client is initialized
   * 
   * @returns True if client is initialized
   * 
   * @example
   * ```typescript
   * if (client.isInitialized()) {
   *   // Ready to use
   * }
   * ```
   */
  isInitialized(): boolean {
    return this.instance !== null && this.config !== null
  }

  /**
   * Reset the client state
   * 
   * @example
   * ```typescript
   * await client.reset()
   * // Client is now uninitialized
   * ```
   */
  async reset(): Promise<void> {
    this.instance = null
    this.config = null
    this.provider = null
    this.wallet = null
    this.decryptionCallbacks.clear()
    this.decryptionRequests.clear()
  }

  // Private helper methods

  private async createFhevmInstance(): Promise<FhevmInstance> {
    if (!this.config) {
      throw new InitializationError('Config required to create instance')
    }

    try {
      const sdk = getSDK()
      
      // Use SepoliaConfig from relayer-sdk for Sepolia testnet
      // Or custom config for local/other networks
      let instanceConfig
      
      if (this.config.chainId === 11155111) {
        // Sepolia - use pre-configured setup from relayer-sdk
        instanceConfig = {
          ...sdk.SepoliaConfig,
          ...(this.config.rpcUrl && { network: this.config.rpcUrl }),
        }
      } else if (this.config.chainId === 31337) {
        // Hardhat local - use default config
        instanceConfig = {
          ...sdk.SepoliaConfig, // Use Sepolia as base
          chainId: 31337,
          gatewayChainId: 31337,
          ...(this.config.rpcUrl && { network: this.config.rpcUrl }),
        }
      } else {
        // Other networks - use Sepolia config as fallback
        instanceConfig = {
          ...sdk.SepoliaConfig,
          chainId: this.config.chainId,
          ...(this.config.rpcUrl && { network: this.config.rpcUrl }),
        }
      }

      const instance = await sdk.createInstance(instanceConfig)

      return instance
    } catch (error) {
      throw new InitializationError(
        `Failed to create FHEVM instance: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  private generateHandle(): string {
    const bytes = new Uint8Array(32)
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(bytes)
    } else {
      // Fallback for environments without crypto
      for (let i = 0; i < bytes.length; i++) {
        bytes[i] = Math.floor(Math.random() * 256)
      }
    }
    return '0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  }



  private getNetworkName(chainId: number): string {
    const networks: Record<number, string> = {
      1: 'Ethereum Mainnet',
      5: 'Goerli Testnet',
      11155111: 'Sepolia Testnet',
      31337: 'Hardhat Local',
      8009: 'Zama Devnet (Deprecated)',
    }
    return networks[chainId] || `Unknown (${chainId})`
  }

  private simulateAsyncDecryption(requestId: string, _ciphertext: Uint8Array): void {
    // Simulate async decryption with delay
    setTimeout(() => {
      const request = this.decryptionRequests.get(requestId)
      if (!request) {
        return
      }

      // Update status to completed
      this.decryptionRequests.set(requestId, {
        ...request,
        status: 'completed',
      })

      // Notify callbacks
      const result: DecryptionResult = {
        requestId,
        value: BigInt(42), // Mock decrypted value
        completedAt: Date.now(),
      }

      this.decryptionCallbacks.forEach(callback => {
        try {
          callback(result)
        } catch (error) {
          console.error('Error in decryption callback:', error)
        }
      })
    }, 1000) // Simulate 1 second delay
  }
}
