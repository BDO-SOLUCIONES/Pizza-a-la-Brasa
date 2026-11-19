'use client'
import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { iniciarSesion } from '@/lib/supabase/auth.service'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  setError(null)
  setCargando(true)

  try {
    // Iniciar sesión y consultar el rol del usuario.
    const usuario = await iniciarSesion(email, password)

    // Redirigir según el rol asignado en Supabase.
    if (usuario.role === 'admin') {
      router.replace('/admin/dashboard')
    } else if (usuario.role === 'cliente') {
      router.replace('/mi-cuenta')
    }
  } catch (err: unknown) {
    // Mostrar el error en pantalla.
    setError(
      err instanceof Error
        ? err.message
        : 'Ocurrió un problema al iniciar sesión.',
    )
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
              src="/images/logo-pizzeria.jpeg"
              alt="Logo Pizza a la Brasa"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-3xl font-serif text-white mb-2">Pizza a la Brasa</h1>
          <p className="text-orange-500/80">
                    Inicia sesión en tu cuenta
          </p>
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
            {cargando ? 'Verificando...' : 'Iniciar sesión'}
          </button>
        </form>

<div className="mt-6 text-center text-sm text-gray-400">
  ¿No tienes una cuenta?{' '}
  <Link
    href="/registro"
    className="font-medium text-orange-500 hover:text-orange-400"
  >
    Crear cuenta
  </Link>
</div>

{/* Recuperar contraseña */}
<div className="mt-4 text-center">
  <Link
    href="/recuperar-contrasena"
    className="text-sm text-orange-500 transition-colors hover:text-orange-400"
  >
    ¿Olvidaste tu contraseña?
  </Link>
</div>

</div>
    </div>
  )
}