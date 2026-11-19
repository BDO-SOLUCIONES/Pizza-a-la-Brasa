'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ShoppingBag,
  ClipboardList,
  Clock,
  Package,
  LogOut,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

import { createClient } from '@/lib/supabase/client'

type Order = {
  id: string
  customer_id: string | null
  created_at: string
  delivery_type: string
  pay_method: string
  subtotal: number | string
  delivery_fee: number | string
  total: number | string
  status: string
  address: string | null
  notes: string | null
}

type OrderItem = {
  order_id: string
  name: string
  quantity: number
  price: number | string
}

type UserRole = 'admin' | 'cliente'

const formatPrice = (price: number | string) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(Number(price))
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

const getStatusLabel = (status: string) => {
  const normalized = status.toLowerCase().trim()

  const labels: Record<string, string> = {
    pendiente: 'Pendiente',
    'en preparación': 'En preparación',
    en_preparacion: 'En preparación',
    'en preparacion': 'En preparación',
    listo: 'Listo',
    entregado: 'Entregado',
    cancelado: 'Cancelado',
  }

  return labels[normalized] ?? status
}

const getStatusStyle = (status: string) => {
  const normalized = status.toLowerCase().trim()

  if (normalized === 'entregado') {
    return 'border-green-500/30 bg-green-500/10 text-green-600'
  }

  if (normalized === 'cancelado') {
    return 'border-red-500/30 bg-red-500/10 text-red-500'
  }

  if (normalized === 'listo') {
    return 'border-blue-500/30 bg-blue-500/10 text-blue-500'
  }

  if (
    normalized === 'en preparación' ||
    normalized === 'en preparacion' ||
    normalized === 'en_preparacion'
  ) {
    return 'border-orange-500/30 bg-orange-500/10 text-orange-500'
  }

  return 'border-yellow-500/30 bg-yellow-500/10 text-yellow-600'
}

export default function MiCuentaPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [orders, setOrders] = useState<Order[]>([])
  const [itemsByOrder, setItemsByOrder] = useState<
    Record<string, OrderItem[]>
  >({})

  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  const [cargando, setCargando] = useState(true)
  const [cerrando, setCerrando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelado = false

    const cargarCuenta = async () => {
      const supabase = createClient()

      try {
        // 1. Comprobar que exista una sesión.
        const {
          data: { user },
          error: errorUsuario,
        } = await supabase.auth.getUser()

        if (cancelado) return

        if (errorUsuario || !user) {
          router.replace('/login')
          return
        }

        // 2. Consultar el rol de la cuenta.
        const { data: perfil, error: errorPerfil } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle()

        if (cancelado) return

        if (errorPerfil || !perfil) {
          setError(
            'No pudimos consultar tu perfil. Intenta nuevamente o contacta al administrador.',
          )
          setCargando(false)
          return
        }

        const role = perfil.role as UserRole

        // Si es administrador, dirigirlo al panel.
        if (role === 'admin') {
          router.replace('/admin/dashboard')
          return
        }

        // No permitir el acceso a cuentas con roles desconocidos.
        if (role !== 'cliente') {
          setError('Tu cuenta no tiene un rol válido.')
          setCargando(false)
          return
        }

        setEmail(user.email ?? '')

        // 3. Consultar exclusivamente los pedidos de esta cuenta.
        const { data: pedidos, error: errorPedidos } = await supabase
          .from('orders')
          .select(
            'id, customer_id, created_at, delivery_type, pay_method, subtotal, delivery_fee, total, status, address, notes',
          )
          .eq('customer_id', user.id)
          .order('created_at', { ascending: false })

        if (cancelado) return

        if (errorPedidos) {
          console.error('Error cargando pedidos:', errorPedidos.message)

          setError(
            'No pudimos cargar tu historial de pedidos. Inténtalo nuevamente más tarde.',
          )

          setCargando(false)
          return
        }

        const listaPedidos = (pedidos ?? []) as Order[]

        setOrders(listaPedidos)

        // Si todavía no hay pedidos, terminamos la carga.
        if (listaPedidos.length === 0) {
          setCargando(false)
          return
        }

        // 4. Consultar los productos asociados a esos pedidos.
        const idsPedidos = listaPedidos.map((pedido) => pedido.id)

        const { data: productosPedido, error: errorProductos } =
          await supabase
            .from('order_items')
            .select('order_id, name, quantity, price')
            .in('order_id', idsPedidos)

        if (cancelado) return

        if (errorProductos) {
          console.error(
            'Error cargando productos de los pedidos:',
            errorProductos.message,
          )

          setError(
            'Tus pedidos están cargados, pero no pudimos consultar sus productos.',
          )

          setCargando(false)
          return
        }

        // Organizar los productos por pedido.
        const agrupados: Record<string, OrderItem[]> = {}

        for (const producto of (productosPedido ?? []) as OrderItem[]) {
          if (!agrupados[producto.order_id]) {
            agrupados[producto.order_id] = []
          }

          agrupados[producto.order_id].push(producto)
        }

        setItemsByOrder(agrupados)
        setCargando(false)
      } catch (err) {
        console.error('Error cargando la cuenta:', err)

        if (!cancelado) {
          setError('Ocurrió un problema al cargar tu cuenta.')
          setCargando(false)
        }
      }
    }

    void cargarCuenta()

    return () => {
      cancelado = true
    }
  }, [router])

  // Cerrar sesión.
  const cerrarSesion = async () => {
    setCerrando(true)
    setError(null)

    try {
      const supabase = createClient()

      const { error: errorSesion } = await supabase.auth.signOut()

      if (errorSesion) {
        throw errorSesion
      }

      router.replace('/')
      router.refresh()
    } catch (err) {
      console.error('Error cerrando sesión:', err)

      setError('No se pudo cerrar la sesión. Inténtalo nuevamente.')
      setCerrando(false)
    }
  }

  if (cargando) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 size-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />

          <p className="text-muted-foreground">
            Cargando tu cuenta...
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto min-h-[70vh] max-w-5xl px-4 py-12">

      {/* Encabezado de la cuenta */}
      <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-lg sm:p-8">
        <span className="text-sm font-medium uppercase tracking-wider text-primary">
          Mi cuenta
        </span>

        <h1 className="mt-3 font-serif text-3xl font-bold sm:text-4xl">
          ¡Bienvenido a Pizza a la Brasa!
        </h1>

        <p className="mt-3 leading-relaxed text-muted-foreground">
          Consulta tus pedidos y revisa su estado desde tu cuenta.
        </p>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">
              Correo electrónico
            </p>

            <p className="mt-1 break-all font-medium">
              {email}
            </p>

            <span className="mt-2 inline-flex rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-600">
              Cliente registrado
            </span>
          </div>

          <button
            type="button"
            onClick={cerrarSesion}
            disabled={cerrando}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-medium transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogOut className="size-4" />

            {cerrando ? 'Cerrando sesión...' : 'Cerrar sesión'}
          </button>
        </div>
      </section>

      {/* Mensajes de error */}
      {error && (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500"
        >
          {error}
        </div>
      )}

      {/* Accesos rápidos */}
      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/menu"
          className="group rounded-xl border border-border/60 bg-card p-5 transition-colors hover:border-primary/50"
        >
          <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShoppingBag className="size-5" />
          </span>

          <h2 className="mt-4 font-serif text-xl font-semibold">
            Explorar el menú
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Descubre nuestras pizzas, bebidas y postres.
          </p>
        </Link>

        <Link
          href="/envios"
          className="group rounded-xl border border-border/60 bg-card p-5 transition-colors hover:border-primary/50"
        >
          <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ClipboardList className="size-5" />
          </span>

          <h2 className="mt-4 font-serif text-xl font-semibold">
            Realizar un pedido
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Elige tus productos y completa tu compra.
          </p>
        </Link>
      </section>

      {/* Historial de pedidos */}
      <section className="mt-12">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-2xl font-bold sm:text-3xl">
              Mis pedidos
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Consulta tus compras anteriores y su estado.
            </p>
          </div>

          <span className="rounded-full border border-border/60 bg-card px-4 py-2 text-sm">
            {orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'}
          </span>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/80 bg-card/50 px-6 py-12 text-center">
            <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Package className="size-8" />
            </span>

            <h3 className="mt-5 font-serif text-xl font-semibold">
              Todavía no tienes pedidos
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              Cuando realices una compra mientras tengas iniciada
              tu sesión, aparecerá aquí para que puedas consultar
              su folio, productos, importe y estado.
            </p>

            <Link
              href="/menu"
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary px-5 py-3 font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Ver el menú
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {orders.map((order) => {
              const orderItems = itemsByOrder[order.id] ?? []

              const folio = order.id
                .slice(0, 8)
                .toUpperCase()

              const expanded = expandedOrder === order.id

              return (
                <article
                  key={order.id}
                  className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm"
                >
                  <div className="p-5 sm:p-6">

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Folio del pedido
                        </p>

                        <h3 className="mt-1 font-serif text-2xl font-bold tracking-wide">
                          #{folio}
                        </h3>

                        <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="size-4 shrink-0" />

                          {formatDate(order.created_at)}
                        </p>
                      </div>

                      <span
                        className={`inline-flex w-fit items-center rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusStyle(order.status)}`}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </div>

                    <div className="mt-6 grid gap-4 border-t border-border/60 pt-5 sm:grid-cols-3">

                      <div>
                        <p className="text-sm text-muted-foreground">
                          Tipo de entrega
                        </p>

                        <p className="mt-1 font-medium">
                          {order.delivery_type === 'domicilio'
                            ? 'A domicilio'
                            : 'Recoger en tienda'}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">
                          Método de pago
                        </p>

                        <p className="mt-1 font-medium">
                          {order.pay_method === 'efectivo'
                            ? 'Efectivo'
                            : order.pay_method === 'tarjeta'
                              ? 'Tarjeta'
                              : order.pay_method}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total del pedido
                        </p>

                        <p className="mt-1 font-serif text-xl font-bold text-primary">
                          {formatPrice(order.total)}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setExpandedOrder(expanded ? null : order.id)
                      }
                      aria-expanded={expanded}
                      className="mt-6 flex w-full items-center justify-between gap-3 rounded-lg border border-border/60 px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-secondary/50"
                    >
                      <span className="flex items-center gap-2">
                        <ShoppingBag className="size-4 text-primary" />

                        Ver productos del pedido
                      </span>

                      {expanded ? (
                        <ChevronUp className="size-4" />
                      ) : (
                        <ChevronDown className="size-4" />
                      )}
                    </button>

                    {expanded && (
                      <div className="mt-4 rounded-xl border border-border/60 bg-background p-4">

                        {orderItems.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            No encontramos productos asociados a este pedido.
                          </p>
                        ) : (
                          <div className="flex flex-col gap-4">
                            {orderItems.map((item, index) => (
                              <div
                                key={`${item.order_id}-${item.name}-${index}`}
                                className="flex items-start justify-between gap-4 text-sm"
                              >
                                <div>
                                  <p className="font-medium">
                                    {item.name}
                                  </p>

                                  <p className="mt-1 text-muted-foreground">
                                    Cantidad: {item.quantity}
                                  </p>
                                </div>

                                <p className="shrink-0 font-medium">
                                  {formatPrice(
                                    Number(item.price) * item.quantity,
                                  )}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="mt-5 flex flex-col gap-2 border-t border-border/60 pt-4 text-sm">

                          <div className="flex justify-between gap-3">
                            <span className="text-muted-foreground">
                              Subtotal
                            </span>

                            <span>
                              {formatPrice(order.subtotal)}
                            </span>
                          </div>

                          <div className="flex justify-between gap-3">
                            <span className="text-muted-foreground">
                              Envío
                            </span>

                            <span>
                              {Number(order.delivery_fee) > 0
                                ? formatPrice(order.delivery_fee)
                                : 'Gratis'}
                            </span>
                          </div>

                          <div className="flex justify-between gap-3 border-t border-border/60 pt-3 font-semibold">
                            <span>Total</span>

                            <span className="text-primary">
                              {formatPrice(order.total)}
                            </span>
                          </div>
                        </div>

                        {order.address && (
                          <div className="mt-5 border-t border-border/60 pt-4">
                            <p className="text-sm text-muted-foreground">
                              Dirección de entrega
                            </p>

                            <p className="mt-1 text-sm">
                              {order.address}
                            </p>
                          </div>
                        )}

                        {order.notes && (
                          <div className="mt-4">
                            <p className="text-sm text-muted-foreground">
                              Notas del pedido
                            </p>

                            <p className="mt-1 whitespace-pre-line text-sm">
                              {order.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      <div className="mt-10 text-center">
        <Link
          href="/"
          className="text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  )
}