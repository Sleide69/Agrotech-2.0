export default function Page() {
  return (
    <main className="p-8 max-w-6xl mx-auto space-y-4">
      <h1 className="text-3xl font-bold">Agrotech Dashboard</h1>
      <p className="text-gray-600">Gateway: {process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:8088'}</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a className="block border rounded p-4 hover:shadow bg-white" href="/sensores">
          <h2 className="font-semibold">Sensores</h2>
          <p className="text-sm text-gray-600">Lista y detalle con lecturas recientes.</p>
        </a>
        <a className="block border rounded p-4 hover:shadow bg-white" href="/cultivos">
          <h2 className="font-semibold">Cultivos</h2>
          <p className="text-sm text-gray-600">CRUD protegido vía JWT.</p>
        </a>
        <a className="block border rounded p-4 hover:shadow bg-white" href="/monitor">
          <h2 className="font-semibold">Monitor tiempo real</h2>
          <p className="text-sm text-gray-600">Eventos del gateway por WebSocket.</p>
        </a>
      </div>
    </main>
  )
}
