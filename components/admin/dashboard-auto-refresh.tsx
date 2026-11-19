'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'

export function DashboardAutoRefresh() {
  const router = useRouter()

  useEffect(() => {
    // Actualizar el dashboard cada 60 segundos.
    const interval = window.setInterval(() => {
      // Evitar consultas automáticas si la pestaña está oculta.
      if (document.visibilityState === 'visible') {
        router.refresh()
      }
    }, 60_000)

    // Limpiar el intervalo cuando se desmonte el componente.
    return () => {
      window.clearInterval(interval)
    }
  }, [router])

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">
      <RefreshCw className="size-3.5" />

      <span>Actualización automática cada minuto</span>
    </div>
  )
}