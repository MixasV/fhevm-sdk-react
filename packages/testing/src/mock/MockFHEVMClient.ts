/**
 * Mock FHEVM Client for testing
 * 
 * @packageDocumentation
 */

import type {
  ContractFunctionParams,
  DecryptionRequest,
  DecryptionResult,
  Eip1193Provider,
  EncryptedType,
  EncryptedValue,
  EncryptionOptions,
  FHEVMConfig,
  NetworkInfo,
  TransactionReceipt,
  WalletInfo,
} from '@mixaspro/core'

/**
 * Mock FHEVM Client for testing
 * 
 * @example
 * ```typescript
 * import { MockFHEVMClient } from '@mixaspro/testing'
 * 
 * describe('MyComponent', () => {
 *   let mockClient: MockFHEVMClient
 * 
 *   beforeEach(() => {
 *     mockClient = new MockFHEVMClient()
 *     mockClient.setMockEncryptedValue({
 *       type: 'euint32',
 *       value: new Uint8Array([1, 2, 3]),
 *       handle: '0xmock123'
 *     })
 *   })
 * 
 *   it('encrypts value', async () => {
 *     const encrypted = await mockClient.encrypt(42, 'euint32')
 *     expect(encrypted.handle).toBe('0xmock123')
 *   })
 * })
 * ```
 */
export class MockFHEVMClient {
  private _isInitialized = false
  private _config: FHEVMConfig | null = null
  private _wallet: WalletInfo | null = null
  private _network: NetworkInfo | null = null
  
  // Mock data
  private mockEncryptedValue: EncryptedValue | null = null
  private mockDecryptedValue: bigint | boolean = BigInt(42)
  private mockTransactionReceipt: TransactionReceipt | null = null
  
  // Call tracking
  public initializeCalls: FHEVMConfig[] = []
  public connectWalletCalls: unknown[] = []
  public encryptCalls: Array<{ value: unknown; type: EncryptedType; options?: EncryptionOptions }> = []
  public decryptCalls: Uint8Array[] = []
  public executeContractCalls: ContractFunctionParams[] = []

  /**
   * Initialize mock client
   */
  async initialize(config: FHEVMConfig): Promise<void> {
    this.initializeCalls.push(config)
    this._config = config
    this._isInitialized = true
    this._network = {
      chainId: config.chainId,
      name: 'Mock Network',
    }
  }

  /**
   * Connect mock wallet
   */
  async connectWallet(provider: unknown): Promise<WalletInfo> {
    this.connectWalletCalls.push(provider)
    const wallet: WalletInfo = {
      address: '0x1234567890123456789012345678901234567890',
      chainId: this._config?.chainId ?? 31337,
      provider: provider as Eip1193Provider,
    }
    this._wallet = wallet
    return wallet
  }

  /**
   * Disconnect wallet
   */
  disconnectWallet(): void {
    this._wallet = null
  }

  /**
   * Mock encrypt
   */
  async encrypt(
    value: number | bigint | boolean,
    type: EncryptedType,
    options?: EncryptionOptions
  ): Promise<EncryptedValue> {
    this.encryptCalls.push({ value, type, options })
    
    if (this.mockEncryptedValue !== null && this.mockEncryptedValue !== undefined) {
      return this.mockEncryptedValue
    }
    
    return {
      type,
      value: new Uint8Array([1, 2, 3, 4]),
      handle: `0x${Math.random().toString(16).slice(2)}`,
      metadata: { encryptedAt: Date.now() },
    }
  }

  /**
   * Mock decrypt request
   */
  async requestDecryption(ciphertext: Uint8Array): Promise<DecryptionRequest> {
    this.decryptCalls.push(ciphertext)
    
    return {
      id: `req-${Math.random().toString(16).slice(2)}`,
      ciphertext,
      requestedAt: Date.now(),
      status: 'pending',
    }
  }

  /**
   * Mock decrypt wait
   */
  async waitForDecryption(requestId: string, _timeout?: number): Promise<DecryptionResult> {
    return {
      requestId,
      value: this.mockDecryptedValue ?? BigInt(42),
      completedAt: Date.now(),
    }
  }

  /**
   * Mock contract execution
   */
  async executeContract(params: ContractFunctionParams): Promise<TransactionReceipt> {
    this.executeContractCalls.push(params)
    
    if (this.mockTransactionReceipt !== null && this.mockTransactionReceipt !== undefined) {
      return this.mockTransactionReceipt
    }
    
    return {
      hash: `0x${Math.random().toString(16).slice(2).padStart(64, '0')}`,
      blockNumber: Math.floor(Math.random() * 1000000),
      blockHash: `0x${Math.random().toString(16).slice(2).padStart(64, '0')}`,
      status: 1,
      gasUsed: BigInt(21000),
    }
  }

  /**
   * Get network info
   */
  getNetwork(): NetworkInfo {
    if (this._network === null || this._network === undefined) {
      throw new Error('Client not initialized')
    }
    return this._network
  }

  /**
   * Get wallet info
   */
  getWallet(): WalletInfo | null {
    return this._wallet
  }

  /**
   * Check if initialized
   */
  isInitialized(): boolean {
    return this._isInitialized
  }

  /**
   * Set mock encrypted value
   */
  setMockEncryptedValue(value: EncryptedValue): void {
    this.mockEncryptedValue = value
  }

  /**
   * Set mock decrypted value
   */
  setMockDecryptedValue(value: bigint | boolean): void {
    this.mockDecryptedValue = value
  }

  /**
   * Set mock transaction receipt
   */
  setMockTransactionReceipt(receipt: TransactionReceipt): void {
    this.mockTransactionReceipt = receipt
  }

  /**
   * Reset all mocks
   */
  reset(): void {
    this._isInitialized = false
    this._config = null
    this._wallet = null
    this._network = null
    this.mockEncryptedValue = null
    this.mockDecryptedValue = BigInt(42)
    this.mockTransactionReceipt = null
    this.initializeCalls = []
    this.connectWalletCalls = []
    this.encryptCalls = []
    this.decryptCalls = []
    this.executeContractCalls = []
  }

  /**
   * Get number of calls to a method
   */
  getCallCount(method: 'initialize' | 'connectWallet' | 'encrypt' | 'decrypt' | 'executeContract'): number {
    switch (method) {
      case 'initialize':
        return this.initializeCalls.length
      case 'connectWallet':
        return this.connectWalletCalls.length
      case 'encrypt':
        return this.encryptCalls.length
      case 'decrypt':
        return this.decryptCalls.length
      case 'executeContract':
        return this.executeContractCalls.length
      default:
        return 0
    }
  }
}
