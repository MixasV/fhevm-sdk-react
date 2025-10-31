import { useState } from 'react'
import { FHEVMProvider, useFHEVM, useWallet, useEncrypt, useWriteEncrypted } from '@mixaspro/react'

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
  const { isInitialized, network } = useFHEVM()
  const { wallet, connect, disconnect, isConnecting } = useWallet()
  const { encrypt, isEncrypting } = useEncrypt()
  const { write, isWriting, data: receipt } = useWriteEncrypted({
    address: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Replace with your contract
    abi: COUNTER_ABI,
    functionName: 'increment',
  })
  
  const [incrementValue, setIncrementValue] = useState('1')

  const handleConnect = async () => {
    try {
      await connect((window as any).ethereum)
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    }
  }

  const handleIncrement = async () => {
    try {
      const value = parseInt(incrementValue)
      if (isNaN(value)) {
        alert('Please enter a valid number')
        return
      }

      // Encrypt the value
      const encrypted = await encrypt(value, 'euint32')
      
      // Call contract
      await write({ args: [encrypted.value] })
      
      alert('Counter incremented!')
    } catch (error) {
      console.error('Failed to increment:', error)
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
            <h2>Increment Counter</h2>
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
                {isEncrypting ? 'Encrypting...' : isWriting ? 'Sending...' : 'Increment'}
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

          <div className="info-section">
            <h3>How it works:</h3>
            <ol>
              <li>Enter a value to increment the counter</li>
              <li>Value is encrypted using FHEVM</li>
              <li>Encrypted value is sent to smart contract</li>
              <li>Counter increments without revealing the value</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
