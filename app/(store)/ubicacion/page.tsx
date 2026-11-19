import {
  MapPin,
  Phone,
  Clock,
  Navigation,
  MessageCircle,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

// Información real de Pizza a la Brasa.
const ADDRESS =
  'Ejido el Mezquite 251, Zoquiapan, 56530, Ixtapaluca, Estado de México'

const LATITUDE = 19.3224576
const LONGITUDE = -98.8704803

const PHONE = '5626033861'
const PHONE_FORMATTED = '56 2603 3861'

const MAPS_QUERY = `${LATITUDE},${LONGITUDE}`

// Dirección del mapa integrado.
const MAPS_EMBED_URL =
  `https://maps.google.com/maps?hl=es&q=${MAPS_QUERY}&z=17&ie=UTF8&iwloc=B&output=embed`

// Destino exacto para obtener indicaciones.
const DIRECTIONS_URL =
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(MAPS_QUERY)}`

const WHATSAPP_URL =
  `https://wa.me/52${PHONE}`

export default function UbicacionPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12">

      {/* Encabezado */}
      <header className="mb-10">
        <span className="text-sm font-medium uppercase tracking-wider text-primary">
          Visítanos
        </span>

        <h1 className="mt-2 font-serif text-4xl font-bold md:text-5xl">
          Encuéntranos fácilmente
        </h1>

        <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
          Ven a disfrutar de nuestras pizzas artesanales en Pizza a la Brasa.
          Nos encontramos en Ixtapaluca, Estado de México.
          ¡Te esperamos!
        </p>
      </header>

      {/* Mapa y datos del establecimiento */}
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">

        {/* Mapa */}
        <section className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">

          <div className="border-b border-border/60 p-4">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-primary/15 text-primary">
                <MapPin className="size-5" />
              </span>

              <div>
                <h2 className="font-serif text-xl font-semibold">
                  Pizza a la Brasa
                </h2>

                <p className="text-sm text-muted-foreground">
                  Nuestra ubicación
                </p>
              </div>
            </div>
          </div>

                  <iframe
                  title="Mapa de ubicación de Pizza a la Brasa"
                  src={MAPS_EMBED_URL}
                  width="100%"
                  height="420"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                  />

          <div className="border-t border-border/60 p-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Utiliza el mapa para localizar nuestro establecimiento
              y consultar cómo llegar.
            </p>
          </div>
        </section>

        {/* Información */}
        <section className="flex flex-col gap-4">

          {/* Dirección */}
          <Card className="p-6">
            <div className="flex items-start gap-3">

              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                <MapPin className="size-5" />
              </span>

              <div>
                <h3 className="font-semibold">
                  Dirección
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {ADDRESS}
                </p>

                <a
                  href={DIRECTIONS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  <Navigation className="size-4" />
                  Cómo llegar
                </a>
              </div>
            </div>
          </Card>

          {/* Teléfono */}
          <Card className="p-6">
            <div className="flex items-start gap-3">

              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Phone className="size-5" />
              </span>

              <div>
                <h3 className="font-semibold">
                  Teléfono
                </h3>

                <a
                  href={`tel:+52${PHONE}`}
                  className="mt-2 block text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {PHONE_FORMATTED}
                </a>
              </div>
            </div>
          </Card>

          {/* Horarios */}
          <Card className="p-6">
            <div className="flex items-start gap-3">

              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Clock className="size-5" />
              </span>

              <div>
                <h3 className="font-semibold">
                  Horario de atención
                </h3>

                <div className="mt-3 space-y-3 text-sm text-muted-foreground">

                  <div>
                    <p className="font-medium text-foreground">
                      Lunes a viernes
                    </p>

                    <p>1:00 p. m. – 11:00 p. m.</p>
                  </div>

                  <div>
                    <p className="font-medium text-foreground">
                      Sábado y domingo
                    </p>

                    <p>12:00 p. m. – 12:00 a. m.</p>
                  </div>

                </div>
              </div>
            </div>
          </Card>

          {/* WhatsApp */}
          <Button
            size="lg"
            className="w-full"
            render={
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            <MessageCircle className="size-5" />
            Contactar por WhatsApp
          </Button>

          {/* Llamar */}
          <Button
            size="lg"
            variant="outline"
            className="w-full"
            render={
              <a href={`tel:+52${PHONE}`} />
            }
          >
            <Phone className="size-5" />
            Llamar a la pizzería
          </Button>

        </section>
      </div>

      {/* Información adicional */}
      <section className="mt-12 rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center">

        <h2 className="font-serif text-2xl font-bold">
          ¡Te esperamos en Pizza a la Brasa!
        </h2>

        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Disfruta nuestras pizzas artesanales, preparadas con ingredientes
          frescos y el sabor que nos caracteriza.
        </p>

        <Button
          className="mt-6"
          render={<a href="/menu" />}
        >
          Conocer nuestro menú
        </Button>

      </section>

    </main>
  )
}