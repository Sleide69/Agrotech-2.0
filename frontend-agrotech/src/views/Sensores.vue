<template>
  <div class="grid md:grid-cols-3 gap-4">
    <section class="glass p-4 md:col-span-1">
      <h2 class="text-lg font-semibold mb-2">Sensores</h2>
      <form @submit.prevent="crear" class="flex flex-col gap-2 mb-3">
        <input v-model.number="cultivo_id" placeholder="Cultivo ID" type="number" class="px-3 py-2 rounded bg-white/10" />
        <input v-model="nombre" placeholder="Nombre" class="px-3 py-2 rounded bg-white/10" />
        <input v-model="tipo" placeholder="Tipo (humedad, temp, etc.)" class="px-3 py-2 rounded bg-white/10" />
        <input v-model="modelo" placeholder="Modelo" class="px-3 py-2 rounded bg-white/10" />
        <button class="px-3 py-2 rounded bg-emerald-500/80">Crear</button>
      </form>
      <ul class="space-y-2 max-h-72 overflow-auto pr-1">
        <li v-for="s in sensores" :key="s.id" @click="select(s)" class="p-2 rounded bg-white/5 hover:bg-white/10 cursor-pointer flex items-center justify-between">
          <span>#{{ s.id }} · {{ s.nombre }}</span>
          <button @click.stop="borrar(s.id)" class="px-2 py-1 rounded bg-rose-500/70">X</button>
        </li>
      </ul>
    </section>
    <section class="glass p-4 md:col-span-2">
      <h2 class="text-lg font-semibold mb-2">Lecturas del sensor seleccionado</h2>
      <div v-if="sel" class="mb-3 text-sm text-slate-300">Sensor #{{ sel.id }} · {{ sel.nombre }} ({{ sel.tipo }})</div>
      <div ref="chartEl" class="h-72"></div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import * as echarts from 'echarts'
import { api } from '../services/api'

const sensores = ref<any[]>([])
const sel = ref<any|null>(null)
const chartEl = ref<HTMLDivElement|null>(null)
const chart: { current: echarts.ECharts | null } = { current: null }
const series: Array<{ time: string, valor: number }> = []

const cultivo_id = ref<number|undefined>(undefined)
const nombre = ref('')
const tipo = ref('')
const modelo = ref('')

async function cargar() { sensores.value = (await api.get('/sensores')).data }
async function crear() { await api.post('/sensores', { cultivo_id: cultivo_id.value, nombre: nombre.value, tipo: tipo.value, modelo: modelo.value }); nombre.value=''; tipo.value=''; modelo.value=''; await cargar() }
async function borrar(id: number) { await api.delete(`/sensores/${id}`); if (sel.value?.id===id) sel.value=null; await cargar() }
function select(s: any) { sel.value = s; loadLecturas(s.id) }

async function loadLecturas(id: number) {
  const rows = (await api.get(`/sensores/${id}/lecturas`)).data
  series.splice(0, series.length, ...rows.reverse().map((r:any) => ({ time: new Date(r.fecha_hora).toLocaleTimeString(), valor: r.valor })))
  render()
}

function render() {
  if (!chart.current && chartEl.value) chart.current = echarts.init(chartEl.value)
  chart.current?.setOption({ xAxis: { type: 'category', data: series.map(s=>s.time) }, yAxis: { type: 'value' }, series: [{ type: 'bar', data: series.map(s=>s.valor) }], grid: { left: 32, right: 16, bottom: 24, top: 16 }, textStyle: { color: '#e5e7eb' } })
}

function connectWS() {
  const url = (import.meta as any).env.VITE_WS_URL || `ws://localhost:8088`
  const ws = new WebSocket(url)
  ws.onmessage = (ev) => {
    try {
      const msg = JSON.parse(ev.data)
      if (msg?.data?.event === 'sensor-reading' && sel.value) {
        series.push({ time: new Date().toLocaleTimeString(), valor: msg.data.valor })
        if (series.length > 50) series.shift()
        render()
      }
    } catch {}
  }
}

onMounted(async () => { await cargar(); connectWS(); })
</script>
