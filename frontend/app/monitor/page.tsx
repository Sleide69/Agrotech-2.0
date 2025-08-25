"use client";
import { useEffect, useRef, useState } from "react";

const GW = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:8088";

type WSMsg = {
  type: string
  id?: string
  request?: any
  response?: any
  error?: any
  data?: any
}

export default function MonitorPage() {
  const [messages, setMessages] = useState<WSMsg[]>([])
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    const wsUrl = GW.replace(/^http/, 'ws')
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws
    ws.onopen = () => {
      setMessages(m => [{ type: 'connection', data: { message: 'Conectado' } }, ...m])
    }
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data)
        setMessages(m => [msg, ...m].slice(0, 200))
      } catch {}
    }
    ws.onerror = () => setMessages(m => [{ type: 'error', data: { message: 'Error WS' } }, ...m])
    ws.onclose = () => setMessages(m => [{ type: 'connection', data: { message: 'Desconectado' } }, ...m])
    return () => ws.close()
  }, [])

  return (
    <main className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Monitor tiempo real (Gateway WS)</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded p-3 bg-white">
          <h2 className="font-medium mb-2">Eventos</h2>
          <ul className="space-y-2 max-h-[70vh] overflow-auto">
            {messages.map((m, i) => (
              <li key={i} className="text-sm border-b last:border-0 pb-2">
                <div className="font-mono text-xs text-gray-500">{m.type} {m.id ? `#${m.id}` : ''}</div>
                <pre className="whitespace-pre-wrap break-all text-xs bg-gray-50 p-2 rounded mt-1">{JSON.stringify(m, null, 2)}</pre>
              </li>
            ))}
          </ul>
        </div>
        <div className="border rounded p-3 bg-white">
          <h2 className="font-medium mb-2">Ayuda</h2>
          <p className="text-sm text-gray-600">Esta vista recibe eventos request/response/error desde el WebSocket del gateway.</p>
        </div>
      </div>
    </main>
  )
}
