<template>
  <div class="grid md:grid-cols-2 gap-4">
    <section class="glass p-4">
      <h2 class="text-lg font-semibold mb-2">Plagas</h2>
      <form @submit.prevent="crearPlaga" class="flex flex-col gap-2 mb-3">
        <input v-model="nombre" placeholder="Nombre" class="px-3 py-2 rounded bg-white/10" />
        <input v-model="descripcion" placeholder="Descripción" class="px-3 py-2 rounded bg-white/10" />
        <input v-model="nivel" placeholder="Nivel de peligro (1-5)" class="px-3 py-2 rounded bg-white/10" />
        <button class="px-3 py-2 rounded bg-emerald-500/80">Crear</button>
      </form>
      <ul class="space-y-2">
        <li v-for="p in plagas" :key="p.id" class="bg-white/5 rounded p-2">{{ p.nombre }} - {{ p.nivel_peligro }}</li>
      </ul>
    </section>
    <section class="glass p-4">
      <h2 class="text-lg font-semibold mb-2">Detecciones</h2>
      <form @submit.prevent="crearDeteccion" class="grid grid-cols-2 gap-2 mb-3">
        <input v-model.number="cultivo_id" type="number" placeholder="Cultivo ID" class="px-3 py-2 rounded bg-white/10" />
        <input v-model.number="plaga_id" type="number" placeholder="Plaga ID" class="px-3 py-2 rounded bg-white/10" />
        <input v-model="severidad" placeholder="Severidad" class="px-3 py-2 rounded bg-white/10" />
        <input v-model="confirmado_por" placeholder="Confirmado por" class="px-3 py-2 rounded bg-white/10" />
        <button class="col-span-2 px-3 py-2 rounded bg-cyan-500/80">Registrar detección</button>
      </form>
      <ul class="space-y-2 max-h-64 overflow-auto pr-1">
        <li v-for="d in detecciones" :key="d.id" class="bg-white/5 rounded p-2">Cultivo {{ d.cultivo_id }} · Plaga {{ d.plaga_id }} · {{ d.severidad }}</li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { api } from '../services/api'

const nombre = ref('')
const descripcion = ref('')
const nivel = ref('3')
const plagas = ref<any[]>([])

const cultivo_id = ref<number|undefined>()
const plaga_id = ref<number|undefined>()
const severidad = ref('media')
const confirmado_por = ref('')
const detecciones = ref<any[]>([])

async function cargar() { plagas.value = (await api.get('/plagas')).data; detecciones.value = (await api.get('/detecciones')).data }
async function crearPlaga() { await api.post('/plagas', { nombre: nombre.value, descripcion: descripcion.value, nivel_peligro: Number(nivel.value||3) }); nombre.value=''; descripcion.value=''; await cargar() }
async function crearDeteccion() { await api.post('/detecciones', { cultivo_id: cultivo_id.value, plaga_id: plaga_id.value, severidad: severidad.value, confirmado_por: confirmado_por.value }); await cargar() }

onMounted(cargar)
</script>
