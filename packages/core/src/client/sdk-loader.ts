/**
 * Dynamic SDK loader for browser environments
 * Loads relayer-sdk from CDN to avoid bundling issues
 */

const SDK_CDN_URL = 'https://cdn.zama.ai/relayer-sdk-js/0.2.0/relayer-sdk-js.umd.cjs'

interface RelayerSDK {
  initSDK: (options?: {
    tfheParams?: string
    kmsParams?: string
    thread?: number
  }) => Promise<boolean>
  createInstance: (config: any) => Promise<any>
  SepoliaConfig: any
  __initialized__?: boolean
}

declare global {
  interface Window {
    relayerSDK?: RelayerSDK
  }
}

export async function loadSDK(): Promise<void> {
  if (typeof window === 'undefined') {
    throw new Error('SDK loader can only be used in browser')
  }

  if (window.relayerSDK) {
    return
  }

  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${SDK_CDN_URL}"]`)
    if (existingScript) {
      if (window.relayerSDK) {
        resolve()
      } else {
        reject(new Error('SDK script loaded but relayerSDK not available'))
      }
      return
    }

    const script = document.createElement('script')
    script.src = SDK_CDN_URL
    script.type = 'text/javascript'
    script.async = true

    script.onload = () => {
      if (window.relayerSDK) {
        resolve()
      } else {
        reject(new Error('SDK loaded but window.relayerSDK not available'))
      }
    }

    script.onerror = () => {
      reject(new Error(`Failed to load SDK from ${SDK_CDN_URL}`))
    }

    document.head.appendChild(script)
  })
}

export async function initSDK(options?: {
  tfheParams?: string
  kmsParams?: string
  thread?: number
}): Promise<void> {
  await loadSDK()

  if (!window.relayerSDK) {
    throw new Error('relayerSDK not available')
  }

  if (window.relayerSDK.__initialized__) {
    return
  }

  const result = await window.relayerSDK.initSDK(options)
  window.relayerSDK.__initialized__ = result

  if (!result) {
    throw new Error('SDK initialization failed')
  }
}

export function getSDK(): RelayerSDK {
  if (!window.relayerSDK) {
    throw new Error('SDK not loaded. Call initSDK() first.')
  }
  return window.relayerSDK
}
