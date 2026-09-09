'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  LayoutDashboard,
  Pizza,
  Tag,
  Receipt,
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
  TrendingUp,
  ShoppingCart,
  DollarSign,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import {
  products as seedProducts,
  promos as seedPromos,
  categoryLabels,
  formatPrice,
  type Product,
  type Category,
  type Promo,
} from '@/lib/menu-data'
import { toast } from 'sonner'

type Section = 'resumen' | 'productos' | 'promos' | 'pedidos'

const navItems: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: 'resumen', label: 'Resumen', icon: LayoutDashboard },
  { id: 'productos', label: 'Productos', icon: Pizza },
  { id: 'promos', label: 'Promociones', icon: Tag },
  { id: 'pedidos', label: 'Pedidos', icon: Receipt },
]

const mockOrders = [
  { id: '#1042', cliente: 'Ana López', tipo: 'Domicilio', total: 398, estado: 'En preparación' },
  { id: '#1041', cliente: 'Carlos Ruiz', tipo: 'Tienda', total: 179, estado: 'Listo' },
  { id: '#1040', cliente: 'María Díaz', tipo: 'Domicilio', total: 254, estado: 'Entregado' },
  { id: '#1039', cliente: 'Jorge Mena', tipo: 'Domicilio', total: 567, estado: 'Entregado' },
]

export default function AdminPage() {
  const [section, setSection] = useState<Section>('resumen')
  const [items, setItems] = useState<Product[]>(seedProducts)
  const [promoList, setPromoList] = useState<Promo[]>(seedPromos)

  return (
    <div className="flex min-h-dvh">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border/60 bg-sidebar p-4 md:flex">
        <Link href="/" className="mb-8 flex items-center gap-2 px-2">
          <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Pizza className="size-5" />
          </span>
          <span className="font-serif text-lg font-semibold">Bella Pizza</span>
        </Link>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                section === item.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground/80 hover:bg-secondary',
              )}
            >
              <item.icon className="size-4" /> {item.label}
            </button>
          ))}
        </nav>
        <Button
          variant="ghost"
          className="mt-auto justify-start"
          render={<Link href="/" />}
        >
          <ArrowLeft className="size-4" /> Volver al sitio
        </Button>
      </aside>

      <div className="flex flex-1 flex-col">
        {/* Topbar */}
        <header className="flex items-center justify-between border-b border-border/60 px-6 py-4">
          <div>
            <h1 className="font-serif text-2xl font-bold capitalize">{section}</h1>
            <p className="text-sm text-muted-foreground">Panel de administración</p>
          </div>
          {/* Mobile section selector */}
          <div className="md:hidden">
            <Select value={section} onValueChange={(v) => setSection(v as Section)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {navItems.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </header>

        <div className="flex-1 p-6">
          {section === 'resumen' && <Resumen items={items} />}
          {section === 'productos' && <Productos items={items} setItems={setItems} />}
          {section === 'promos' && <Promos promoList={promoList} setPromoList={setPromoList} />}
          {section === 'pedidos' && <Pedidos />}
        </div>
      </div>
    </div>
  )
}

function Resumen({ items }: { items: Product[] }) {
  const ventas = mockOrders.reduce((s, o) => s + o.total, 0)
  const stats = [
    { label: 'Ventas del día', value: formatPrice(ventas), icon: DollarSign },
    { label: 'Pedidos', value: mockOrders.length.toString(), icon: ShoppingCart },
    { label: 'Productos activos', value: items.length.toString(), icon: Pizza },
    { label: 'Ticket promedio', value: formatPrice(Math.round(ventas / mockOrders.length)), icon: TrendingUp },
  ]
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <s.icon className="size-4 text-primary" />
            </div>
            <p className="mt-3 font-serif text-3xl font-bold">{s.value}</p>
          </Card>
        ))}
      </div>
      <Card className="p-6">
        <h3 className="mb-4 font-serif text-xl font-semibold">Pedidos recientes</h3>
        <OrdersTable />
      </Card>
    </div>
  )
}

function Productos({
  items,
  setItems,
}: {
  items: Product[]
  setItems: React.Dispatch<React.SetStateAction<Product[]>>
}) {
  const [editing, setEditing] = useState<Product | null>(null)
  const [open, setOpen] = useState(false)

  function handleSave(product: Product) {
    setItems((prev) => {
      const exists = prev.some((p) => p.id === product.id)
      if (exists) return prev.map((p) => (p.id === product.id ? product : p))
      return [...prev, product]
    })
    setOpen(false)
    setEditing(null)
    toast.success('Producto guardado')
  }

  function handleDelete(id: string) {
    setItems((prev) => prev.filter((p) => p.id !== id))
    toast.success('Producto eliminado')
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <Dialog
          open={open}
          onOpenChange={(o) => {
            setOpen(o)
            if (!o) setEditing(null)
          }}
        >
          <DialogTrigger render={<Button onClick={() => setEditing(null)} />}>
            <Plus className="size-4" /> Nuevo producto
          </DialogTrigger>
          <ProductDialog product={editing} onSave={handleSave} />
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((product) => (
          <Card key={product.id} className="overflow-hidden p-0">
            <div className="relative aspect-[16/9]">
              <Image
                src={product.image || '/placeholder.svg'}
                alt={product.name}
                fill
                className="object-cover"
                sizes="33vw"
              />
            </div>
            <div className="flex flex-col gap-2 p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{product.name}</h3>
                <Badge variant="secondary">{categoryLabels[product.category]}</Badge>
              </div>
              <p className="font-serif text-lg font-semibold text-primary">
                {formatPrice(product.price)}
              </p>
              <div className="mt-2 flex gap-2">
                <Dialog
                  onOpenChange={(o) => {
                    if (o) setEditing(product)
                    setOpen(o)
                  }}
                >
                  <DialogTrigger
                    render={<Button variant="outline" size="sm" className="flex-1" />}
                  >
                    <Pencil className="size-3.5" /> Editar
                  </DialogTrigger>
                  <ProductDialog product={editing} onSave={handleSave} />
                </Dialog>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(product.id)}
                  aria-label="Eliminar"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function ProductDialog({
  product,
  onSave,
}: {
  product: Product | null
  onSave: (p: Product) => void
}) {
  const [form, setForm] = useState({
    name: product?.name ?? '',
    price: product?.price?.toString() ?? '',
    category: product?.category ?? ('pizzas' as Category),
    description: product?.description ?? '',
    ingredients: product?.ingredients.join(', ') ?? '',
  })

  function submit() {
    if (!form.name || !form.price) {
      toast.error('Completa nombre y precio')
      return
    }
    onSave({
      id: product?.id ?? form.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
      name: form.name,
      price: Number(form.price),
      category: form.category,
      description: form.description,
      ingredients: form.ingredients.split(',').map((i) => i.trim()).filter(Boolean),
      image: product?.image ?? '/images/pizza-margherita.png',
      popular: product?.popular,
    })
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle className="font-serif text-2xl">
          {product ? 'Editar producto' : 'Nuevo producto'}
        </DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="p-name">Nombre</Label>
          <Input
            id="p-name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="p-price">Precio (MXN)</Label>
            <Input
              id="p-price"
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Categoría</Label>
            <Select
              value={form.category}
              onValueChange={(v) => setForm({ ...form, category: v as Category })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pizzas">Pizzas</SelectItem>
                <SelectItem value="bebidas">Bebidas</SelectItem>
                <SelectItem value="postres">Postres</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="p-desc">Descripción</Label>
          <Textarea
            id="p-desc"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="p-ing">Ingredientes (separados por coma)</Label>
          <Input
            id="p-ing"
            value={form.ingredients}
            onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
          />
        </div>
      </div>
      <DialogFooter>
        <Button onClick={submit}>Guardar producto</Button>
      </DialogFooter>
    </DialogContent>
  )
}

function Promos({
  promoList,
  setPromoList,
}: {
  promoList: Promo[]
  setPromoList: React.Dispatch<React.SetStateAction<Promo[]>>
}) {
  function toggle(id: string) {
    setPromoList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p)),
    )
  }
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {promoList.map((promo) => (
        <Card key={promo.id} className="flex flex-col gap-3 p-5">
          <div className="flex items-center justify-between">
            <Badge className={promo.active ? 'bg-primary text-primary-foreground' : ''} variant={promo.active ? 'default' : 'secondary'}>
              {promo.active ? 'Activa' : 'Inactiva'}
            </Badge>
            <span className="text-xs text-muted-foreground">{promo.badge}</span>
          </div>
          <h3 className="font-serif text-lg font-semibold">{promo.title}</h3>
          <p className="text-sm text-muted-foreground">{promo.description}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-auto"
            onClick={() => toggle(promo.id)}
          >
            {promo.active ? 'Desactivar' : 'Activar'}
          </Button>
        </Card>
      ))}
    </div>
  )
}

function Pedidos() {
  return (
    <Card className="p-6">
      <h3 className="mb-4 font-serif text-xl font-semibold">Todos los pedidos</h3>
      <OrdersTable />
    </Card>
  )
}

function OrdersTable() {
  const estadoColor: Record<string, string> = {
    'En preparación': 'bg-primary/15 text-primary',
    Listo: 'bg-chart-3/20 text-chart-3',
    Entregado: 'bg-secondary text-muted-foreground',
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/60 text-left text-muted-foreground">
            <th className="pb-3 font-medium">Pedido</th>
            <th className="pb-3 font-medium">Cliente</th>
            <th className="pb-3 font-medium">Tipo</th>
            <th className="pb-3 font-medium">Total</th>
            <th className="pb-3 font-medium">Estado</th>
          </tr>
        </thead>
        <tbody>
          {mockOrders.map((o) => (
            <tr key={o.id} className="border-b border-border/40 last:border-0">
              <td className="py-3 font-medium">{o.id}</td>
              <td className="py-3">{o.cliente}</td>
              <td className="py-3 text-muted-foreground">{o.tipo}</td>
              <td className="py-3">{formatPrice(o.total)}</td>
              <td className="py-3">
                <span
                  className={cn(
                    'rounded-full px-2.5 py-1 text-xs font-medium',
                    estadoColor[o.estado],
                  )}
                >
                  {o.estado}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
