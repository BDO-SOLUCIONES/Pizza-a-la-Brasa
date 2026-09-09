'use client'

import Image from 'next/image'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { useCart } from '@/components/cart/cart-provider'
import { formatPrice, type Product } from '@/lib/menu-data'
import { toast } from 'sonner'

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()

  return (
    <Card className="group flex flex-col overflow-hidden p-0 transition-colors hover:border-primary/50">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={product.image || '/placeholder.svg'}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        {product.popular && (
          <Badge className="absolute left-3 top-3 bg-accent text-accent-foreground">
            Popular
          </Badge>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-serif text-xl font-semibold leading-tight">
            {product.name}
          </h3>
          <span className="shrink-0 font-serif text-lg font-semibold text-primary">
            {formatPrice(product.price)}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{product.description}</p>
        <p className="text-xs leading-relaxed text-muted-foreground/80">
          {product.ingredients.join(' · ')}
        </p>
        <Button
          className="mt-auto"
          onClick={() => {
            addItem(product)
            toast.success(`${product.name} agregado al carrito`)
          }}
        >
          <Plus className="size-4" /> Agregar
        </Button>
      </div>
    </Card>
  )
}
