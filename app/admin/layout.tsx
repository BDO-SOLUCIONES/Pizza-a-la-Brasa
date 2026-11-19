'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Pizza,
  Tag,
  Receipt,
  ArrowLeft,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const navigation = [
  {
    href: '/admin/dashboard',
    label: 'Resumen',
    icon: LayoutDashboard,
  },
  {
    href: '/admin/productos',
    label: 'Productos',
    icon: Pizza,
  },
  {
    href: '/admin/promociones',
    label: 'Promociones',
    icon: Tag,
  },
  {
    href: '/admin/pedidos',
    label: 'Pedidos',
    icon: Receipt,
  },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-dvh bg-background">
      {/* Menú móvil */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border/60 bg-sidebar',
          'transform transition-transform duration-200 md:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-between border-b border-border/60 px-5">
          <Link
            href="/"
            className="flex items-center gap-3"
            onClick={() => setMobileOpen(false)}
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Pizza className="size-5" />
            </span>

            <div>
              <p className="font-serif text-lg font-semibold leading-tight">
                Pizza a la Brasa
              </p>
              <p className="text-xs text-muted-foreground">
                Administración
              </p>
            </div>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Cerrar menú"
          >
            <X className="size-5" />
          </Button>
        </div>

        {/* Navegación */}
        <nav className="flex-1 space-y-1 p-4">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Administración
          </p>

          {navigation.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground',
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Parte inferior */}
        <div className="border-t border-border/60 p-4">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <ArrowLeft className="size-4" />
            Volver al sitio
          </Link>

          <button
            type="button"
            className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-destructive"
          >
            <LogOut className="size-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido */}
      <div className="md:pl-72">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/60 bg-background/90 px-4 backdrop-blur-md md:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menú"
            >
              <Menu className="size-5" />
            </Button>

            <div>
              <p className="text-xs text-muted-foreground">
                Panel de administración
              </p>
              <h1 className="font-serif text-lg font-semibold">
                Pizza a la Brasa
              </h1>
            </div>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <div className="text-right">
              <p className="text-sm font-medium">
                Administrador
              </p>
              <p className="text-xs text-muted-foreground">
                Panel de control
              </p>
            </div>

            <div className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              A
            </div>
          </div>
        </header>

        {/* Página actual */}
        <main className="min-h-[calc(100dvh-4rem)] p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}