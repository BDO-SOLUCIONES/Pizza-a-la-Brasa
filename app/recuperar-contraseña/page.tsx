'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

export default function RecuperarContrasenaPage() {
  const [email, setEmail] = useState('')
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault()

    setMensaje(null)
    setError(null)
    setCargando(true)

    try {
      const supabase = createClient()

      const { error: resetError } =
        await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/actualizar-contrasena`,
        })

      if (resetError) {
        throw resetError
      }

      setMensaje(
        'Si existe una cuenta asociada a ese correo, recibirás un mensaje con las instrucciones para restablecer tu contraseña.',
      )
    } catch (err: unknown) {
      console.error('Error solicitando recuperación:', err)

      setError(
        'No pudimos procesar la solicitud. Inténtalo nuevamente más tarde.',
      )
    } finally {
      setCargando(false)
    }
  }

  return (
    <main className="flex min-h-[80vh] items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-8 shadow-xl">

        <div className="mb-8 flex flex-col items-center text-center">
          <div className="relative mb-4 size-20">
            <Image
              src="/images/logo-pizzeria.jpeg"
              alt="Logo Pizza a la Brasa"
              fill
              className="rounded-full object-contain"
              priority
            />
          </div>

          <h1 className="font-serif text-3xl font-bold">
            Recuperar contraseña
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Introduce el correo electrónico de tu cuenta y te
            enviaremos las instrucciones para recuperar el acceso.
          </p>
        </div>

        {mensaje && (
          <div
            role="status"
            className="mb-5 rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-sm leading-relaxed text-green-700"
          >
            {mensaje}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
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
              placeholder="tucorreo@ejemplo.com"
              className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none transition-colors focus:border-orange-500"
              required
              disabled={cargando}
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full rounded-lg bg-orange-600 py-3 font-medium text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cargando
              ? 'Enviando solicitud...'
              : 'Enviar instrucciones'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-sm font-medium text-orange-500 transition-colors hover:text-orange-400"
          >
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </main>
  )
}