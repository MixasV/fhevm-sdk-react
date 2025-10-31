# FHEVM SDK - Encryption & Decryption Guide

## 🔐 What is Encryption/Decryption in FHEVM?

FHEVM (Fully Homomorphic Encryption VM) allows you to:
- **Encrypt** sensitive data on the client-side (browser)
- **Send encrypted data** to smart contracts
- **Execute operations** on encrypted data without decrypting it
- **Decrypt** results only on the client-side when needed

This means your private data never exists unencrypted on the blockchain!

---

## 📚 Official Documentation

### Zama Official Resources:
- **Zama FHEVM Docs**: https://docs.zama.ai/fhevm
- **GitHub fhevm-react-template**: https://github.com/zama-ai/fhevm-react-template
- **Zama Developer Forum**: https://community.zama.ai/

### Key Concepts:
- **Public Key**: Used for encryption (can be shared)
- **EIP-712 Signing**: Standard for signing encrypted messages
- **Encrypted Types**: euint8, euint16, euint32, euint64, euint128, euint256

---

## 🔓 Basic Concepts

### Encryption Flow:
```
User Input (plaintext)
    ↓
Client-side Encryption (using Public Key)
    ↓
Encrypted Data (safe to transmit)
    ↓
Send to Smart Contract
    ↓
Contract operates on encrypted data
    ↓
Returns encrypted result
```

### Decryption Flow:
```
Encrypted Result (from contract)
    ↓
Client-side Decryption (using Private Key)
    ↓
Decrypted Result (plaintext)
    ↓
Display to User
```

---

## 💻 React Examples

### Example 1: Basic Encrypt/Decrypt

```typescript
import { useFHEVM, useEncrypt, useDecrypt } from '@mixaspro/react'

export function BasicExample() {
  const { client } = useFHEVM()
  const { encrypt } = useEncrypt()
  const { decrypt } = useDecrypt()

  const handleEncrypt = async () => {
    try {
      // Encrypt a number
      const plainNumber = 42
      const encrypted = await encrypt(plainNumber, 'euint32')
      
      console.log('Original:', plainNumber)
      console.log('Encrypted:', encrypted)
      
      // You can now send 'encrypted' to blockchain
      
      // Decrypt to verify
      const decrypted = await decrypt(encrypted)
      console.log('Decrypted:', decrypted) // Should be 42
    } catch (error) {
      console.error('Encryption failed:', error)
    }
  }

  return (
    <button onClick={handleEncrypt}>
      Encrypt 42 and Decrypt
    </button>
  )
}
```

---

### Example 2: Contract Interaction with Encryption

```typescript
import { useFHEVM, useEncrypt, useWriteEncrypted } from '@mixaspro/react'
import { useContractRead } from 'wagmi'

export function ContractExample() {
  const { client } = useFHEVM()
  const { encrypt } = useEncrypt()
  const { writeEncrypted } = useWriteEncrypted()

  const submitEncryptedVote = async (vote: number) => {
    try {
      // Step 1: Encrypt the vote
      const encryptedVote = await encrypt(vote, 'euint8')
      
      // Step 2: Sign with EIP-712
      const signature = await client.sign({
        message: encryptedVote,
        account: window.ethereum.selectedAddress
      })
      
      // Step 3: Write to contract
      await writeEncrypted({
        contract: votingContractABI,
        functionName: 'submitVote',
        args: [encryptedVote, signature]
      })
      
      console.log('Encrypted vote submitted to blockchain!')
    } catch (error) {
      console.error('Vote submission failed:', error)
    }
  }

  return (
    <button onClick={() => submitEncryptedVote(1)}>
      Submit Encrypted Vote
    </button>
  )
}
```

---

### Example 3: Decryption with EIP-712

```typescript
import { useFHEVM, useReadEncrypted, useDecrypt } from '@mixaspro/react'

export function DecryptionExample() {
  const { client } = useFHEVM()
  const { readEncrypted } = useReadEncrypted()
  const { decrypt } = useDecrypt()

  const getEncryptedBalance = async (userAddress: string) => {
    try {
      // Step 1: Read encrypted value from contract
      const encryptedResult = await readEncrypted({
        contract: tokenContractABI,
        functionName: 'balanceOf',
        args: [userAddress]
      })
      
      // Step 2: Prepare decryption request with EIP-712 signature
      const decryptionRequest = {
        encryptedValue: encryptedResult,
        userAddress: userAddress,
        // This gets signed with EIP-712
      }
      
      // Step 3: Decrypt locally
      const balance = await decrypt(decryptionRequest)
      
      console.log('Your encrypted balance (decrypted):', balance)
      return balance
    } catch (error) {
      console.error('Decryption failed:', error)
    }
  }

  return (
    <button onClick={() => getEncryptedBalance('0x...')}>
      Get My Encrypted Balance
    </button>
  )
}
```

---

## 🎯 Vue Examples

```typescript
import { useFHEVM, useEncrypt } from '@mixaspro/vue'
import { ref } from 'vue'

export default {
  setup() {
    const plaintext = ref(100)
    const encrypted = ref(null)
    
    const { client } = useFHEVM()
    const { encrypt } = useEncrypt()

    const handleEncrypt = async () => {
      try {
        encrypted.value = await encrypt(plaintext.value, 'euint32')
      } catch (error) {
        console.error('Encryption failed:', error)
      }
    }

    return { plaintext, encrypted, handleEncrypt }
  }
}
```

---

## ⚡ CLI Quick Start

### 1. Create New Project

```bash
npx @mixaspro/cli create my-fhevm-app
cd my-fhevm-app
```

### 2. Install Packages

```bash
npm install @mixaspro/core @mixaspro/react
```

### 3. Use in Your Component

```tsx
import { useFHEVM, useEncrypt } from '@mixaspro/react'

function App() {
  const { client } = useFHEVM()
  const { encrypt } = useEncrypt()

  return (
    <div>
      {client ? <EncryptionForm /> : <p>Initializing...</p>}
    </div>
  )
}
```

---

## 🔐 Encryption Types Explained

| Type | Size | Use Case | Example |
|------|------|----------|---------|
| euint8 | 8-bit | Small numbers, flags | Yes/No, 0-255 |
| euint16 | 16-bit | Medium numbers | Quantities, 0-65535 |
| euint32 | 32-bit | Large numbers, currency | Amounts, timestamps |
| euint64 | 64-bit | Very large numbers | Balances |
| euint128 | 128-bit | Huge numbers | Complex calculations |
| euint256 | 256-bit | Maximum precision | Full precision calculations |

### Choosing the Right Type:

```typescript
// Small numbers → euint8
const encryptedFlag = await encrypt(1, 'euint8') // 0-255

// Medium numbers → euint16
const encryptedCount = await encrypt(1000, 'euint16') // 0-65535

// Currency/balances → euint32 or euint64
const encryptedBalance = await encrypt(1000000, 'euint32')

// Contract state → euint256
const encryptedVoteCount = await encrypt(9999999, 'euint256')
```

---

## 🛠️ Error Handling

### Common Errors & Solutions:

```typescript
try {
  const encrypted = await encrypt(value, 'euint32')
} catch (error) {
  if (error.message.includes('Invalid public key')) {
    // FHEVM client not initialized
    console.error('Please initialize FHEVM first')
  } else if (error.message.includes('Invalid type')) {
    // Wrong encryption type
    console.error('Use valid type: euint8, euint16, euint32, euint64')
  } else if (error.message.includes('Network error')) {
    // Network/blockchain issue
    console.error('Check your blockchain connection')
  }
}
```

---

## 📖 Framework-Specific Guides

### React Hooks
```
@mixaspro/react/hooks:
- useFHEVM() - Initialize client
- useEncrypt() - Encrypt values
- useDecrypt() - Decrypt values
- useReadEncrypted() - Read encrypted state
- useWriteEncrypted() - Write encrypted transactions
```

### Vue Composables
```
@mixaspro/vue/composables:
- useFHEVM() - Initialize client
- useEncrypt() - Encrypt values
- useDecrypt() - Decrypt values
- useReadEncrypted() - Read encrypted state
```

### Angular Services
```
@mixaspro/angular/services:
- FhevmService - Core service
- EncryptionService - Handle encryption
- DecryptionService - Handle decryption
```

### Svelte Stores
```
@mixaspro/svelte/stores:
- fhevm - Main store
- encryption - Encryption operations
- decryption - Decryption operations
```

---

## 🚀 Advanced: Custom Encryption Workflows

### Workflow 1: Auction with Private Bids

```typescript
async function submitEncryptedBid(bidAmount: number) {
  const { encrypt } = useEncrypt()
  
  // Encrypt bid amount
  const encryptedBid = await encrypt(bidAmount, 'euint32')
  
  // Create commitment
  const commitment = await client.createCommitment({
    encryptedValue: encryptedBid,
    userAddress: window.ethereum.selectedAddress
  })
  
  // Submit to contract
  await contract.submitBid(encryptedBid, commitment)
}
```

### Workflow 2: Confidential Voting

```typescript
async function submitConfidentialVote(vote: number) {
  const { encrypt } = useEncrypt()
  
  // Encrypt vote (1 = Yes, 0 = No)
  const encryptedVote = await encrypt(vote, 'euint8')
  
  // Sign with EIP-712
  const signature = await signMessage({
    message: encryptedVote,
    account: userAddress
  })
  
  // Submit with signature
  await votingContract.vote(encryptedVote, signature)
}
```

---

## 📞 Getting Help

### Zama Community:
- **Discord**: https://discord.gg/zama
- **Forum**: https://community.zama.ai/
- **GitHub Issues**: https://github.com/zama-ai/fhevm-react-template/issues

### @mixaspro/core Docs:
- Full API reference in `@mixaspro/core` npm package
- TypeScript types available
- Examples in `examples/` folder

---

## 🎓 Learning Resources

### Recommended Reading Order:
1. Start with "Basic Concepts" section above
2. Try "Example 1: Basic Encrypt/Decrypt"
3. Read official Zama FHEVM docs
4. Try "Example 2: Contract Interaction"
5. Explore advanced workflows

### Key Takeaways:
- ✅ Encryption happens CLIENT-SIDE (browser)
- ✅ Encrypted data can be sent to blockchain safely
- ✅ Contracts operate on encrypted data
- ✅ Only client can decrypt results
- ✅ Use EIP-712 signing for authenticity
- ✅ Choose correct encryption type for your use case

---

**Next Steps**: Check out the examples in `examples/react-counter/` and `examples/svelte-voting/` for real implementations!
