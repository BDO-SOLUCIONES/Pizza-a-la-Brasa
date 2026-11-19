import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  ShoppingCart,
  CircleDollarSign,
  Clock3,
  CookingPot,
  Pizza,
  ArrowUpRight,
  PackageCheck,
} from 'lucide-react'
import { DashboardAutoRefresh } from '@/components/admin/dashboard-auto-refresh'

type DashboardOrder = {
  id: string
  customer_name: string | null
  total: number | string
  status: string | null
  created_at: string
}

type KitchenItem = {
  order_id: string
  name: string
  quantity: number
}

const ACTIVE_STATUS = [
  'Pendiente',
  'pendiente',
  'En preparación',
  'en preparación',
  'En Preparación',
  'en_preparacion',
  'Listo',
  'listo',
  'En Horno',
  'en horno',
]

const PENDING_STATUS = [
  'Pendiente',
  'pendiente',
]

const PREPARATION_STATUS = [
  'En preparación',
  'en preparación',
  'En Preparación',
  'en_preparacion',
]

function getMexicoDateKey(value: string | Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(value))

  const year = parts.find((part) => part.type === 'year')?.value
  const month = parts.find((part) => part.type === 'month')?.value
  const day = parts.find((part) => part.type === 'day')?.value

  return `${year}-${month}-${day}`
}

function getLastSevenDays() {
  const todayKey = getMexicoDateKey(new Date())
  const [year, month, day] = todayKey.split('-').map(Number)

  const today = new Date(Date.UTC(year, month - 1, day))

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today)

    date.setUTCDate(today.getUTCDate() - (6 - index))

    return date.toISOString().slice(0, 10)
  })
}

function formatPrice(value: number | string) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0))
}

function formatCompactPrice(value: number) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

function formatDay(dateKey: string) {
  return new Date(`${dateKey}T12:00:00Z`)
    .toLocaleDateString('es-MX', {
      weekday: 'short',
      day: '2-digit',
      timeZone: 'UTC',
    })
    .replace('.', '')
}

function normalizeStatus(status: string | null | undefined) {
  return (status ?? '')
    .trim()
    .toLocaleLowerCase('es-MX')
}

function isCancelled(status: string | null | undefined) {
  const normalized = normalizeStatus(status)

  return [
    'cancelado',
    'cancelada',
    'cancelled',
    'canceled',
  ].includes(normalized)
}

function getStatusLabel(status: string | null | undefined) {
  const normalized = normalizeStatus(status)

  const labels: Record<string, string> = {
    pendiente: 'Pendiente',
    'en preparación': 'En preparación',
    'en preparacion': 'En preparación',
    en_preparacion: 'En preparación',
    'en horno': 'En horno',
    listo: 'Listo',
    entregado: 'Entregado',
    cancelado: 'Cancelado',
    cancelada: 'Cancelado',
  }

  return labels[normalized] ?? status ?? 'Sin estado'
}

function getStatusStyle(status: string | null | undefined) {
  const normalized = normalizeStatus(status)

  if (normalized === 'listo') {
    return 'border-blue-500/30 bg-blue-500/10 text-blue-700'
  }

  if (normalized === 'entregado') {
    return 'border-green-500/30 bg-green-500/10 text-green-700'
  }

  if (normalized === 'cancelado' || normalized === 'cancelada') {
    return 'border-red-500/30 bg-red-500/10 text-red-700'
  }

  if (
    normalized === 'en preparación' ||
    normalized === 'en preparacion' ||
    normalized === 'en_preparacion' ||
    normalized === 'en horno'
  ) {
    return 'border-orange-500/30 bg-orange-500/10 text-orange-700'
  }

  return 'border-yellow-500/30 bg-yellow-500/10 text-yellow-800'
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const dateKeys = getLastSevenDays()
  const todayKey = dateKeys[6]

  // En Ciudad de México, la medianoche corresponde a las 06:00 UTC.
  const startOfPeriod = new Date(
    `${dateKeys[0]}T00:00:00-06:00`,
  ).toISOString()

  // Consultar los indicadores y pedidos reales.
  const [
    { count: productosActivos, error: productosError },
    {
      data: pedidosSemanaData,
      error: pedidosSemanaError,
    },
    {
      count: pedidosPendientes,
      error: pedidosPendientesError,
    },
    {
      count: pedidosPreparacion,
      error: pedidosPreparacionError,
    },
    {
      data: pedidosCocinaData,
      error: pedidosCocinaError,
    },
  ] = await Promise.all([
    supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('active', true),

    supabase
      .from('orders')
      .select('id, customer_name, total, status, created_at')
      .gte('created_at', startOfPeriod)
      .order('created_at', { ascending: false })
      .limit(1000),

    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .in('status', PENDING_STATUS),

    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .in('status', PREPARATION_STATUS),

    supabase
      .from('orders')
      .select('id, customer_name, total, status, created_at')
      .in('status', ACTIVE_STATUS)
      .order('created_at', { ascending: true })
      .limit(8),
  ])

  const pedidosSemana = (pedidosSemanaData ?? []) as DashboardOrder[]
  const pedidosCocina = (pedidosCocinaData ?? []) as DashboardOrder[]

  // Calcular los pedidos y su importe del día actual.
  const pedidosHoy = pedidosSemana.filter(
    (pedido) => getMexicoDateKey(pedido.created_at) === todayKey,
  )

  const importeHoy = pedidosHoy
    .filter((pedido) => !isCancelled(pedido.status))
    .reduce((total, pedido) => total + Number(pedido.total ?? 0), 0)

  // Preparar los importes de cada uno de los últimos siete días.
  const importePorDia: Record<string, number> = {}

  for (const dateKey of dateKeys) {
    importePorDia[dateKey] = 0
  }

  for (const pedido of pedidosSemana) {
    if (isCancelled(pedido.status)) continue

    const dateKey = getMexicoDateKey(pedido.created_at)

    if (dateKey in importePorDia) {
      importePorDia[dateKey] += Number(pedido.total ?? 0)
    }
  }

  const importeMaximo = Math.max(
    1,
    ...dateKeys.map((dateKey) => importePorDia[dateKey]),
  )

  // Obtener los productos correspondientes a los pedidos de cocina.
  let productosCocina: KitchenItem[] = []
  let errorProductosCocina: string | null = null

  if (pedidosCocina.length > 0) {
    const idsPedidos = pedidosCocina.map((pedido) => pedido.id)

    const {
      data: itemsData,
      error: itemsError,
    } = await supabase
      .from('order_items')
      .select('order_id, name, quantity')
      .in('order_id', idsPedidos)

    if (itemsError) {
      errorProductosCocina = itemsError.message
    } else {
      productosCocina = (itemsData ?? []) as KitchenItem[]
    }
  }

  const itemsPorPedido: Record<string, KitchenItem[]> = {}

  for (const item of productosCocina) {
    if (!itemsPorPedido[item.order_id]) {
      itemsPorPedido[item.order_id] = []
    }

    itemsPorPedido[item.order_id].push(item)
  }

  const errores = [
    productosError?.message,
    pedidosSemanaError?.message,
    pedidosPendientesError?.message,
    pedidosPreparacionError?.message,
    pedidosCocinaError?.message,
    errorProductosCocina,
  ].filter(Boolean)

  return (
    <main className="min-h-screen bg-slate-50 p-5 md:p-8">
      {/* Encabezado */}
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-orange-700">
            Panel de administración
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Resumen
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Consulta la actividad y los pedidos de Pizza a la Brasa.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
          <p className="text-xs text-slate-500">
            Productos activos
          </p>

          <p className="mt-1 text-xl font-bold text-slate-900">
            {productosActivos ?? 0}
          </p>
        </div>
      </header>

              <div className="mb-5 flex justify-end">
            <DashboardAutoRefresh />
          </div>

      {/* Avisos si alguna consulta falla */}
      {errores.length > 0 && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          No se pudo cargar toda la información del resumen.
          Revisa los permisos de Supabase y los mensajes de la terminal.

          <ul className="mt-2 list-inside list-disc">
            {errores.map((error, index) => (
              <li key={`${error}-${index}`}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Indicadores */}
      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 border-l-4 border-l-orange-500 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-600">
              Pedidos de hoy
            </p>

            <span className="flex size-11 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
              <ShoppingCart className="size-5" />
            </span>
          </div>

          <p className="mt-5 text-3xl font-bold text-slate-900">
            {pedidosHoy.length}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Pedidos registrados durante el día.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 border-l-4 border-l-emerald-500 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-600">
              Importe de hoy
            </p>

            <span className="flex size-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <CircleDollarSign className="size-5" />
            </span>
          </div>

          <p className="mt-5 text-3xl font-bold text-slate-900">
            {formatPrice(importeHoy)}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Excluye pedidos cancelados; no confirma pagos.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 border-l-4 border-l-amber-500 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-600">
              Pendientes
            </p>

            <span className="flex size-11 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Clock3 className="size-5" />
            </span>
          </div>

          <p className="mt-5 text-3xl font-bold text-slate-900">
            {pedidosPendientes ?? 0}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Pedidos que requieren atención.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 border-l-4 border-l-blue-500 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-600">
              En preparación
            </p>

            <span className="flex size-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <CookingPot className="size-5" />
            </span>
          </div>

          <p className="mt-5 text-3xl font-bold text-slate-900">
            {pedidosPreparacion ?? 0}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Pedidos en los que trabaja la cocina.
          </p>
        </div>
      </section>

      {/* Gráfica y monitor de cocina */}
      <section className="mt-8 grid items-start gap-6 xl:grid-cols-5">

        {/* Gráfica de siete días */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6 xl:col-span-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Actividad de pedidos
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Importe diario durante los últimos siete días.
              </p>
            </div>

            <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-800">
              Últimos 7 días
            </span>
          </div>

          <div className="mt-7 grid h-64 grid-cols-7 gap-2 border-b border-slate-200 px-1 pb-2 sm:gap-4">
            {dateKeys.map((dateKey) => {
              const importe = importePorDia[dateKey]

              const altura =
                importe > 0
                  ? Math.max(5, (importe / importeMaximo) * 100)
                  : 0

              return (
                <div
                  key={dateKey}
                  className="flex min-w-0 flex-col items-center justify-end gap-2"
                >
                  <span
                    className="w-full truncate text-center text-[10px] text-slate-600 sm:text-xs"
                    title={formatPrice(importe)}
                  >
                    {importe > 0 ? formatCompactPrice(importe) : '$0'}
                  </span>

                  <div className="flex h-full w-full items-end justify-center">
                    <div
                      title={`${formatDay(dateKey)}: ${formatPrice(importe)}`}
                      className="w-full max-w-12 rounded-t-lg bg-orange-500 transition-all hover:bg-orange-600"
                      style={{ height: `${altura}%` }}
                    />
                  </div>

                  <span className="text-center text-[10px] capitalize text-slate-600 sm:text-xs">
                    {formatDay(dateKey)}
                  </span>
                </div>
              )
            })}
          </div>

          <p className="mt-4 text-xs leading-relaxed text-slate-500">
            Se consideran pedidos registrados, excluyendo los cancelados.
            Los importes no representan pagos confirmados.
          </p>
        </div>

        {/* Monitor de cocina */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6 xl:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Monitor de cocina
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Pedidos que requieren seguimiento.
              </p>
            </div>

            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
              <Pizza className="size-5" />
            </span>
          </div>

          {pedidosCocina.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center">
              <PackageCheck className="mx-auto size-9 text-slate-400" />

              <p className="mt-3 font-medium text-slate-800">
                No hay pedidos activos.
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Los nuevos pedidos aparecerán aquí.
              </p>
            </div>
          ) : (
            <div className="mt-5 flex flex-col gap-3">
              {pedidosCocina.map((pedido) => {
                const items = itemsPorPedido[pedido.id] ?? []

                return (
                  <article
                    key={pedido.id}
                    className="rounded-xl border border-slate-200 p-4 transition-colors hover:border-orange-300"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold tracking-wide text-orange-700">
                          FOLIO #{pedido.id.slice(0, 8).toUpperCase()}
                        </p>

                        <p className="mt-1 break-words font-semibold text-slate-900">
                          {pedido.customer_name || 'Cliente'}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-semibold sm:text-xs ${getStatusStyle(pedido.status)}`}
                      >
                        {getStatusLabel(pedido.status)}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1">
                      {items.length > 0 ? (
                        items.map((item, index) => (
                          <p
                            key={`${pedido.id}-${item.name}-${index}`}
                            className="text-sm text-slate-600"
                          >
                            {item.quantity} × {item.name}
                          </p>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500">
                          {pedidosCocinaError
                            ? 'No se pudieron cargar los detalles.'
                            : 'Sin detalles de productos.'}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                      <span className="font-semibold text-slate-900">
                        {formatPrice(pedido.total)}
                      </span>

                      <span className="text-xs text-slate-500">
                        {new Date(pedido.created_at).toLocaleTimeString(
                          'es-MX',
                          {
                            hour: '2-digit',
                            minute: '2-digit',
                            timeZone: 'America/Mexico_City',
                          },
                        )}
                      </span>
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          <Link
            href="/admin/pedidos"
            className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-700"
          >
            Ver todos los pedidos
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </section>

      {/* Pie del resumen */}
      <footer className="mt-8 text-center text-xs text-slate-500">
        La información se consulta desde Supabase. Actualiza la página para
        consultar los datos más recientes.
      </footer>
    </main>
  )
}