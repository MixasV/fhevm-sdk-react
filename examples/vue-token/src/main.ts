import { createApp } from 'vue'
import { createFHEVMPlugin } from '@mixaspro/vue'
import App from './App.vue'
import './style.css'

const app = createApp(App)

app.use(createFHEVMPlugin({
  config: {
    chainId: 11155111,
    rpcUrl: 'https://eth-sepolia.g.alchemy.com/v2/tdHjNLQj6qDZOj8XlibqQEVxvKh_5Tqw',
    wasmPath: '/vue-token/wasm/',
  },
  autoInit: true,
}))

app.mount('#app')
