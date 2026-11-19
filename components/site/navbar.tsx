'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu, ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet'

import { cn } from '@/lib/utils'
import { useCart } from '@/components/cart/cart-provider'
import { createClient } from '@/lib/supabase/client'

type UserRole = 'admin' | 'cliente'

type CurrentUser = {
  email: string
  role: UserRole
}

const links = [
  { href: '/', label: 'Inicio' },
  { href: '/menu', label: 'Menú' },
  { href: '/envios', label: 'Envíos' },
  { href: '/ubicacion', label: 'Ubicación' },
  { href: '/promos', label: 'Promos' },
]

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()

  const { count, setIsOpen } = useCart()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)

  // Consultar si hay una sesión y reconocer el rol del usuario.
  useEffect(() => {
    const supabase = createClient()
    let mounted = true

    const loadCurrentUser = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (!mounted) return

      if (userError || !user) {
        setCurrentUser(null)
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()

      if (!mounted) return

      if (
        profileError ||
        !profile ||
        (profile.role !== 'admin' && profile.role !== 'cliente')
      ) {
        setCurrentUser(null)
        return
      }

      setCurrentUser({
        email: user.email ?? '',
        role: profile.role as UserRole,
      })
    }

    void loadCurrentUser()

    // Actualizar la navegación cuando cambia la sesión.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setCurrentUser(null)
        return
      }

      // Consultar el perfil después de que se actualice la sesión.
      window.setTimeout(() => {
        void loadCurrentUser()
      }, 0)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Cerrar sesión.
  const handleLogout = async () => {
    const supabase = createClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
      toast.error('No se pudo cerrar la sesión. Inténtalo nuevamente.')
      return
    }

    setCurrentUser(null)
    setMobileOpen(false)

    toast.success('Sesión cerrada correctamente.')

    router.replace('/')
    router.refresh()
  }

  // Determinar la dirección correspondiente al rol.
  const accountHref =
    currentUser?.role === 'admin'
      ? '/admin/dashboard'
      : '/mi-cuenta'

  const accountLabel =
    currentUser?.role === 'admin'
      ? 'Administración'
      : 'Mi cuenta'

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/logo-pizzeria.jpeg"
            alt="Logo Pizza a la Brasa"
            width={46}
            height={46}
            className="rounded-full object-cover"
            priority
          />

          <span className="font-serif text-xl font-semibold tracking-tight">
            Pizza a la Brasa
          </span>
        </Link>

        {/* Navegación de escritorio */}
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-primary',
                pathname === link.href
                  ? 'text-primary'
                  : 'text-foreground/80',
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Cuenta y carrito */}
        <div className="flex items-center gap-2">

          {currentUser ? (
            <>
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:inline-flex"
                render={<Link href={accountHref} />}
              >
                {accountLabel}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex"
                onClick={handleLogout}
              >
                Cerrar sesión
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex"
              render={<Link href="/login" />}
            >
              Iniciar sesión
            </Button>
          )}

          {/* Carrito */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => setIsOpen(true)}
            aria-label="Abrir carrito"
          >
            <ShoppingCart className="size-5" />

            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-accent-foreground">
                {count}
              </span>
            )}
          </Button>

          {/* Menú móvil */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              className="md:hidden"
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Abrir menú"
                />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>

            <SheetContent side="left" className="w-72">
              <SheetTitle className="sr-only">
                Navegación
              </SheetTitle>

              <nav className="mt-8 flex flex-col gap-1">

                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'rounded-md px-3 py-3 text-base font-medium transition-colors hover:bg-secondary',
                      pathname === link.href
                        ? 'text-primary'
                        : 'text-foreground',
                    )}
                  >
                    {link.label}
                  </Link>
                ))}

                <div className="my-3 border-t border-border/60" />

                {currentUser ? (
                  <>
                    <Link
                      href={accountHref}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-md px-3 py-3 text-base font-medium text-primary transition-colors hover:bg-secondary"
                    >
                      {accountLabel}
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="rounded-md px-3 py-3 text-left text-sm text-muted-foreground transition-colors hover:bg-secondary"
                    >
                      Cerrar sesión
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="rounded-md px-3 py-3 text-base font-medium transition-colors hover:bg-secondary"
                    >
                      Iniciar sesión
                    </Link>

                    <Link
                      href="/registro"
                      onClick={() => setMobileOpen(false)}
                      className="rounded-md px-3 py-3 text-sm text-primary transition-colors hover:bg-secondary"
                    >
                      Crear cuenta
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}