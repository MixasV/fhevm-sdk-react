import { createApp } from 'vue'
import { createFHEVMPlugin } from '@mixaspro/vue'
import App from './App.vue'
import './style.css'

const app = createApp(App)

app.use(createFHEVMPlugin({
  chainId: 11155111,
  rpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com',
  autoInitialize: true,
}))

app.mount('#app')
