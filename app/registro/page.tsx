'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function RegistroPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmarPassword, setConfirmarPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)

  const router = useRouter()

  const handleRegistro = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault()

    setError(null)
    setMensaje(null)

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }

    if (password !== confirmarPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setCargando(true)

    try {
      const supabase = createClient()

      // Crear la cuenta de cliente en Supabase.
      const { data, error: registroError } =
        await supabase.auth.signUp({
          email: email.trim(),
          password,
        })

      if (registroError) {
        throw new Error(registroError.message)
      }

      // Si Supabase creó una sesión, entrar al área del cliente.
      if (data.session) {
        router.replace('/mi-cuenta')
        router.refresh()
        return
      }

      // Si se requiere confirmar el correo, informar al usuario.
      setMensaje(
        'Tu cuenta se creó correctamente. Revisa tu correo electrónico para confirmar tu dirección antes de iniciar sesión.',
      )
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo crear la cuenta. Inténtalo nuevamente.',
      )
    } finally {
      setCargando(false)
    }
  }

  return (
    <main className="flex min-h-[80vh] items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-orange-900/30 bg-card p-8 shadow-2xl">

        <div className="mb-8 flex flex-col items-center text-center">
          <div className="relative mb-4 size-24">
            <Image
              src="/images/logo-pizzeria.jpeg"
              alt="Logo Pizza a la Brasa"
              fill
              className="rounded-full object-contain"
              priority
            />
          </div>

          <h1 className="font-serif text-3xl font-bold">
            Crear cuenta
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Únete a Pizza a la Brasa y disfruta de nuestros productos.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-center text-sm text-red-500"
          >
            {error}
          </div>
        )}

        {mensaje && (
          <div
            role="status"
            className="mb-5 rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-center text-sm text-green-600"
          >
            {mensaje}
          </div>
        )}

        <form onSubmit={handleRegistro} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium"
            >
              Correo electrónico
            </label>

            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none transition-colors focus:border-orange-500"
              placeholder="tucorreo@ejemplo.com"
              required
              disabled={cargando}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium"
            >
              Contraseña
            </label>

            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none transition-colors focus:border-orange-500"
              placeholder="Mínimo 8 caracteres"
              minLength={8}
              required
              disabled={cargando}
            />
          </div>

          <div>
            <label
              htmlFor="confirmarPassword"
              className="mb-2 block text-sm font-medium"
            >
              Confirmar contraseña
            </label>

            <input
              id="confirmarPassword"
              type="password"
              autoComplete="new-password"
              value={confirmarPassword}
              onChange={(e) =>
                setConfirmarPassword(e.target.value)
              }
              className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none transition-colors focus:border-orange-500"
              placeholder="Repite tu contraseña"
              minLength={8}
              required
              disabled={cargando}
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className={`w-full rounded-lg py-3 font-medium text-white transition-colors ${
              cargando
                ? 'cursor-not-allowed bg-orange-800'
                : 'bg-orange-600 hover:bg-orange-700'
            }`}
          >
            {cargando ? 'Creando cuenta...' : 'Crear mi cuenta'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          ¿Ya tienes una cuenta?{' '}
          <Link
            href="/login"
            className="font-medium text-orange-500 hover:text-orange-400"
          >
            Inicia sesión
          </Link>
        </div>

        <div className="mt-4 text-center">
          <Link
            href="/"
            className="text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            Volver a la página principal
          </Link>
        </div>
      </div>
    </main>
  )
}