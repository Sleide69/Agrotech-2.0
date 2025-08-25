<template>
  <div class="glass p-4">
    <h2 class="text-lg font-semibold mb-3">Gestión de Cultivos</h2>
    <form @submit.prevent="crear" class="flex gap-2 mb-3">
      <input v-model="nombre" placeholder="Nombre" class="px-3 py-2 rounded bg-white/10 outline-none" />
      <input v-model="descripcion" placeholder="Descripción" class="px-3 py-2 rounded bg-white/10 outline-none w-64" />
      <button class="px-3 py-2 rounded bg-emerald-500/80">Crear</button>
    </form>
    <ul class="space-y-2">
      <li v-for="c in items" :key="c.id" class="flex items-center justify-between bg-white/5 rounded p-2">
        <div>
          <div class="font-medium">{{ c.nombre }}</div>
          <div class="text-sm text-slate-300">{{ c.descripcion }}</div>
        </div>
        <div class="flex gap-2">
          <button @click="borrar(c.id)" class="px-2 py-1 rounded bg-rose-500/70">Eliminar</button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { api } from '../services/api'

const items = ref<any[]>([])
const nombre = ref('')
const descripcion = ref('')

async function cargar() { items.value = (await api.get('/cultivos')).data }
async function crear() { await api.post('/cultivos', { nombre: nombre.value, descripcion: descripcion.value }); nombre.value=''; descripcion.value=''; await cargar() }
async function borrar(id: number) { await api.delete(`/cultivos/${id}`); await cargar() }

onMounted(cargar)
</script>
