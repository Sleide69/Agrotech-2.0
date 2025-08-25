<template>
  <div>
    <header class="sticky top-0 z-50 backdrop-blur-md bg-white/5 border-b border-white/10">
      <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl glass flex items-center justify-center">
            <svg class="w-6 h-6 text-emerald-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M12 2L4 7v10l8 5 8-5V7l-8-5z"/>
              <path d="M12 22V11"/>
            </svg>
          </div>
          <h1 class="text-xl font-semibold gradient-text">Agrotech IoT</h1>
        </div>
        <nav class="flex items-center gap-2">
          <RouterLink class="px-3 py-1.5 rounded-lg glass glass-hover" to="/">Dashboard</RouterLink>
          <RouterLink class="px-3 py-1.5 rounded-lg glass glass-hover" to="/cultivos">Cultivos</RouterLink>
          <RouterLink class="px-3 py-1.5 rounded-lg glass glass-hover" to="/sensores">Sensores</RouterLink>
          <RouterLink class="px-3 py-1.5 rounded-lg glass glass-hover" to="/plagas">Plagas</RouterLink>
          <RouterLink v-if="isAuthenticated" class="px-3 py-1.5 rounded-lg glass glass-hover" to="/camaras">Cámaras</RouterLink>
          <RouterLink class="px-3 py-1.5 rounded-lg glass glass-hover" to="/acciones">Acciones</RouterLink>
          <RouterLink class="px-3 py-1.5 rounded-lg glass glass-hover" to="/notificaciones">
            <span class="relative inline-block">
              <svg class="w-6 h-6 text-cyan-300 animate-pulse-soft" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5"/>
                <path d="M13.73 21a2 2 0 01-3.46 0"/>
              </svg>
              <span v-if="unreadCount>0" class="absolute -top-1 -right-1 text-xs bg-rose-500 text-white rounded-full px-1">{{ unreadCount }}</span>
            </span>
          </RouterLink>
        </nav>
        <div class="flex items-center gap-2">
          <template v-if="!isAuthenticated">
            <RouterLink class="px-3 py-1.5 rounded-lg glass glass-hover" to="/login">Login</RouterLink>
            <RouterLink class="px-3 py-1.5 rounded-lg glass glass-hover" to="/registro">Registro</RouterLink>
          </template>
          <template v-else>
            <span class="text-sm opacity-80">{{ userEmail }}</span>
            <button @click="logout" class="px-3 py-1.5 rounded-lg glass glass-hover">Salir</button>
          </template>
        </div>
      </div>
    </header>
    <main class="max-w-7xl mx-auto p-4">
      <RouterView />
    </main>
  </div>
  
  <!-- fondo 3D gradiente sencillo -->
  <canvas ref="bg" class="fixed inset-0 -z-10 opacity-30"></canvas>
  
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import * as THREE from 'three'
import { useNotificationsStore } from './stores/notifications'
import { useAuthStore } from './stores/auth'

const canvas = ref<HTMLCanvasElement | null>(null)
const bg = canvas
const notifications = useNotificationsStore()
const unreadCount = computed(() => notifications.unreadCount)
const auth = useAuthStore()
const isAuthenticated = computed(() => auth.isAuthenticated)
const userEmail = computed(() => (auth.user?.email as string) || '')
import { useRouter } from 'vue-router'
const router = useRouter()
const logout = async () => { await auth.signOut(); router.push('/login') }

onMounted(() => {
  if (!bg.value) return
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  const renderer = new THREE.WebGLRenderer({ canvas: bg.value, antialias: true, alpha: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  const geometry = new THREE.TorusKnotGeometry(2, 0.6, 128, 32)
  const material = new THREE.MeshPhongMaterial({ color: 0x60a5fa, emissive: 0x0a0a2a, shininess: 80, transparent: true, opacity: 0.5 })
  const mesh = new THREE.Mesh(geometry, material)
  const light1 = new THREE.PointLight(0x34d399, 1, 50)
  const light2 = new THREE.PointLight(0xa78bfa, 1, 50)
  light1.position.set(5, 5, 5)
  light2.position.set(-5, -5, -5)
  scene.add(mesh, light1, light2)
  camera.position.z = 6
  const animate = () => { requestAnimationFrame(animate); mesh.rotation.x += 0.002; mesh.rotation.y += 0.003; renderer.render(scene, camera) }
  animate()
  window.addEventListener('resize', () => { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight) })
})
</script>

<style scoped>
nav a.router-link-active { outline: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.08); }
</style>
