<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-semibold">Cámaras</h2>
      <button v-if="isAdmin" @click="openCreate()" class="px-4 py-2 rounded-lg bg-emerald-500/80 hover:bg-emerald-400/80">Nueva cámara</button>
    </div>

  <div v-if="store.loading" class="text-sm opacity-70">Cargando…</div>
  <div v-if="store.error" class="text-sm text-rose-400">{{ store.error }}</div>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
  <div v-if="!store.loading && !store.error && store.items.length===0" class="col-span-full text-sm opacity-80">No hay cámaras registradas. {{ isAdmin ? 'Crea una nueva con el botón “Nueva cámara”.' : '' }}</div>
      <div v-for="cam in store.items" :key="cam.id" class="glass p-4 rounded-xl space-y-2">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium">{{ cam.nombre }}</h3>
          <div class="flex gap-2" v-if="isAdmin">
            <button class="text-xs px-2 py-1 rounded glass" @click="openEdit(cam)">Editar</button>
            <button class="text-xs px-2 py-1 rounded glass hover:bg-rose-500/40" @click="remove(cam.id)">Eliminar</button>
          </div>
        </div>
        <p class="text-sm opacity-80">{{ cam.descripcion || 'Sin descripción' }}</p>
        <div class="mt-2 flex gap-2">
          <button v-if="canSeeSnapshot" class="px-3 py-1.5 rounded glass" @click="showSnapshot(cam.id)">Ver snapshot</button>
          <button v-if="canSeeSnapshot && cam.stream_url" class="px-3 py-1.5 rounded glass" @click="showStream(cam.id)">Ver stream</button>
        </div>
      </div>
    </div>

  <dialog ref="dlg" class="modal">
      <form method="dialog" class="glass p-6 rounded-xl space-y-3 min-w-[320px]" @submit.prevent="save">
        <h3 class="text-lg font-semibold">{{ editing ? 'Editar cámara' : 'Nueva cámara' }}</h3>
        <input v-model="form.nombre" placeholder="Nombre" class="w-full px-3 py-2 rounded bg-white/10 outline-none" required />
        <textarea v-model="form.descripcion" placeholder="Descripción" class="w-full px-3 py-2 rounded bg-white/10 outline-none"></textarea>
        <div class="grid gap-2">
          <input v-model="form.snapshot_url" placeholder="Snapshot URL (opcional)" class="w-full px-3 py-2 rounded bg-white/10 outline-none" />
          <button type="button" class="px-2 py-1 rounded glass w-max" @click="prefillSnapshot()">Usar snapshot de prueba</button>
          <input v-model="form.stream_url" placeholder="Stream URL HLS/DASH (opcional)" class="w-full px-3 py-2 rounded bg-white/10 outline-none" />
        </div>
        <div class="flex gap-2 justify-end">
          <button type="button" class="px-3 py-1.5 rounded glass" @click="close()">Cancelar</button>
          <button type="submit" :disabled="store.opLoading" class="px-3 py-1.5 rounded glass bg-emerald-500/70 hover:bg-emerald-400/70">{{ store.opLoading ? 'Guardando…' : 'Guardar' }}</button>
        </div>
      </form>
    </dialog>

    <dialog ref="dlgSnapshot" class="modal">
      <div class="glass p-4 rounded-xl space-y-3 max-w-[90vw]">
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-semibold">Snapshot</h3>
          <button class="px-2 py-1 glass" @click="closeSnapshot()">Cerrar</button>
        </div>
        <div class="min-w-[320px] min-h-[200px]">
          <img v-if="snapshotUrl" :src="snapshotUrl" class="max-h-[70vh] rounded" />
          <div v-else class="text-sm opacity-70">Cargando snapshot…</div>
        </div>
      </div>
    </dialog>

    <dialog ref="dlgStream" class="modal">
      <div class="glass p-4 rounded-xl space-y-3 max-w-[90vw]">
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-semibold">Stream</h3>
          <button class="px-2 py-1 glass" @click="closeStream()">Cerrar</button>
        </div>
        <div class="min-w-[320px] min-h-[200px]">
          <video ref="videoEl" controls autoplay class="max-h-[70vh] rounded w-full"></video>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useCamarasStore } from '../stores/camaras'
import { useAuthStore } from '../stores/auth'
import Hls from 'hls.js'

const store = useCamarasStore()
const auth = useAuthStore()
const isAdmin = computed(() => auth.role === 'admin')
const canSeeSnapshot = computed(() => auth.role === 'admin' || auth.role === 'tecnico')
const form = ref<{ id?: string, nombre: string, descripcion?: string, snapshot_url?: string, stream_url?: string }>({ nombre: '', descripcion: '' })
const editing = ref(false)
const dlg = ref<HTMLDialogElement | null>(null)
const dlgSnapshot = ref<HTMLDialogElement | null>(null)
const snapshotUrl = ref<string>('')
const dlgStream = ref<HTMLDialogElement | null>(null)
const videoEl = ref<HTMLVideoElement | null>(null)

onMounted(() => { store.fetchCamaras() })

function openCreate() {
  editing.value = false
  form.value = { nombre: '', descripcion: '' }
  dlg.value?.showModal()
}
function openEdit(cam: any) {
  editing.value = true
  form.value = { id: cam.id, nombre: cam.nombre, descripcion: cam.descripcion, snapshot_url: cam.snapshot_url, stream_url: cam.stream_url }
  dlg.value?.showModal()
}
function close() { dlg.value?.close() }
async function save() {
  try {
  if (!form.value.nombre) { alert('El nombre es obligatorio'); return }
  if (editing.value && form.value.id) await store.updateCamara(form.value.id, { nombre: form.value.nombre, descripcion: form.value.descripcion, snapshot_url: form.value.snapshot_url, stream_url: form.value.stream_url })
  else await store.createCamara({ nombre: form.value.nombre, descripcion: form.value.descripcion, snapshot_url: form.value.snapshot_url, stream_url: form.value.stream_url })
    close()
  alert('Guardado correctamente')
  } catch (e) {
    alert(store.error || 'Error al guardar')
  }
}
async function remove(id: string) {
  if (!confirm('¿Eliminar cámara?')) return
  await store.deleteCamara(id)
  alert('Eliminada')
}
async function showSnapshot(id: string) {
  snapshotUrl.value = ''
  dlgSnapshot.value?.showModal()
  try {
    snapshotUrl.value = await store.fetchSnapshot(id)
  } catch (e) {
    snapshotUrl.value = ''
  }
}
function closeSnapshot() { dlgSnapshot.value?.close(); snapshotUrl.value = '' }

async function showStream(id: string) {
  dlgStream.value?.showModal()
  const video = videoEl.value
  if (!video) return
  const src = await store.streamUrl(id)
  if (Hls.isSupported()) {
    const hls = new Hls()
    hls.loadSource(src)
    hls.attachMedia(video)
  } else {
    video.src = src
  }
}
function closeStream() {
  dlgStream.value?.close()
  if (videoEl.value) videoEl.value.pause()
}
function prefillSnapshot() {
  form.value.snapshot_url = 'https://picsum.photos/800'
}
</script>

<style scoped>
.modal::backdrop{background:rgba(0,0,0,.3)}
</style>
