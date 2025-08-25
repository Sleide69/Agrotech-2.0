import { createRouter, createWebHistory, NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Cultivos from '../views/Cultivos.vue'
import Sensores from '../views/Sensores.vue'
import Plagas from '../views/Plagas.vue'
import Acciones from '../views/Acciones.vue'
import Notificaciones from '../views/Notificaciones.vue'
import Camaras from '../views/Camaras.vue'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'dashboard', component: Dashboard },
    { path: '/login', name: 'login', component: Login },
    { path: '/registro', name: 'register', component: Register },
    { path: '/cultivos', name: 'cultivos', component: Cultivos, meta: { requiresAuth: true } },
    { path: '/sensores', name: 'sensores', component: Sensores, meta: { requiresAuth: true } },
    { path: '/plagas', name: 'plagas', component: Plagas, meta: { requiresAuth: true } },
    { path: '/acciones', name: 'acciones', component: Acciones, meta: { requiresAuth: true } },
  { path: '/camaras', name: 'camaras', component: Camaras, meta: { requiresAuth: true } },
    { path: '/notificaciones', name: 'notificaciones', component: Notificaciones, meta: { requiresAuth: true } },
  ]
})

router.beforeEach(async (to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) => {
  const auth = useAuthStore()
  if (!auth.initialized) await auth.init()
  if (to.meta.requiresAuth && !auth.isAuthenticated) return next('/login')
  next()
})

export default router
