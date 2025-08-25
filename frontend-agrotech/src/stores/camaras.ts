import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../services/api'

export interface Camara {
  id: string
  nombre: string
  descripcion?: string | null
  tenant_id: string
  snapshot_url?: string | null
  stream_url?: string | null
  created_at: string
  updated_at: string
}

export const useCamarasStore = defineStore('camaras', () => {
  const items = ref<Camara[]>([])
  const loading = ref(false)
  const opLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchCamaras() {
    loading.value = true; error.value = null
    try {
      const { data } = await api.get<Camara[]>('/camaras')
      items.value = data
    } catch (e: any) {
      error.value = e?.response?.data?.error || e.message
    } finally { loading.value = false }
  }

  async function createCamara(payload: { nombre: string, descripcion?: string, snapshot_url?: string, stream_url?: string }) {
    opLoading.value = true; error.value = null
    try {
      const { data } = await api.post<{ id: string }>('/camaras', payload)
      await fetchCamaras()
      return data.id
    } catch (e: any) {
      error.value = e?.response?.data?.error || e.message
      throw e
    } finally { opLoading.value = false }
  }

  async function updateCamara(id: string, payload: { nombre?: string, descripcion?: string, snapshot_url?: string, stream_url?: string }) {
    opLoading.value = true; error.value = null
    try {
      await api.put(`/camaras/${id}`, payload)
      await fetchCamaras()
    } catch (e: any) {
      error.value = e?.response?.data?.error || e.message
      throw e
    } finally { opLoading.value = false }
  }

  async function deleteCamara(id: string) {
    opLoading.value = true; error.value = null
    try {
      await api.delete(`/camaras/${id}`)
      items.value = items.value.filter((x) => x.id !== id)
    } catch (e: any) {
      error.value = e?.response?.data?.error || e.message
      throw e
    } finally { opLoading.value = false }
  }

  async function fetchSnapshot(id: string): Promise<string> {
    const res = await api.get(`/camaras/${id}/snapshot`, { responseType: 'blob' })
    const blobUrl = URL.createObjectURL(res.data)
    return blobUrl
  }

  async function streamUrl(id: string): Promise<string> {
    const base = (import.meta as any).env.VITE_GATEWAY_URL || 'http://localhost:8088'
    return `${base}/iot/camaras/${id}/stream`
  }

  return { items, loading, opLoading, error, fetchCamaras, createCamara, updateCamara, deleteCamara, fetchSnapshot, streamUrl }
})
