<template>
  <div class="max-w-md mx-auto mt-10 glass p-6">
    <h2 class="text-xl font-semibold mb-4">Registro</h2>
    <form @submit.prevent="submit" class="space-y-3">
      <input v-model="email" placeholder="Email" class="w-full px-3 py-2 rounded bg-white/10 outline-none" />
      <input v-model="nombre" placeholder="Nombre" class="w-full px-3 py-2 rounded bg-white/10 outline-none" />
      <input v-model="password" placeholder="Password" type="password" class="w-full px-3 py-2 rounded bg-white/10 outline-none" />
      <button class="px-4 py-2 rounded-lg bg-cyan-500/80 hover:bg-cyan-400/80 transition">Crear cuenta</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const email = ref('')
const nombre = ref('')
const password = ref('')
const router = useRouter()
const auth = useAuthStore()

async function submit() {
  try {
    const { supabase } = await import('../services/supabase')
    if (supabase) {
      const { error } = await supabase.auth.signUp({ email: email.value, password: password.value, options: { data: { nombre: nombre.value } } })
      if (error) throw error
      alert('Revisa tu correo para confirmar. Luego inicia sesión.')
      return router.push('/login')
    }
  } catch (e) {}
  alert('Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY para usar registro.')
}
</script>
