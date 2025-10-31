import { useState, useEffect } from 'react'
import { FHEVMProvider, useFHEVM, useWallet, useEncrypt, useDecrypt, useWriteEncrypted, useReadEncrypted } from '@mixaspro/react'

const COUNTER_ABI = [
  {
    inputs: [{ name: 'encryptedValue', type: 'bytes' }],
    name: 'increment',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getCount',
    outputs: [{ name: '', type: 'euint32' }],
    stateMutability: 'view',
    type: 'function',
  },
]

function App() {
  return (
    <FHEVMProvider 
      config={{ 
        chainId: 11155111,
        rpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com'
      }}
      autoInit={true}
    >
      <Counter />
    </FHEVMProvider>
  )
}

function Counter() {
  const { isInitialized, network, client } = useFHEVM()
  const { wallet, connect, disconnect, isConnecting } = useWallet()
  const { encrypt, isEncrypting } = useEncrypt()
  const { decrypt, isDecrypting } = useDecrypt()
  const { write, isWriting, data: receipt } = useWriteEncrypted({
    address: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Replace with your contract
    abi: COUNTER_ABI,
    functionName: 'increment',
  })
  
  const [incrementValue, setIncrementValue] = useState('1')
  const [encryptedResult, setEncryptedResult] = useState<any>(null)
  const [decryptedCounter, setDecryptedCounter] = useState<number | null>(null)
  const [showWorkflow, setShowWorkflow] = useState(false)

  const handleConnect = async () => {
    try {
      await connect((window as any).ethereum)
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    }
  }

  const handleIncrement = async () => {
    try {
      setShowWorkflow(true)
      const value = parseInt(incrementValue)
      if (isNaN(value)) {
        alert('Please enter a valid number')
        return
      }

      // STEP 1: Encrypt the value
      console.log('🔐 STEP 1: Encrypting value:', value)
      const encrypted = await encrypt(value, 'euint32')
      setEncryptedResult(encrypted)
      console.log('✅ Encrypted:', encrypted)
      
      // STEP 2: Call contract
      console.log('📤 STEP 2: Sending to blockchain...')
      await write({ args: [encrypted.value] })
      console.log('✅ Transaction confirmed!')
      
      alert('Counter incremented! Now decrypt to see the result.')
    } catch (error) {
      console.error('Failed to increment:', error)
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleDecrypt = async () => {
    try {
      if (!encryptedResult) {
        alert('No encrypted value to decrypt. Increment first!')
        return
      }

      // STEP 3: Decrypt the result
      console.log('🔓 STEP 3: Decrypting result...')
      const decrypted = await decrypt(encryptedResult)
      setDecryptedCounter(Number(decrypted))
      console.log('✅ Decrypted value:', decrypted)
      
    } catch (error) {
      console.error('Failed to decrypt:', error)
      alert(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  if (!isInitialized) {
    return (
      <div className="container">
        <div className="loading">Initializing FHEVM...</div>
      </div>
    )
  }

  return (
    <div className="container">
      <header>
        <h1>🔐 FHEVM Encrypted Counter</h1>
        <p className="subtitle">React + FHEVM SDK Example</p>
        <p className="network">Network: {network?.name || 'Unknown'}</p>
      </header>

      {!wallet ? (
        <div className="wallet-section">
          <button 
            onClick={handleConnect} 
            disabled={isConnecting}
            className="btn btn-primary"
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
        </div>
      ) : (
        <div className="wallet-section">
          <div className="wallet-info">
            <p>Connected: <code>{wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}</code></p>
            <button onClick={disconnect} className="btn btn-secondary">
              Disconnect
            </button>
          </div>

          <div className="counter-section">
            <h2>Step 1: Encrypt & Send</h2>
            <p className="info">Enter a value to encrypt and add to the counter</p>
            
            <div className="input-group">
              <input
                type="number"
                value={incrementValue}
                onChange={(e) => setIncrementValue(e.target.value)}
                placeholder="Enter increment value"
                disabled={isEncrypting || isWriting}
              />
              <button
                onClick={handleIncrement}
                disabled={isEncrypting || isWriting}
                className="btn btn-primary"
              >
                {isEncrypting ? 'Encrypting...' : isWriting ? 'Sending...' : '🔐 Encrypt & Send'}
              </button>
            </div>

            {receipt && (
              <div className="success">
                ✅ Transaction confirmed!
                <br />
                <code>{receipt.hash.slice(0, 10)}...</code>
              </div>
            )}
          </div>

          {showWorkflow && encryptedResult && (
            <div className="workflow-section">
              <div className="workflow-step">
                <h3>✅ Step 1 Complete: Encrypted</h3>
                <p className="encrypted-value">
                  <strong>Encrypted Handle:</strong><br />
                  <code>{encryptedResult.handle}</code>
                </p>
                <p className="info-small">
                  ℹ️ This encrypted value was sent to the blockchain. 
                  The actual number ({incrementValue}) remains private!
                </p>
              </div>

              <div className="workflow-step">
                <h3>Step 2: Decrypt Result</h3>
                <p className="info">Click to decrypt and reveal the value</p>
                <button
                  onClick={handleDecrypt}
                  disabled={isDecrypting}
                  className="btn btn-secondary"
                >
                  {isDecrypting ? 'Decrypting...' : '🔓 Decrypt Value'}
                </button>

                {decryptedCounter !== null && (
                  <div className="decrypted-result">
                    <h4>✅ Decrypted Result:</h4>
                    <p className="decrypted-value">{decryptedCounter}</p>
                    <p className="info-small">
                      ✅ Original value successfully decrypted!
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="info-section">
            <h3>🔐 How FHEVM Encryption/Decryption Works:</h3>
            <ol>
              <li><strong>Encrypt:</strong> Enter a value (plaintext) - it gets encrypted on your browser</li>
              <li><strong>Send:</strong> Encrypted value (ciphertext) is sent to blockchain - safe to transmit</li>
              <li><strong>Contract:</strong> Smart contract operates on encrypted data without seeing the value</li>
              <li><strong>Decrypt:</strong> Only you can decrypt and reveal the original value</li>
            </ol>
            <p className="info-small" style={{marginTop: '1rem'}}>
              ✅ <strong>Privacy guaranteed:</strong> Your actual number never appears on the blockchain!
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
