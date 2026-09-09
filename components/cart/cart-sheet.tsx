'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useCart } from './cart-provider'
import { formatPrice } from '@/lib/menu-data'

export function CartSheet() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, subtotal, count } =
    useCart()

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-serif text-2xl">
            Tu pedido {count > 0 && `(${count})`}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <ShoppingBag className="size-10 text-muted-foreground" />
            <p className="text-muted-foreground">Tu carrito está vacío.</p>
            <Button
              variant="secondary"
              onClick={() => setIsOpen(false)}
              render={<Link href="/menu" />}
            >
              Ver el menú
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4">
              <ul className="flex flex-col gap-4">
                {items.map((item) => (
                  <li key={item.id} className="flex gap-3">
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-md">
                      <Image
                        src={item.image || '/placeholder.svg'}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between gap-2">
                        <span className="font-medium leading-tight">{item.name}</span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-muted-foreground transition-colors hover:text-destructive"
                          aria-label={`Quitar ${item.name}`}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatPrice(item.price)}
                      </span>
                      <div className="mt-auto flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="size-7"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          aria-label="Restar"
                        >
                          <Minus className="size-3" />
                        </Button>
                        <span className="w-6 text-center text-sm">{item.quantity}</span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="size-7"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label="Sumar"
                        >
                          <Plus className="size-3" />
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <SheetFooter className="gap-3">
              <Separator />
              <div className="flex items-center justify-between text-lg">
                <span>Subtotal</span>
                <span className="font-serif font-semibold">{formatPrice(subtotal)}</span>
              </div>
              <Button
                size="lg"
                onClick={() => setIsOpen(false)}
                render={<Link href="/envios" />}
              >
                Continuar al pedido
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
