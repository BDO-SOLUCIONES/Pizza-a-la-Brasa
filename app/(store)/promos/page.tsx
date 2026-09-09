import Link from 'next/link'
import { Tag, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { promos, formatPrice } from '@/lib/menu-data'

export default function PromosPage() {
  const activas = promos.filter((p) => p.active)

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <header className="mb-10 text-center">
        <span className="text-sm font-medium uppercase tracking-wider text-primary">
          Ofertas especiales
        </span>
        <h1 className="mt-2 font-serif text-4xl font-bold md:text-5xl">Promociones</h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Aprovecha nuestras promos vigentes. ¡Más sabor por menos!
        </p>
      </header>

      {activas.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          Por ahora no hay promociones activas. ¡Vuelve pronto!
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {activas.map((promo) => (
            <Card
              key={promo.id}
              className="flex flex-col gap-4 border-primary/30 p-6"
            >
              <div className="flex items-center justify-between">
                <span className="flex size-11 items-center justify-center rounded-full bg-accent/15 text-accent">
                  <Tag className="size-5" />
                </span>
                <Badge className="bg-accent text-accent-foreground">{promo.badge}</Badge>
              </div>
              <h3 className="font-serif text-2xl font-semibold">{promo.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {promo.description}
              </p>
              {promo.price && (
                <p className="font-serif text-2xl font-bold text-primary">
                  {formatPrice(promo.price)}
                </p>
              )}
              <Button variant="outline" className="mt-auto" render={<Link href="/menu" />}>
                Pedir ahora <ArrowRight className="size-4" />
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
