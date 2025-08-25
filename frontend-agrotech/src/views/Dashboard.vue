<template>
  <div class="grid md:grid-cols-3 gap-4">
    <section class="glass p-4 md:col-span-2">
      <h2 class="text-lg font-semibold mb-2">Últimas lecturas (Tiempo real)</h2>
      <div ref="chartEl" class="h-64"></div>
    </section>
    <section class="glass p-4">
      <h2 class="text-lg font-semibold mb-2">Estado de cultivos</h2>
      <ul class="space-y-2">
        <li v-for="c in cultivos" :key="c.id" class="p-2 rounded-lg bg-white/5 flex items-center justify-between">
          <span>{{ c.nombre }}</span>
          <span class="text-xs text-emerald-300">Activo</span>
        </li>
      </ul>
    </section>
    <section class="glass p-4 md:col-span-3">
      <h2 class="text-lg font-semibold mb-2">Alertas</h2>
      <div class="flex flex-wrap gap-2">
        <div v-for="n in notifications.items" :key="n.id" class="px-3 py-2 rounded-lg bg-rose-500/20 border border-rose-300/30">
          {{ n.mensaje }}
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts'
import { onMounted, ref } from 'vue'
import { api } from '../services/api'
import { useNotificationsStore } from '../stores/notifications'

const notifications = useNotificationsStore()
const chartEl = ref<HTMLDivElement|null>(null)
const chart: { current: echarts.ECharts | null } = { current: null }
const data: Array<{ time: string, valor: number }> = []
const cultivos = ref<any[]>([])

onMounted(async () => {
  notifications.fetch()
  await loadCultivos()
  if (chartEl.value) {
    chart.current = echarts.init(chartEl.value)
    chart.current.setOption(getOption())
  }
  connectWS()
})

async function loadCultivos() {
  try { cultivos.value = (await api.get('/cultivos')).data } catch {}
}

function getOption(): echarts.EChartsOption {
  return {
    xAxis: { type: 'category', data: data.map(d => d.time) },
    yAxis: { type: 'value' },
    series: [{ type: 'line', smooth: true, areaStyle: {}, data: data.map(d => d.valor) }],
    grid: { left: 32, right: 16, bottom: 24, top: 16 },
    textStyle: { color: '#e5e7eb' }
  }
}

function connectWS() {
  const url = (import.meta as any).env.VITE_WS_URL || `ws://localhost:8088`
  const ws = new WebSocket(url)
  ws.onmessage = (ev) => {
    try {
      const msg = JSON.parse(ev.data)
      if (msg?.data?.event === 'sensor-reading') {
        data.push({ time: new Date().toLocaleTimeString(), valor: msg.data.valor })
        if (data.length > 30) data.shift()
        chart.current?.setOption(getOption())
      }
    } catch {}
  }
}
</script>
