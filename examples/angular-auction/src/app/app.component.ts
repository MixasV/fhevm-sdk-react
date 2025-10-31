import { Component, OnInit, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { FHEVMService } from '@mixaspro/angular'

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
  private fhevm = inject(FHEVMService)
  
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

  ngOnInit() {
    this.fhevm.initialize({
      chainId: 11155111,
      rpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com'
    }).subscribe({
      next: () => {
        this.isInitialized = true
      },
      error: (err) => {
        console.error('Failed to initialize:', err)
        alert('Failed to initialize FHEVM')
      }
    })
  }

  async connectWallet() {
    if (!(window as any).ethereum) {
      alert('Please install MetaMask')
      return
    }

    this.isConnecting = true
    this.fhevm.connectWallet((window as any).ethereum).subscribe({
      next: (wallet) => {
        this.walletAddress = wallet.address
        this.isConnecting = false
      },
      error: (err) => {
        console.error('Connection failed:', err)
        alert('Failed to connect wallet')
        this.isConnecting = false
      }
    })
  }

  disconnectWallet() {
    this.fhevm.disconnectWallet()
    this.walletAddress = null
  }

  async placeBid() {
    if (!this.bidAmount || this.bidAmount <= 0) {
      alert('Please enter a valid bid amount')
      return
    }

    this.isBidding = true
    
    try {
      // Encrypt the bid
      const encrypted = await this.fhevm.encrypt(this.bidAmount, 'euint64', undefined).toPromise()
      
      if (!encrypted) {
        throw new Error('Encryption failed')
      }

      // Add to bids list
      const newBid: Bid = {
        id: this.bids.length + 1,
        timestamp: new Date(),
        amount: '***',
        encryptedHandle: encrypted.handle,
        status: 'pending',
        isDecrypting: false
      }
      
      this.bids.unshift(newBid)
      
      // Simulate confirmation
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

    bid.isDecrypting = true
    
    this.fhevm.decrypt(bid.encryptedHandle).subscribe({
      next: (decrypted) => {
        bid.decryptedAmount = decrypted as bigint
        bid.amount = decrypted.toString()
        bid.isDecrypting = false
      },
      error: (err) => {
        console.error('Decryption failed:', err)
        alert(`Failed to decrypt: ${err.message}`)
        bid.isDecrypting = false
      }
    })
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
