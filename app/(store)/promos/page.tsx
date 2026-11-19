'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Tag, Sparkles } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type Promo = {
  id: string
  title: string
  description: string
  badge: string
  price: number | null
  active: boolean
  created_at?: string
}

export default function PromosPage() {
  const [promos, setPromos] = useState<Promo[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function loadPromos() {
      setLoading(true)
      setErrorMessage('')

      const supabase = createClient()

      const { data, error } = await supabase
        .from('promos')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false })

      if (cancelled) return

      if (error) {
        console.error('Error cargando promociones:', error.message)

        setPromos([])
        setErrorMessage(
          'No pudimos cargar las promociones en este momento.',
        )
        setLoading(false)
        return
      }

      const formattedPromos: Promo[] = (data ?? []).map(
        (promo: any) => ({
          id: promo.id,
          title: promo.title ?? '',
          description: promo.description ?? '',
          badge: promo.badge ?? '',
          price:
            promo.price === null || promo.price === undefined
              ? null
              : Number(promo.price),
          active: Boolean(promo.active),
          created_at: promo.created_at,
        }),
      )

      setPromos(formattedPromos)
      setLoading(false)
    }

    loadPromos()

    return () => {
      cancelled = true
    }
  }, [reloadKey])

  return (
    <div className="mx-auto min-h-[60vh] max-w-6xl px-4 py-12">
      {/* Encabezado */}
      <header className="mb-12 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
          <Sparkles className="size-4" />
          Ofertas especiales
        </span>

        <h1 className="mt-5 font-serif text-4xl font-bold md:text-5xl">
          Nuestras promociones
        </h1>

        <p className="mx-auto mt-4 max-w-xl leading-relaxed text-muted-foreground">
          Descubre nuestras ofertas y disfruta tus pizzas favoritas
          con promociones especiales de Pizza a la Brasa.
        </p>
      </header>

      {/* Cargando */}
      {loading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <Card
              key={item}
              className="h-72 animate-pulse bg-secondary/40"
            />
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && errorMessage && (
        <Card className="mx-auto flex max-w-xl flex-col items-center p-10 text-center">
          <Tag className="size-10 text-muted-foreground" />

          <h2 className="mt-4 font-serif text-xl font-semibold">
            No pudimos cargar las promociones
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            {errorMessage}
          </p>

          <Button
            className="mt-5"
            onClick={() => setReloadKey((current) => current + 1)}
          >
            Intentar nuevamente
          </Button>
        </Card>
      )}

      {/* Sin promociones */}
      {!loading && !errorMessage && promos.length === 0 && (
        <Card className="mx-auto flex max-w-xl flex-col items-center p-10 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Tag className="size-8" />
          </span>

          <h2 className="mt-5 font-serif text-2xl font-semibold">
            ¡Pronto tendremos promociones!
          </h2>

          <p className="mt-3 leading-relaxed text-muted-foreground">
            Por ahora no hay ofertas activas. Mientras tanto,
            puedes descubrir todos nuestros productos en el menú.
          </p>

          <Button className="mt-6" render={<Link href="/menu" />}>
            Explorar menú
            <ArrowRight className="size-4" />
          </Button>
        </Card>
      )}

      {/* Promociones de Supabase */}
      {!loading && !errorMessage && promos.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {promos.map((promo) => (
            <Card
              key={promo.id}
              className="group flex flex-col overflow-hidden border-primary/20 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl"
            >
              {/* Parte superior */}
              <div className="relative overflow-hidden bg-gradient-to-br from-primary/15 via-card to-accent/10 p-6">
                <div className="flex items-start justify-between gap-4">
                  <span className="flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary transition-transform duration-300 group-hover:scale-110">
                    <Tag className="size-6" />
                  </span>

                  {promo.badge && (
                    <Badge className="bg-accent text-accent-foreground">
                      {promo.badge}
                    </Badge>
                  )}
                </div>

                <div className="pointer-events-none absolute -bottom-10 -right-6 size-32 rounded-full border border-primary/10" />
                <div className="pointer-events-none absolute -bottom-16 -right-12 size-40 rounded-full border border-primary/10" />
              </div>

              {/* Información */}
              <div className="flex flex-1 flex-col p-6">
                <h2 className="font-serif text-2xl font-semibold leading-tight">
                  {promo.title}
                </h2>

                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {promo.description}
                </p>

                {promo.price !== null && (
                  <div className="mt-5">
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">
                      Precio especial
                    </span>

                    <p className="mt-1 font-serif text-3xl font-bold text-primary">
                      {new Intl.NumberFormat('es-MX', {
                        style: 'currency',
                        currency: 'MXN',
                      }).format(promo.price)}
                    </p>
                  </div>
                )}

                <Button
                  className="mt-6 w-full"
                  variant="outline"
                  render={<Link href="/menu" />}
                >
                  Pedir ahora
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Nota inferior */}
      {!loading && !errorMessage && promos.length > 0 && (
        <p className="mt-10 text-center text-sm text-muted-foreground">
          Las promociones están sujetas a disponibilidad.
        </p>
      )}
    </div>
  )
}