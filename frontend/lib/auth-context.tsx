"use client";
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from './api'

type User = { id?: number; name?: string; email?: string } | null

type AuthContextType = {
  user: User
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<User>(null)

  useEffect(() => {
    const t = localStorage.getItem('auth_token')
    const u = localStorage.getItem('auth_user')
    if (t) setToken(t)
    if (u) setUser(JSON.parse(u))
  }, [])

  const login = async (email: string, password: string) => {
    // Laravel login via gateway: /plaga/login → /api/login
    const data = await api.post<{ token: string; user?: any }>('/plaga/login', { email, password })
    setToken(data.token)
    setUser(data.user || { email })
    localStorage.setItem('auth_token', data.token)
    localStorage.setItem('auth_user', JSON.stringify(data.user || { email }))
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  }

  const value = useMemo(() => ({ user, token, login, logout }), [user, token])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
