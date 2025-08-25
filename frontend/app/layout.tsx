import './globals.css'
import { ReactNode } from 'react'
import Providers from './providers'
import Link from 'next/link'
import { Suspense } from 'react'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-dvh bg-gray-50 text-gray-900">
        <Providers>
          <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b">
            <nav className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-6">
              <Link href="/" className="font-semibold">Mundo Verde</Link>
              <Link href="/sensores" className="hover:text-green-700">Sensores</Link>
              <Link href="/cultivos" className="hover:text-green-700">Cultivos</Link>
              <Link href="/monitor" className="hover:text-green-700">Monitor tiempo real</Link>
              <div className="ml-auto flex items-center gap-3 text-sm">
                <Link href="/login" className="px-3 py-1.5 rounded border hover:bg-gray-100">Iniciar sesión</Link>
              </div>
            </nav>
          </header>
          <Suspense>
            {children}
          </Suspense>
        </Providers>
      </body>
    </html>
  )
}
