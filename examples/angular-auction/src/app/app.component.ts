import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { FHEVMClient } from '@mixaspro/core'

interface Bid {
  id: number
  timestamp: Date
  amount: string
  encryptedHandle?: string
  decryptedAmount?: bigint
  status: 'pending' | 'confirmed'
  isDecrypting?: boolean
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  private fhevm: FHEVMClient | null = null
  
  isInitialized = false
  walletAddress: string | null = null
  isConnecting = false
  
  bidAmount = 0
  isBidding = false
  bids: Bid[] = []
  
  auctionItem = {
    name: '🎨 Digital Artwork',
    description: 'Rare NFT by Famous Artist',
    currentBid: '???',
    timeLeft: '2h 30m'
  }

  async ngOnInit() {
    try {
      this.fhevm = new FHEVMClient()
      await this.fhevm.initialize({
        chainId: 11155111,
        rpcUrl: 'https://eth-sepolia.g.alchemy.com/v2/tdHjNLQj6qDZOj8XlibqQEVxvKh_5Tqw',
        wasmPath: '/angular-auction/assets/wasm/'
      })
      this.isInitialized = true
    } catch (err) {
      console.error('Failed to initialize:', err)
      alert('Failed to initialize FHEVM')
    }
  }

  async connectWallet() {
    if (!(window as any).ethereum) {
      alert('Please install MetaMask')
      return
    }

    if (!this.fhevm) {
      alert('FHEVM not initialized')
      return
    }

    this.isConnecting = true
    try {
      const wallet = await this.fhevm.connectWallet((window as any).ethereum)
      this.walletAddress = wallet.address
    } catch (err) {
      console.error('Connection failed:', err)
      alert('Failed to connect wallet')
    } finally {
      this.isConnecting = false
    }
  }

  disconnectWallet() {
    this.walletAddress = null
  }

  async placeBid() {
    if (!this.bidAmount || this.bidAmount <= 0) {
      alert('Please enter a valid bid amount')
      return
    }

    if (!this.fhevm) {
      alert('FHEVM not initialized')
      return
    }

    this.isBidding = true
    
    try {
      const encrypted = await this.fhevm.encrypt(this.bidAmount, 'euint64')
      
      if (!encrypted) {
        throw new Error('Encryption failed')
      }

      const newBid: Bid = {
        id: this.bids.length + 1,
        timestamp: new Date(),
        amount: '***',
        encryptedHandle: encrypted.handle,
        status: 'pending',
        isDecrypting: false
      }
      
      this.bids.unshift(newBid)
      
      setTimeout(() => {
        newBid.status = 'confirmed'
      }, 2000)

      alert('Bid placed successfully!')
      this.bidAmount = 0
    } catch (error) {
      console.error('Bid failed:', error)
      alert('Failed to place bid')
    } finally {
      this.isBidding = false
    }
  }

  async revealBid(bid: Bid) {
    if (!bid.encryptedHandle) {
      alert('No encrypted bid to reveal')
      return
    }

    if (!this.fhevm) {
      alert('FHEVM not initialized')
      return
    }

    bid.isDecrypting = true
    
    try {
      const instance = this.fhevm.getInstance()
      if (!instance) {
        throw new Error('FHEVM instance not available')
      }

      const results = await instance.publicDecrypt([bid.encryptedHandle])
      const firstKey = Object.keys(results)[0]
      
      if (!firstKey) {
        throw new Error('No decryption result')
      }

      const decrypted = results[firstKey] as bigint
      bid.decryptedAmount = decrypted
      bid.amount = decrypted.toString()
    } catch (err: any) {
      console.error('Decryption failed:', err)
      alert(`Failed to decrypt: ${err.message}`)
    } finally {
      bid.isDecrypting = false
    }
  }

  shortAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  getTimeSince(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    
    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    return `${Math.floor(seconds / 3600)}h ago`
  }
}
