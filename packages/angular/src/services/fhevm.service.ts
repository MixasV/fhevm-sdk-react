/**
 * FHEVM Angular service
 * 
 * @packageDocumentation
 */

import { Injectable, OnDestroy } from '@angular/core'
import { FHEVMClient } from '@mixaspro/core'
import type {
  ContractFunctionParams,
  EncryptedType,
  EncryptedValue,
  EncryptionOptions,
  FHEVMConfig,
  NetworkInfo,
  TransactionReceipt,
  WalletInfo,
} from '@mixaspro/core'
import { BehaviorSubject, Observable, Subject, from, throwError } from 'rxjs'
import { catchError, map, takeUntil } from 'rxjs/operators'


/**
 * EIP-1193 provider interface
 */
export interface Eip1193Provider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
}

/**
 * FHEVM service for Angular applications
 * 
 * @example
 * ```typescript
 * import { Component, OnInit } from '@angular/core'
 * import { FHEVMService } from '@mixaspro/angular'
 * 
 * @Component({
 *   selector: 'app-root',
 *   template: `
 *     <div *ngIf="isInitialized$ | async">
 *       <p>Wallet: {{ (wallet$ | async)?.address }}</p>
 *       <button (click)="encrypt()">Encrypt</button>
 *     </div>
 *   `
 * })
 * export class AppComponent implements OnInit {
 *   isInitialized$ = this.fhevm.isInitialized$
 *   wallet$ = this.fhevm.wallet$
 * 
 *   constructor(private fhevm: FHEVMService) {}
 * 
 *   ngOnInit() {
 *     this.fhevm.initialize({ chainId: 31337 }).subscribe()
 *   }
 * 
 *   encrypt() {
 *     this.fhevm.encrypt(42, 'euint32').subscribe(
 *       encrypted => console.log('Encrypted:', encrypted.handle)
 *     )
 *   }
 * }
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class FHEVMService implements OnDestroy {
  private client: FHEVMClient | null = null
  private destroy$ = new Subject<void>()

  /**
   * Initialization state
   */
  private isInitializedSubject = new BehaviorSubject<boolean>(false)
  public readonly isInitialized$ = this.isInitializedSubject.asObservable()

  /**
   * Network information
   */
  private networkSubject = new BehaviorSubject<NetworkInfo | null>(null)
  public readonly network$ = this.networkSubject.asObservable()

  /**
   * Wallet information
   */
  private walletSubject = new BehaviorSubject<WalletInfo | null>(null)
  public readonly wallet$ = this.walletSubject.asObservable()

  /**
   * Error state
   */
  private errorSubject = new BehaviorSubject<Error | null>(null)
  public readonly error$ = this.errorSubject.asObservable()

  /**
   * Get current client instance
   */
  getClient(): FHEVMClient | null {
    return this.client
  }

  /**
   * Initialize FHEVM client
   * 
   * @param config - FHEVM configuration
   * @returns Observable that completes when initialized
   * 
   * @example
   * ```typescript
   * this.fhevm.initialize({ chainId: 31337 }).subscribe({
   *   next: () => console.log('Initialized'),
   *   error: (err) => console.error('Init failed:', err)
   * })
   * ```
   */
  initialize(config: FHEVMConfig): Observable<void> {
    return from(this.initializeAsync(config)).pipe(
      catchError((error) => {
        this.errorSubject.next(error instanceof Error ? error : new Error('Initialization failed'))
        return throwError(() => error)
      }),
      takeUntil(this.destroy$)
    )
  }

  private async initializeAsync(config: FHEVMConfig): Promise<void> {
    this.errorSubject.next(null)

    const fhevmClient = new FHEVMClient()
    await fhevmClient.initialize(config)

    this.client = fhevmClient
    this.isInitializedSubject.next(true)
    this.networkSubject.next(fhevmClient.getNetwork())
  }

  /**
   * Connect wallet
   * 
   * @param provider - EIP-1193 provider
   * @returns Observable of wallet info
   * 
   * @example
   * ```typescript
   * this.fhevm.connectWallet(window.ethereum).subscribe(
   *   wallet => console.log('Connected:', wallet.address)
   * )
   * ```
   */
  connectWallet(provider: Eip1193Provider): Observable<WalletInfo> {
    if (this.client === null || this.client === undefined) {
      return throwError(() => new Error('FHEVM client not initialized')) as Observable<never>
    }

    return from(this.client.connectWallet(provider)).pipe(
      map((walletInfo): WalletInfo => {
        this.walletSubject.next(walletInfo)
        return walletInfo
      }),
      catchError((error) => {
        this.errorSubject.next(error instanceof Error ? error : new Error('Wallet connection failed'))
        return throwError(() => error)
      }),
      takeUntil(this.destroy$)
    )
  }

  /**
   * Disconnect wallet
   */
  disconnectWallet(): void {
    this.walletSubject.next(null)
    this.errorSubject.next(null)
  }

  /**
   * Encrypt a value
   * 
   * @param value - Value to encrypt
   * @param type - Encrypted type
   * @param options - Encryption options
   * @returns Observable of encrypted value
   * 
   * @example
   * ```typescript
   * this.fhevm.encrypt(42, 'euint32').subscribe(
   *   encrypted => console.log('Handle:', encrypted.handle),
   *   error => console.error('Encryption failed:', error)
   * )
   * ```
   */
  encrypt(
    value: number | bigint | boolean,
    type: EncryptedType,
    options?: EncryptionOptions
  ): Observable<EncryptedValue> {
    if (this.client === null || this.client === undefined) {
      return throwError(() => new Error('FHEVM client not initialized')) as Observable<never>
    }

    return from(this.client.encrypt(value, type, options)).pipe(
      catchError((error) => {
        this.errorSubject.next(error instanceof Error ? error : new Error('Encryption failed'))
        return throwError(() => error)
      }),
      takeUntil(this.destroy$)
    )
  }

  /**
   * Decrypt a ciphertext
   * 
   * @param ciphertext - Ciphertext to decrypt
   * @param timeout - Timeout in milliseconds
   * @returns Observable of decrypted value
   * 
   * @example
   * ```typescript
   * this.fhevm.decrypt(ciphertext).subscribe(
   *   value => console.log('Decrypted:', value),
   *   error => console.error('Decryption failed:', error)
   * )
   * ```
   */
  decrypt(ciphertext: Uint8Array, timeout = 30000): Observable<bigint | boolean> {
    if (this.client === null || this.client === undefined) {
      return throwError(() => new Error('FHEVM client not initialized')) as Observable<never>
    }

    return from(this.decryptAsync(ciphertext, timeout)).pipe(
      catchError((error) => {
        this.errorSubject.next(error instanceof Error ? error : new Error('Decryption failed'))
        return throwError(() => error)
      }),
      takeUntil(this.destroy$)
    )
  }

  private async decryptAsync(ciphertext: Uint8Array, timeout: number): Promise<bigint | boolean> {
    if (this.client === null || this.client === undefined) {
      throw new Error('FHEVM client not initialized')
    }

    const request = await this.client.requestDecryption(ciphertext)
    const result = await this.client.waitForDecryption(request.id, timeout)
    return result.value
  }

  /**
   * Execute contract function
   * 
   * @param params - Contract function parameters
   * @returns Observable of transaction receipt
   * 
   * @example
   * ```typescript
   * this.fhevm.executeContract({
   *   address: '0x...',
   *   abi: contractABI,
   *   functionName: 'transfer',
   *   args: [recipient, amount]
   * }).subscribe(
   *   receipt => console.log('TX hash:', receipt.hash),
   *   error => console.error('TX failed:', error)
   * )
   * ```
   */
  executeContract(params: ContractFunctionParams): Observable<TransactionReceipt> {
    if (this.client === null || this.client === undefined) {
      return throwError(() => new Error('FHEVM client not initialized')) as Observable<never>
    }

    return from(this.client.executeContract(params)).pipe(
      catchError((error) => {
        this.errorSubject.next(error instanceof Error ? error : new Error('Contract execution failed'))
        return throwError(() => error)
      }),
      takeUntil(this.destroy$)
    )
  }

  /**
   * Cleanup on service destroy
   */
  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
    this.isInitializedSubject.complete()
    this.networkSubject.complete()
    this.walletSubject.complete()
    this.errorSubject.complete()
  }
}
