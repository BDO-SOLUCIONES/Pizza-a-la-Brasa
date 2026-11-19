import Link from 'next/link'
import {
  CheckCircle2,
  ClipboardCheck,
  ArrowRight,
  Pizza,
  Clock,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function PedidoConfirmadoPage({
  params,
}: {
  params: Promise<{ folio: string }>
}) {
  const { folio } = await params
  const displayFolio = folio.toUpperCase()

  return (
    <main className="mx-auto flex min-h-[75vh] max-w-4xl items-center justify-center px-4 py-16">
      <Card className="w-full overflow-hidden border-border/60 p-0 shadow-xl">
        {/* Encabezado */}
        <div className="relative overflow-hidden border-b border-border/60 bg-gradient-to-br from-primary/10 via-card to-accent/10 px-6 py-12 text-center sm:px-12">
          <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full border border-primary/10" />

          <div className="relative mx-auto flex size-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="size-12" />
          </div>

          <Badge className="mt-6 border border-emerald-500/20 bg-emerald-500/10 text-emerald-600">
            Pedido registrado
          </Badge>

          <h1 className="mt-5 font-serif text-3xl font-bold sm:text-4xl">
            ¡Gracias por tu pedido!
          </h1>

          <p className="mx-auto mt-4 max-w-xl leading-relaxed text-muted-foreground">
            Tu pedido se guardó correctamente en el sistema de Pizza a la Brasa.
            Hemos registrado los datos de tu compra para que puedan revisarse
            desde nuestro panel de administración.
          </p>
        </div>

        {/* Folio */}
        <div className="flex flex-col gap-6 p-6 sm:p-10">
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ClipboardCheck className="size-6" />
            </div>

            <p className="mt-4 text-sm font-medium text-muted-foreground">
              Folio de tu pedido
            </p>

            <p className="mt-2 font-serif text-3xl font-bold tracking-widest text-primary sm:text-4xl">
              #{displayFolio}
            </p>

            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              Guarda este folio para identificar tu pedido.
            </p>
          </div>

          {/* Próximos pasos */}
          <section>
            <h2 className="font-serif text-xl font-semibold">
              ¿Qué sigue?
            </h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-xl border border-border/60 p-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Clock className="size-5" />
                </span>

                <div>
                  <h3 className="font-medium">
                    Revisión del pedido
                  </h3>

                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    El personal de la pizzería podrá consultar tu pedido
                    y actualizar su estado desde el sistema.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-border/60 p-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Pizza className="size-5" />
                </span>

                <div>
                  <h3 className="font-medium">
                    Preparamos tu pizza
                  </h3>

                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Una vez revisado, tu pedido podrá pasar a preparación
                    según la disponibilidad de la pizzería.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Aviso sobre WhatsApp */}
          <div className="rounded-xl border border-border/60 bg-secondary/30 p-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              <strong className="text-foreground">
                Sobre la confirmación por WhatsApp:
              </strong>{' '}
              estamos preparando este servicio. Por el momento, tu pedido
              ya quedó registrado y no necesitas repetir la compra.
            </p>
          </div>

          {/* Navegación */}
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button
              className="w-full sm:flex-1"
              render={<Link href="/menu" />}
            >
              Seguir viendo el menú
              <ArrowRight className="size-4" />
            </Button>

            <Button
              variant="outline"
              className="w-full sm:flex-1"
              render={<Link href="/" />}
            >
              Volver al inicio
            </Button>
          </div>
        </div>
      </Card>
    </main>
  )
}