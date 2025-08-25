import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'
import { useAuthStore } from './stores/auth'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
// Inicializar sesión Supabase con la instancia de pinia
useAuthStore(pinia).init()
app.use(router)
app.mount('#app')
