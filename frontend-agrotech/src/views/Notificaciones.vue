<template>
  <div class="glass p-4">
    <h2 class="text-lg font-semibold mb-2">Centro de Notificaciones</h2>
    <div class="flex gap-2 mb-3">
      <button @click="refresh" class="px-3 py-1.5 rounded bg-cyan-500/80">Refrescar</button>
    </div>
    <ul class="space-y-2">
      <li v-for="n in notifications.items" :key="n.id" class="flex justify-between items-center bg-white/5 rounded p-2">
        <div>
          <div class="font-medium" :class="{ 'opacity-50': n.leida }">{{ n.mensaje }}</div>
          <div class="text-xs text-slate-300">{{ n.tipo }} · {{ new Date(n.fecha_envio).toLocaleString() }}</div>
        </div>
        <button v-if="!n.leida" @click="mark(n.id)" class="px-2 py-1 rounded bg-emerald-500/80">Marcar leída</button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useNotificationsStore } from '../stores/notifications'

const notifications = useNotificationsStore()
async function refresh(){ await notifications.fetch() }
async function mark(id: number){ await notifications.markAsRead(id) }
onMounted(refresh)
</script>
