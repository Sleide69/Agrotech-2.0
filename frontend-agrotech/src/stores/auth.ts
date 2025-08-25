import { defineStore } from 'pinia'
import { supabase } from '../services/supabase'

type Session = any
type User = any

export const useAuthStore = defineStore('auth', {
  state: () => ({
    session: null as Session | null,
    user: null as User | null,
    role: null as string | null,
    initialized: false,
  }),
  getters: {
    isAuthenticated: (s: { session: Session | null }) => !!s.session,
    token: (s: { session: Session | null }) => (s.session as any)?.access_token as string | undefined,
  },
  actions: {
    async init() {
      try {
        if (supabase) {
          const { data } = await supabase.auth.getSession()
          ;(this as any).session = data.session
          ;(this as any).user = data.session?.user ?? null
          ;(this as any).role = ((this as any).user?.app_metadata?.role as string) || null
          supabase.auth.onAuthStateChange((_evt: any, sess: any) => {
            ;(this as any).session = sess
            ;(this as any).user = sess?.user ?? null
            ;(this as any).role = ((this as any).user?.app_metadata?.role as string) || null
          })
        }
      } finally {
        ;(this as any).initialized = true
      }
    },
    async signOut(): Promise<boolean> {
      if (supabase) await supabase.auth.signOut()
      ;(this as any).session = null
      ;(this as any).user = null
      ;(this as any).role = null
      return true
    }
  }
})
