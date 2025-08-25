"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth-context";
import Link from "next/link";

type Cultivo = { id: number; nombre?: string; tipo?: string }

export default function CultivosPage() {
  const { token } = useAuth()

  const { data, isLoading, error } = useQuery({
    queryKey: ['cultivos'],
    queryFn: () => api.get<Cultivo[]>(`/cultivo/api/cultivos`, { token }),
    enabled: !!token,
  })

  if (!token) return (
    <main className="p-6">
      <p className="mb-3">Necesitas iniciar sesión para ver cultivos.</p>
      <Link className="text-blue-600 hover:underline" href="/login">Ir a login →</Link>
    </main>
  )
  if (isLoading) return <p className="p-6">Cargando…</p>
  if (error) return <p className="p-6 text-red-600">{String(error)}</p>

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Cultivos</h1>
      <ul className="divide-y">
        {(data || []).map(c => (
          <li key={c.id} className="py-3">{c.nombre || `Cultivo #${c.id}`}</li>
        ))}
      </ul>
    </main>
  )
}
