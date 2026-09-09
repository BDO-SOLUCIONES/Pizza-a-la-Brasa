'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { useCart } from '@/components/cart/cart-provider'

const links = [
  { href: '/', label: 'Inicio' },
  { href: '/menu', label: 'Menú' },
  { href: '/envios', label: 'Envíos' },
  { href: '/ubicacion', label: 'Ubicación' },
  { href: '/promos', label: 'Promos' },
]

export function Navbar() {
  const pathname = usePathname()
  const { count, setIsOpen } = useCart()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
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
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-primary',
                pathname === link.href ? 'text-primary' : 'text-foreground/80',
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
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

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              className="md:hidden"
              render={<Button variant="ghost" size="icon" aria-label="Abrir menú" />}
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <SheetTitle className="sr-only">Navegación</SheetTitle>
              <nav className="mt-8 flex flex-col gap-1">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'rounded-md px-3 py-3 text-base font-medium transition-colors hover:bg-secondary',
                      pathname === link.href ? 'text-primary' : 'text-foreground',
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="mt-4 rounded-md px-3 py-3 text-sm text-muted-foreground hover:bg-secondary"
                >
                  Panel de administración
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
