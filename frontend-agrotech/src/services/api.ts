import axios from 'axios'
import { useAuthStore } from '../stores/auth'

const BASE_URL = (import.meta as any).env.VITE_GATEWAY_URL || 'http://localhost:8088'

// Base IoT, el gateway también monta alias /api
export const api = axios.create({ baseURL: `${BASE_URL}/iot` })

export const gatewayBase = BASE_URL

api.interceptors.request.use((config) => {
  const auth = useAuthStore()
  const token = auth.token
  if (token) config.headers = { ...(config.headers||{} as any), Authorization: `Bearer ${token}` }
  return config
})
