'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ActualizarContrasenaPage() {
  const [password, setPassword] = useState('')
  const [confirmarPassword, setConfirmarPassword] = useState('')

  const [verificando, setVerificando] = useState(true)
  const [sesionValida, setSesionValida] = useState(false)
  const [actualizada, setActualizada] = useState(false)
  const [cargando, setCargando] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [mensaje, setMensaje] = useState<string | null>(null)

  // Evita procesar dos veces el enlace durante la inicialización.
  const inicializacion = useRef<Promise<void> | null>(null)

  useEffect(() => {
    if (inicializacion.current) return

    inicializacion.current = (async () => {
      const supabase = createClient()

      try {
        // 1. Leer el código incluido en el enlace del correo.
        const url = new URL(window.location.href)
        const code = url.searchParams.get('code')

        // 2. Intercambiar el código por una sesión válida.
        if (code) {
          const { error: errorIntercambio } =
            await supabase.auth.exchangeCodeForSession(code)

          if (errorIntercambio) {
            setError(
              'El enlace de recuperación no es válido o ha caducado. Solicita uno nuevo.',
            )
            setVerificando(false)
            return
          }

          // Retirar el código de la barra de direcciones.
          url.searchParams.delete('code')

          window.history.replaceState(
            {},
            document.title,
            `${url.pathname}${url.search}${url.hash}`,
          )
        }

        // 3. Comprobar que existe una sesión autorizada.
        const {
          data: { user },
          error: errorUsuario,
        } = await supabase.auth.getUser()

        if (errorUsuario || !user) {
          setError(
            'No encontramos una sesión válida. Solicita un nuevo enlace de recuperación.',
          )
          setVerificando(false)
          return
        }

        setSesionValida(true)
      } catch (err) {
        console.error('Error verificando la recuperación:', err)

        setError(
          'No se pudo verificar el enlace. Solicita uno nuevo e inténtalo otra vez.',
        )
      } finally {
        setVerificando(false)
      }
    })()
  }, [])

  const handleActualizar = async (
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

      // Actualizar la contraseña de la cuenta autenticada.
      const { error: errorActualizacion } =
        await supabase.auth.updateUser({
          password,
        })

      if (errorActualizacion) {
        throw errorActualizacion
      }

      // Cerrar la sesión para que pueda ingresar con su nueva contraseña.
      await supabase.auth.signOut()

      setPassword('')
      setConfirmarPassword('')
      setSesionValida(false)
      setActualizada(true)

      setMensaje(
        'Tu contraseña se actualizó correctamente. Ya puedes iniciar sesión con tu nueva contraseña.',
      )
    } catch (err: unknown) {
      console.error('Error actualizando la contraseña:', err)

      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo actualizar la contraseña. Inténtalo nuevamente.',
      )
    } finally {
      setCargando(false)
    }
  }

  return (
    <main className="flex min-h-[80vh] items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-8 shadow-xl">

        {/* Encabezado */}
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
            Nueva contraseña
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Crea una nueva contraseña para recuperar el acceso a tu cuenta.
          </p>
        </div>

        {/* Estado de verificación */}
        {verificando && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Verificando el enlace de recuperación...
          </p>
        )}

        {/* Mensaje de éxito */}
        {actualizada && (
          <div
            role="status"
            className="rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-sm leading-relaxed text-green-700"
          >
            {mensaje}

            <Link
              href="/login"
              className="mt-4 block font-semibold text-orange-600 hover:text-orange-500"
            >
              Ir al inicio de sesión
            </Link>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm leading-relaxed text-red-600"
          >
            {error}

            {!verificando && !sesionValida && !actualizada && (
              <Link
                href="/recuperar-contrasena"
                className="mt-3 block font-semibold text-orange-600 hover:text-orange-500"
              >
                Solicitar otro enlace
              </Link>
            )}
          </div>
        )}

        {/* Formulario */}
        {!verificando && sesionValida && !actualizada && (
          <form onSubmit={handleActualizar} className="space-y-5">

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium"
              >
                Nueva contraseña
              </label>

              <input
                id="password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none transition-colors focus:border-orange-500"
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
                minLength={8}
                value={confirmarPassword}
                onChange={(e) => setConfirmarPassword(e.target.value)}
                placeholder="Escribe nuevamente la contraseña"
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
                ? 'Actualizando...'
                : 'Guardar nueva contraseña'}
            </button>
          </form>
        )}

        {!actualizada && (
          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm text-orange-500 transition-colors hover:text-orange-400"
            >
              Volver al inicio de sesión
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}