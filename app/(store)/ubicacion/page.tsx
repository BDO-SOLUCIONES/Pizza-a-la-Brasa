import { MapPin, Phone, Clock, Navigation } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const ADDRESS = 'Av. Italia 123, Centro, Ciudad'
const MAPS_QUERY = encodeURIComponent(ADDRESS)

export default function UbicacionPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <header className="mb-10">
        <span className="text-sm font-medium uppercase tracking-wider text-primary">
          Visítanos
        </span>
        <h1 className="mt-2 font-serif text-4xl font-bold md:text-5xl">
          Dónde encontrarnos
        </h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Estamos en el corazón de la ciudad. Ven por tu pizza o disfrútala en nuestro
          local.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="overflow-hidden rounded-2xl border border-border/60">
          <iframe
            title="Ubicación de Bella Pizza"
            src={`https://www.google.com/maps?q=${MAPS_QUERY}&output=embed`}
            className="h-[420px] w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <div className="flex flex-col gap-4">
          <Card className="p-6">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                <MapPin className="size-5" />
              </span>
              <div>
                <h3 className="font-medium">Dirección</h3>
                <p className="mt-1 text-sm text-muted-foreground">{ADDRESS}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Phone className="size-5" />
              </span>
              <div>
                <h3 className="font-medium">Teléfono</h3>
                <p className="mt-1 text-sm text-muted-foreground">55 1234 5678</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Clock className="size-5" />
              </span>
              <div>
                <h3 className="font-medium">Horario</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Lun - Vie: 1pm - 11pm
                  <br />
                  Sáb - Dom: 12pm - 12am
                </p>
              </div>
            </div>
          </Card>

          <Button
            size="lg"
            render={
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${MAPS_QUERY}`}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            <Navigation className="size-4" /> Cómo llegar
          </Button>
        </div>
      </div>
    </div>
  )
}
