import { defineStore } from 'pinia'
import { api } from '../services/api'

export interface Notificacion {
  id: number; mensaje: string; tipo: string; leida: boolean; fecha_envio: string
}

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    items: [] as Notificacion[],
    loading: false,
    error: '' as string | null
  }),
  getters: {
    unreadCount: (s) => s.items.filter(i => !i.leida).length
  },
  actions: {
    async fetch() {
      this.loading = true; this.error = null
      try { this.items = (await api.get('/notificaciones')).data }
      catch (e: any) { this.error = e?.message || 'Error' }
      finally { this.loading = false }
    },
    async markAsRead(id: number) {
      try {
        await api.post(`/notificaciones/${id}/leer`)
        const n = this.items.find(i => i.id === id); if (n) n.leida = true
      } catch (e) { console.error(e) }
    }
  }
})
