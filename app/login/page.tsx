'use client'
import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { iniciarSesion } from '@/lib/supabase/auth.service'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setCargando(true)

    try {
      // Llamamos a nuestro servicio de autenticación
      await iniciarSesion(email, password)
      
      // Si todo sale bien, redirigimos al dashboard
      router.push('/admin/dashboard')
    } catch (err: any) {
      // Si falla, mostramos el mensaje en pantalla
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0705] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#1a1311] border border-orange-900/30 rounded-2xl p-8 shadow-2xl">
        
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="relative w-24 h-24 mb-4">
            <Image 
              src="/image/logo-pizzeria.jpeg" 
              alt="Logo Pizza a la Brasa"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-3xl font-serif text-white mb-2">Pizza a la Brasa</h1>
          <p className="text-orange-500/80">Acceso Administrativo</p>
        </div>

        {/* Alerta de Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-900 text-red-400 text-sm rounded-lg text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-[#0f0a08] border border-gray-800 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors"
              placeholder="admin@pizzaalabrasa.com"
              required
              disabled={cargando}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#0f0a08] border border-gray-800 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors"
              placeholder="••••••••"
              required
              disabled={cargando}
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className={`w-full font-medium py-3 rounded-lg transition-colors text-white ${cargando ? 'bg-orange-800 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'}`}
          >
            {cargando ? 'Verificando...' : 'Ingresar al Panel'}
          </button>
        </form>

      </div>
    </div>
  )
}