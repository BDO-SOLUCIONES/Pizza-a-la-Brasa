'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Truck, Store, Banknote, CreditCard, MessageCircle, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useCart } from '@/components/cart/cart-provider'
import { formatPrice } from '@/lib/menu-data'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type DeliveryType = 'domicilio' | 'tienda'
type PayMethod = 'efectivo' | 'tarjeta'

// Número de WhatsApp de la pizzería (temporal)
function formatWhatsappNumber(phone: string) {
  let digits = phone.replace(/\D/g, '')

  // Si el cliente escribe solo 10 dígitos de México, agrega el código 52
  if (digits.length === 10) {
    digits = `52${digits}`
  }

  // Corrige números antiguos tipo 521...
  if (digits.startsWith('521') && digits.length === 13) {
    digits = `52${digits.slice(3)}`
  }

  return digits
}

export default function EnviosPage() {
  const { items, subtotal, clear } = useCart()
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [delivery, setDelivery] = useState<DeliveryType>('domicilio')
  const [pay, setPay] = useState<PayMethod>('efectivo')
  const [form, setForm] = useState({
    nombre: '',
    telefono: '',
    direccion: '',
    referencias: '',
    notas: '',
  })

  const deliveryFee = delivery === 'domicilio' ? 35 : 0
  const total = subtotal + deliveryFee

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault()

  if (submitting) return

  if (items.length === 0) {
    toast.error('Tu carrito está vacío.')
    return
  }

  if (!form.nombre.trim() || !form.telefono.trim()) {
    toast.error('Completa tu nombre y teléfono.')
    return
  }

  if (delivery === 'domicilio' && !form.direccion.trim()) {
    toast.error('Ingresa tu domicilio para la entrega.')
    return
  }

  const customerWhatsapp = formatWhatsappNumber(form.telefono)

  if (customerWhatsapp.length < 12) {
    toast.error('Ingresa un número de WhatsApp válido.')
    return
  }



  setSubmitting(true)

  try {
    const supabase = createClient()

    // Registrar el pedido y sus productos en Supabase.
    const { data: orderId, error } = await supabase.rpc('create_order', {
      p_customer_name: form.nombre.trim(),
      p_customer_phone: form.telefono.trim(),

      p_address:
        delivery === 'domicilio'
          ? form.direccion.trim()
          : null,

      p_delivery_type: delivery,
      p_pay_method: pay,

      p_notes:
        [
          form.referencias.trim()
            ? `Referencias: ${form.referencias.trim()}`
            : '',
          form.notas.trim(),
        ]
          .filter(Boolean)
          .join('\n') || null,

      p_items: items.map((item) => ({
        product_id: item.id,
        name: item.name,
        quantity: item.quantity,
      })),
    })

    if (error) {
      console.error('Error registrando el pedido:', error.message)



      toast.error(
        `No se pudo registrar el pedido: ${error.message}`,
      )

      return
    }

    if (!orderId) {


      toast.error('No se recibió el folio del pedido.')
      return
    }

    // Preparar el ticket una vez que el pedido se haya guardado.
    const orderNumber = orderId.slice(0, 8).toUpperCase()

    // El pedido ya fue guardado correctamente en Supabase.
clear()

toast.success(
  `Pedido #${orderNumber} registrado correctamente.`,
)

// Mostrar la página de confirmación con el folio.
router.push(`/pedido-confirmado/${orderNumber}`)

return
  } catch (error) {
    console.error('Error procesando el pedido:', error)



    toast.error(
      'Ocurrió un problema al registrar el pedido. Inténtalo nuevamente.',
    )
  } finally {
    setSubmitting(false)
  }
}
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <header className="mb-8">
        <h1 className="font-serif text-4xl font-bold md:text-5xl">Finaliza tu pedido</h1>
        <p className="mt-2 text-muted-foreground">
          Elige cómo quieres recibir tu pizza y completa tus datos. Tu ticket se genera
          por WhatsApp para confirmar y resolver cualquier duda.
        </p>
      </header>

      {items.length === 0 ? (
        <Card className="flex flex-col items-center gap-4 p-12 text-center">
          <ShoppingBag className="size-10 text-muted-foreground" />
          <p className="text-muted-foreground">No tienes productos en el carrito.</p>
          <Button render={<Link href="/menu" />}>Ir al menú</Button>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="flex flex-col gap-8">
            {/* Tipo de entrega */}
            <section>
              <h2 className="mb-4 font-serif text-2xl font-semibold">1. Tipo de entrega</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <OptionCard
                  active={delivery === 'domicilio'}
                  onClick={() => setDelivery('domicilio')}
                  icon={Truck}
                  title="Entrega a domicilio"
                  text="Llevamos tu pedido a tu puerta."
                />
                <OptionCard
                  active={delivery === 'tienda'}
                  onClick={() => setDelivery('tienda')}
                  icon={Store}
                  title="Recoger en tienda"
                  text="Pasa por tu pedido y ahorra el envío."
                />
              </div>
            </section>

            {/* Datos */}
            <section>
              <h2 className="mb-4 font-serif text-2xl font-semibold">2. Tus datos</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="nombre">¿A quién se entrega?</Label>
                  <Input
                    id="nombre"
                    value={form.nombre}
                    onChange={(e) => update('nombre', e.target.value)}
                    placeholder="Nombre completo"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="telefono">Teléfono / WhatsApp</Label>
                  <Input
                    id="telefono"
                    type="tel"
                    value={form.telefono}
                    onChange={(e) => update('telefono', e.target.value)}
                    placeholder="** **** ****"
                    required
                  />
                </div>
                {delivery === 'domicilio' && (
                  <>
                    <div className="flex flex-col gap-2 sm:col-span-2">
                      <Label htmlFor="direccion">Domicilio</Label>
                      <Input
                        id="direccion"
                        value={form.direccion}
                        onChange={(e) => update('direccion', e.target.value)}
                        placeholder="Calle, número, colonia, CP"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-2 sm:col-span-2">
                      <Label htmlFor="referencias">Referencias (opcional)</Label>
                      <Input
                        id="referencias"
                        value={form.referencias}
                        onChange={(e) => update('referencias', e.target.value)}
                        placeholder="Color de la casa, entre calles, etc."
                      />
                    </div>
                  </>
                )}
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <Label htmlFor="notas">Notas del pedido (opcional)</Label>
                  <Textarea
                    id="notas"
                    value={form.notas}
                    onChange={(e) => update('notas', e.target.value)}
                    placeholder="Sin cebolla, extra queso, etc."
                    rows={3}
                  />
                </div>
              </div>
            </section>

            {/* Pago */}
            <section>
              <h2 className="mb-4 font-serif text-2xl font-semibold">3. Método de pago</h2>
              <RadioGroup
                value={pay}
                onValueChange={(v) => setPay(v as PayMethod)}
                className="grid gap-4 sm:grid-cols-2"
              >
                <Label
                  htmlFor="efectivo"
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors',
                    pay === 'efectivo' ? 'border-primary bg-primary/10' : 'border-border',
                  )}
                >
                  <RadioGroupItem value="efectivo" id="efectivo" />
                  <Banknote className="size-5 text-primary" />
                  <span className="font-medium">Efectivo</span>
                </Label>
                <Label
                  htmlFor="tarjeta"
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors',
                    pay === 'tarjeta' ? 'border-primary bg-primary/10' : 'border-border',
                  )}
                >
                  <RadioGroupItem value="tarjeta" id="tarjeta" />
                  <CreditCard className="size-5 text-primary" />
                  <span className="font-medium">Tarjeta</span>
                </Label>
              </RadioGroup>
              <p className="mt-3 text-xs text-muted-foreground">
                El cobro se coordina al confirmar tu pedido (en tienda o con el repartidor).
              </p>
            </section>
          </div>

          {/* Resumen */}
          <aside>
            <Card className="sticky top-20 p-6">
              <h2 className="font-serif text-2xl font-semibold">Resumen</h2>
              <ul className="mt-4 flex flex-col gap-3">
                {items.map((i) => (
                  <li key={i.id} className="flex justify-between gap-2 text-sm">
                    <span className="text-muted-foreground">
                      {i.quantity}x {i.name}
                    </span>
                    <span>{formatPrice(i.price * i.quantity)}</span>
                  </li>
                ))}
              </ul>
              <Separator className="my-4" />
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Envío</span>
                  <span>{deliveryFee ? formatPrice(deliveryFee) : 'Gratis'}</span>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span className="font-serif text-primary">{formatPrice(total)}</span>
              </div>
              <Button type="submit" size="lg" className="mt-6 w-full">
                <MessageCircle className="size-4" /> Generar ticket por WhatsApp
              </Button>
            </Card>
          </aside>
        </form>
      )}
    </div>
  )
}

function OptionCard({
  active,
  onClick,
  icon: Icon,
  title,
  text,
}: {
  active: boolean
  onClick: () => void
  icon: React.ElementType
  title: string
  text: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col items-start gap-2 rounded-xl border p-5 text-left transition-colors',
        active ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/40',
      )}
    >
      <span
        className={cn(
          'flex size-10 items-center justify-center rounded-full',
          active ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground',
        )}
      >
        <Icon className="size-5" />
      </span>
      <span className="font-serif text-lg font-semibold">{title}</span>
      <span className="text-sm text-muted-foreground">{text}</span>
    </button>
  )
}
