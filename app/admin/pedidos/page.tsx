'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  Banknote,
  CheckCircle2,
  ChefHat,
  ClipboardList,
  Clock,
  CreditCard,
  Eye,
  MapPin,
  Package,
  Phone,
  RefreshCw,
  Search,
  Store,
  Truck,
  XCircle,
} from 'lucide-react'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

type Order = {
  id: string
  customer_name: string
  customer_phone: string
  address: string | null
  delivery_type: string
  pay_method: string
  subtotal: number
  delivery_fee: number
  total: number
  status: string
  notes: string | null
  created_at: string | null
}

type OrderItem = {
  id: string
  order_id: string
  product_id: string | null
  name: string
  quantity: number
  price: number
}

const STATUS_OPTIONS = [
  'Pendiente',
  'En preparación',
  'Listo',
  'Entregado',
  'Cancelado',
] as const

type Status = (typeof STATUS_OPTIONS)[number]

const STATUS_STYLES: Record<string, string> = {
  Pendiente: 'border-amber-500/30 bg-amber-500/10 text-amber-600',
  'En preparación':
    'border-blue-500/30 bg-blue-500/10 text-blue-500',
  Listo: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500',
  Entregado:
    'border-green-500/30 bg-green-500/10 text-green-600',
  Cancelado: 'border-red-500/30 bg-red-500/10 text-red-500',
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(value)
}

function formatDate(value: string | null) {
  if (!value) return 'Fecha no disponible'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Fecha no disponible'
  }

  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function formatOrderId(id: string) {
  return id.slice(0, 8).toUpperCase()
}

function formatDeliveryType(value: string) {
  if (value === 'domicilio') return 'A domicilio'
  if (value === 'tienda') return 'Recoger en tienda'

  return value
}

function formatPayment(value: string) {
  if (value === 'efectivo') return 'Efectivo'
  if (value === 'tarjeta') return 'Tarjeta'

  return value
}

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={STATUS_STYLES[status] ?? ''}
    >
      {status}
    </Badge>
  )
}

export default function PedidosPage() {
  const [supabase] = useState(() => createClient())

  const [orders, setOrders] = useState<Order[]>([])
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [loadError, setLoadError] = useState('')

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('Todos')

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(
    null,
  )

  const loadOrders = useCallback(async () => {
    setLoadError('')

    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        customer_name,
        customer_phone,
        address,
        delivery_type,
        pay_method,
        subtotal,
        delivery_fee,
        total,
        status,
        notes,
        created_at
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error cargando pedidos:', error.message)
      setLoadError(error.message)
      toast.error('No se pudieron cargar los pedidos')
      setOrders([])
      setOrderItems([])
      setLoading(false)
      setRefreshing(false)
      return
    }

    const formattedOrders: Order[] = (data ?? []).map(
      (order: any) => ({
        id: order.id,
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        address: order.address ?? null,
        delivery_type: order.delivery_type,
        pay_method: order.pay_method,
        subtotal: Number(order.subtotal),
        delivery_fee: Number(order.delivery_fee),
        total: Number(order.total),
        status: order.status ?? 'Pendiente',
        notes: order.notes ?? null,
        created_at: order.created_at ?? null,
      }),
    )

    setOrders(formattedOrders)

    if (formattedOrders.length === 0) {
      setOrderItems([])
      setLoading(false)
      setRefreshing(false)
      return
    }

    const orderIds = formattedOrders.map((order) => order.id)

    const { data: itemsData, error: itemsError } = await supabase
      .from('order_items')
      .select('id, order_id, product_id, name, quantity, price')
      .in('order_id', orderIds)

    if (itemsError) {
      console.error(
        'Error cargando productos de pedidos:',
        itemsError.message,
      )

      toast.error('No se pudieron cargar los detalles de los productos')
      setOrderItems([])
    } else {
      const formattedItems: OrderItem[] = (itemsData ?? []).map(
        (item: any) => ({
          id: item.id,
          order_id: item.order_id,
          product_id: item.product_id ?? null,
          name: item.name,
          quantity: Number(item.quantity),
          price: Number(item.price),
        }),
      )

      setOrderItems(formattedItems)
    }

    setLoading(false)
    setRefreshing(false)
  }, [supabase])

  useEffect(() => {
    void loadOrders()
  }, [loadOrders])

  const filteredOrders = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return orders.filter((order) => {
      const matchesSearch =
        !normalizedSearch ||
        order.customer_name.toLowerCase().includes(normalizedSearch) ||
        order.customer_phone.toLowerCase().includes(normalizedSearch) ||
        order.id.toLowerCase().includes(normalizedSearch) ||
        formatOrderId(order.id).toLowerCase().includes(normalizedSearch)

      const matchesStatus =
        statusFilter === 'Todos' ||
        order.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [orders, search, statusFilter])

  const pendingCount = orders.filter(
    (order) => order.status === 'Pendiente',
  ).length

  const preparationCount = orders.filter(
    (order) => order.status === 'En preparación',
  ).length

  const readyCount = orders.filter(
    (order) => order.status === 'Listo',
  ).length

  const selectedItems = useMemo(
    () =>
      selectedOrder
        ? orderItems.filter(
            (item) => item.order_id === selectedOrder.id,
          )
        : [],
    [selectedOrder, orderItems],
  )

  async function refreshOrders() {
    setRefreshing(true)
    await loadOrders()
  }

  async function changeStatus(order: Order, newStatus: string) {
    if (order.status === newStatus) return
    if (updatingOrderId) return

    setUpdatingOrderId(order.id)

    const { data, error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', order.id)
      .select('id, status')
      .maybeSingle()

    if (error) {
      console.error('Error actualizando estado:', error.message)

      toast.error('No se pudo actualizar el estado del pedido')
      setUpdatingOrderId(null)
      return
    }

    if (!data) {
      toast.error(
        'No se pudo confirmar la actualización del pedido.',
      )
      setUpdatingOrderId(null)
      return
    }

    setOrders((current) =>
      current.map((item) =>
        item.id === order.id
          ? { ...item, status: data.status }
          : item,
      ),
    )

    setSelectedOrder((current) =>
      current?.id === order.id
        ? { ...current, status: data.status }
        : current,
    )

    toast.success(
      `Pedido #${formatOrderId(order.id)} actualizado a "${data.status}"`,
    )

    setUpdatingOrderId(null)
  }

  function countUnits(orderId: string) {
    return orderItems
      .filter((item) => item.order_id === orderId)
      .reduce((sum, item) => sum + item.quantity, 0)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Encabezado */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <ClipboardList className="size-6" />
          </span>

          <div>
            <h1 className="font-serif text-3xl font-bold">
              Pedidos
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Consulta y administra las órdenes de tus clientes.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={refreshOrders}
          disabled={refreshing || loading}
        >
          <RefreshCw
            className={`size-4 ${refreshing ? 'animate-spin' : ''}`}
          />
          Actualizar pedidos
        </Button>
      </header>

      {/* Estadísticas */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total de pedidos"
          value={orders.length}
          description="Órdenes registradas"
          icon={<ClipboardList className="size-5" />}
        />

        <StatCard
          title="Pendientes"
          value={pendingCount}
          description="Esperando preparación"
          icon={<Clock className="size-5" />}
        />

        <StatCard
          title="En preparación"
          value={preparationCount}
          description="Pedidos en cocina"
          icon={<ChefHat className="size-5" />}
        />

        <StatCard
          title="Listos para entregar"
          value={readyCount}
          description="Esperando al cliente o repartidor"
          icon={<CheckCircle2 className="size-5" />}
        />
      </div>

      {/* Filtros */}
      <Card className="flex flex-col gap-4 p-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por cliente, teléfono o folio..."
            className="h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <select
          aria-label="Filtrar por estado"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="Todos">Todos los estados</option>

          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </Card>

      {/* Error */}
      {loadError && (
        <Card className="flex flex-col gap-3 border-destructive/30 p-6">
          <div className="flex items-center gap-2 text-destructive">
            <XCircle className="size-5" />

            <h2 className="font-semibold">
              No se pudieron cargar los pedidos
            </h2>
          </div>

          <p className="text-sm text-muted-foreground">
            {loadError}
          </p>

          <Button
            variant="outline"
            className="w-fit"
            onClick={refreshOrders}
          >
            <RefreshCw className="size-4" />
            Reintentar
          </Button>
        </Card>
      )}

      {/* Cargando */}
      {loading && !loadError && (
        <div className="grid gap-4">
          {[1, 2, 3].map((item) => (
            <Card
              key={item}
              className="h-24 animate-pulse bg-secondary/40"
            />
          ))}
        </div>
      )}

      {/* Sin resultados */}
      {!loading && !loadError && filteredOrders.length === 0 && (
        <Card className="flex flex-col items-center px-6 py-16 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-secondary">
            <ClipboardList className="size-8 text-muted-foreground" />
          </span>

          <h2 className="mt-5 font-serif text-xl font-semibold">
            {orders.length === 0
              ? 'Todavía no hay pedidos'
              : 'No encontramos pedidos'}
          </h2>

          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            {orders.length === 0
              ? 'Cuando un cliente finalice una compra, aparecerá aquí automáticamente.'
              : 'Prueba con otro término de búsqueda o cambia el filtro de estado.'}
          </p>

          {orders.length > 0 && (
            <Button
              className="mt-5"
              variant="outline"
              onClick={() => {
                setSearch('')
                setStatusFilter('Todos')
              }}
            >
              Limpiar filtros
            </Button>
          )}
        </Card>
      )}

      {/* Tabla para computadora */}
      {!loading && !loadError && filteredOrders.length > 0 && (
        <>
          <Card className="hidden overflow-hidden p-0 md:block">
            <div className="border-b border-border/60 px-5 py-4">
              <div className="font-serif text-lg font-semibold">
                Registro de pedidos
              </div>

              <p className="mt-1 text-sm text-muted-foreground">
                {filteredOrders.length} resultado(s)
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-secondary/30 text-left text-muted-foreground">
                    <th className="px-5 py-4 font-medium">Pedido</th>
                    <th className="px-5 py-4 font-medium">Cliente</th>
                    <th className="px-5 py-4 font-medium">Entrega</th>
                    <th className="px-5 py-4 font-medium">Total</th>
                    <th className="px-5 py-4 font-medium">Estado</th>
                    <th className="px-5 py-4 text-right font-medium">
                      Detalles
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-border/40 transition-colors last:border-0 hover:bg-secondary/20"
                    >
                      <td className="px-5 py-4">
                        <div className="font-semibold">
                          #{formatOrderId(order.id)}
                        </div>

                        <div className="mt-1 text-xs text-muted-foreground">
                          {formatDate(order.created_at)}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-medium">
                          {order.customer_name}
                        </div>

                        <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Phone className="size-3" />
                          {order.customer_phone}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {order.delivery_type === 'domicilio' ? (
                            <Truck className="size-4 text-primary" />
                          ) : (
                            <Store className="size-4 text-primary" />
                          )}

                          <span>
                            {formatDeliveryType(order.delivery_type)}
                          </span>
                        </div>

                        <div className="mt-1 text-xs text-muted-foreground">
                          {formatPayment(order.pay_method)}
                        </div>
                      </td>

                      <td className="px-5 py-4 font-semibold">
                        {formatPrice(order.total)}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-col items-start gap-2">
                          <StatusBadge status={order.status} />

                          <select
                            aria-label={`Cambiar estado del pedido ${formatOrderId(order.id)}`}
                            value={order.status}
                            disabled={updatingOrderId === order.id}
                            onChange={(event) =>
                              void changeStatus(order, event.target.value)
                            }
                            className="h-8 max-w-44 rounded-md border border-input bg-background px-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                          >
                            {!STATUS_OPTIONS.some(
                              (status) => status === order.status,
                            ) && (
                              <option value={order.status}>
                                {order.status}
                              </option>
                            )}

                            {STATUS_OPTIONS.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="size-4" />
                          Ver
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Tarjetas para celular */}
          <div className="grid gap-4 md:hidden">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">
                      Pedido #{formatOrderId(order.id)}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(order.created_at)}
                    </p>
                  </div>

                  <StatusBadge status={order.status} />
                </div>

                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 text-muted-foreground">
                      <ClipboardList className="size-4" />
                    </span>

                    <div>
                      <p className="font-medium">
                        {order.customer_name}
                      </p>

                      <p className="text-muted-foreground">
                        {order.customer_phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    {order.delivery_type === 'domicilio' ? (
                      <Truck className="size-4" />
                    ) : (
                      <Store className="size-4" />
                    )}

                    {formatDeliveryType(order.delivery_type)}
                  </div>

                  <div className="flex items-center justify-between border-t border-border/60 pt-3">
                    <span className="text-muted-foreground">
                      Total
                    </span>

                    <span className="font-serif text-xl font-bold text-primary">
                      {formatPrice(order.total)}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label
                      className="text-xs font-medium text-muted-foreground"
                      htmlFor={`mobile-status-${order.id}`}
                    >
                      Estado del pedido
                    </label>

                    <select
                      id={`mobile-status-${order.id}`}
                      value={order.status}
                      disabled={updatingOrderId === order.id}
                      onChange={(event) =>
                        void changeStatus(order, event.target.value)
                      }
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                    >
                      {!STATUS_OPTIONS.some(
                        (status) => status === order.status,
                      ) && (
                        <option value={order.status}>
                          {order.status}
                        </option>
                      )}

                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <Eye className="size-4" />
                      Ver detalles
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Diálogo con detalles */}
      <Dialog
        open={selectedOrder !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedOrder(null)
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          {selectedOrder && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <Package className="size-6" />
                  </span>

                  <div>
                    <DialogTitle className="font-serif text-2xl">
                      Pedido #{formatOrderId(selectedOrder.id)}
                    </DialogTitle>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatDate(selectedOrder.created_at)}
                    </p>
                  </div>
                </div>
              </DialogHeader>

              <div className="flex flex-col gap-6 py-2">
                {/* Cliente */}
                <section>
                  <h3 className="mb-3 font-semibold">
                    Información del cliente
                  </h3>

                  <div className="grid gap-3 rounded-xl border border-border/60 p-4 sm:grid-cols-2">
                    <InfoItem
                      icon={<ClipboardList className="size-4" />}
                      label="Nombre"
                      value={selectedOrder.customer_name}
                    />

                    <InfoItem
                      icon={<Phone className="size-4" />}
                      label="Teléfono"
                      value={selectedOrder.customer_phone}
                    />

                    <InfoItem
                      icon={
                        selectedOrder.delivery_type === 'domicilio' ? (
                          <Truck className="size-4" />
                        ) : (
                          <Store className="size-4" />
                        )
                      }
                      label="Tipo de entrega"
                      value={formatDeliveryType(
                        selectedOrder.delivery_type,
                      )}
                    />

                    <InfoItem
                      icon={
                        selectedOrder.pay_method === 'efectivo' ? (
                          <Banknote className="size-4" />
                        ) : (
                          <CreditCard className="size-4" />
                        )
                      }
                      label="Forma de pago"
                      value={formatPayment(selectedOrder.pay_method)}
                    />

                    {selectedOrder.address && (
                      <div className="sm:col-span-2">
                        <InfoItem
                          icon={<MapPin className="size-4" />}
                          label="Dirección"
                          value={selectedOrder.address}
                        />
                      </div>
                    )}
                  </div>
                </section>

                {/* Productos */}
                <section>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold">
                      Productos del pedido
                    </h3>

                    <span className="text-xs text-muted-foreground">
                      {selectedItems.reduce(
                        (sum, item) => sum + item.quantity,
                        0,
                      )}{' '}
                      unidad(es)
                    </span>
                  </div>

                  {selectedItems.length === 0 ? (
                    <Card className="p-5 text-sm text-muted-foreground">
                      No hay productos disponibles para mostrar.
                    </Card>
                  ) : (
                    <div className="overflow-hidden rounded-xl border border-border/60">
                      {selectedItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-4 border-b border-border/40 p-4 last:border-0"
                        >
                          <div>
                            <p className="font-medium">
                              {item.name}
                            </p>

                            <p className="mt-1 text-xs text-muted-foreground">
                              Cantidad: {item.quantity} ·{' '}
                              {formatPrice(item.price)} por unidad
                            </p>
                          </div>

                          <p className="shrink-0 font-semibold">
                            {formatPrice(
                              item.price * item.quantity,
                            )}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* Totales */}
                <section className="rounded-xl border border-border/60 p-4">
                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-muted-foreground">
                      Subtotal
                    </span>

                    <span>{formatPrice(selectedOrder.subtotal)}</span>
                  </div>

                  <div className="mt-3 flex justify-between gap-4 text-sm">
                    <span className="text-muted-foreground">
                      Envío
                    </span>

                    <span>
                      {selectedOrder.delivery_fee === 0
                        ? 'Gratis'
                        : formatPrice(selectedOrder.delivery_fee)}
                    </span>
                  </div>

                  <div className="mt-4 flex justify-between gap-4 border-t border-border/60 pt-4">
                    <span className="font-semibold">Total</span>

                    <span className="font-serif text-2xl font-bold text-primary">
                      {formatPrice(selectedOrder.total)}
                    </span>
                  </div>
                </section>

                {/* Notas */}
                {selectedOrder.notes && (
                  <section>
                    <h3 className="mb-2 font-semibold">
                      Notas del pedido
                    </h3>

                    <p className="whitespace-pre-wrap rounded-xl border border-border/60 bg-secondary/20 p-4 text-sm leading-relaxed">
                      {selectedOrder.notes}
                    </p>
                  </section>
                )}

                {/* Estado dentro del diálogo */}
                <section className="flex flex-col gap-3 rounded-xl border border-border/60 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium">
                      Estado actual
                    </span>

                    <StatusBadge status={selectedOrder.status} />
                  </div>

                  <label
                    htmlFor="detail-order-status"
                    className="text-sm text-muted-foreground"
                  >
                    Cambiar estado
                  </label>

                  <select
                    id="detail-order-status"
                    value={selectedOrder.status}
                    disabled={
                      updatingOrderId === selectedOrder.id
                    }
                    onChange={(event) =>
                      void changeStatus(
                        selectedOrder,
                        event.target.value,
                      )
                    }
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                  >
                    {!STATUS_OPTIONS.some(
                      (status) => status === selectedOrder.status,
                    ) && (
                      <option value={selectedOrder.status}>
                        {selectedOrder.status}
                      </option>
                    )}

                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </section>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function StatCard({
  title,
  value,
  description,
  icon,
}: {
  title: string
  value: number
  description: string
  icon: ReactNode
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-muted-foreground">
          {title}
        </span>

        <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </span>
      </div>

      <p className="mt-4 font-serif text-3xl font-bold">
        {value}
      </p>

      <p className="mt-1 text-xs text-muted-foreground">
        {description}
      </p>
    </Card>
  )
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 text-primary">
        {icon}
      </span>

      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-medium">
          {value}
        </p>
      </div>
    </div>
  )
}