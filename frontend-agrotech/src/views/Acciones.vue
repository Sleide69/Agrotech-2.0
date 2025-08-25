<template>
  <div class="grid md:grid-cols-2 gap-4">
    <section class="glass p-4">
      <h2 class="text-lg font-semibold mb-2">Nueva Acción Correctiva</h2>
      <form @submit.prevent="crear" class="flex flex-col gap-2">
        <input v-model.number="deteccion_id" type="number" placeholder="Detección ID" class="px-3 py-2 rounded bg-white/10" />
        <input v-model="descripcion" placeholder="Descripción" class="px-3 py-2 rounded bg-white/10" />
        <input v-model="responsable" placeholder="Responsable" class="px-3 py-2 rounded bg-white/10" />
        <button class="px-3 py-2 rounded bg-emerald-500/80">Guardar</button>
      </form>
    </section>
    <section class="glass p-4">
      <h2 class="text-lg font-semibold mb-2">Acciones</h2>
      <ul class="space-y-2 max-h-72 overflow-auto pr-1">
        <li v-for="a in items" :key="a.id" class="bg-white/5 rounded p-2">#{{ a.id }} · Detección {{ a.deteccion_id }} · {{ a.descripcion }}</li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { api } from '../services/api'

const deteccion_id = ref<number|undefined>()
const descripcion = ref('')
const responsable = ref('')
const items = ref<any[]>([])

async function cargar() { items.value = (await api.get('/acciones')).data }
async function crear() { await api.post('/acciones', { deteccion_id: deteccion_id.value, descripcion: descripcion.value, responsable: responsable.value }); descripcion.value=''; responsable.value=''; await cargar() }

onMounted(cargar)
</script>
