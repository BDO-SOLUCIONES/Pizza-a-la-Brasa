import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Phone, Clock } from 'lucide-react'

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border/60 bg-card/40">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo-pizzeria.jpeg"
              alt="Logo Pizza a la Brasa"
              width={50}
              height={50}
              className="rounded-full object-cover"
              />
            <span className="font-serif text-xl font-semibold">Pizza a la Brasa</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Pizzas artesanales horneadas a la leña con ingredientes frescos y mucha
            tradición italiana.
          </p>
        </div>

        <div>
          <h4 className="mb-3 font-medium">Navegación</h4>
          <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
            <li><Link href="/" className="hover:text-primary">Inicio</Link></li>
            <li><Link href="/menu" className="hover:text-primary">Menú</Link></li>
            <li><Link href="/promos" className="hover:text-primary">Promociones</Link></li>
            <li><Link href="/ubicacion" className="hover:text-primary">Ubicación</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-medium">Contacto</h4>
          <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
  <MapPin className="mt-1 size-4 shrink-0 text-primary" />

  <a
    href="https://www.google.com/maps/search/?api=1&query=19.3224576%2C-98.8704803"
    target="_blank"
    rel="noopener noreferrer"
    className="transition-colors hover:text-primary"
  >
    Ejido el Mezquite 251, Zoquiapan, 56530 Ixtapaluca, Estado de México
  </a>
</li>

<li className="flex items-center gap-2">
  <Phone className="size-4 shrink-0 text-primary" />

  <a
    href="tel:+525626033861"
    className="transition-colors hover:text-primary"
  >
    56 2603 3861
  </a>
</li>

<li className="flex items-center gap-2">
  <Phone className="size-4 shrink-0 text-primary" />

  <a
    href="https://wa.me/525626033861"
    target="_blank"
    rel="noopener noreferrer"
    className="transition-colors hover:text-primary"
  >
    Contactar por WhatsApp
                </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-medium">Horario</h4>
          <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Clock className="size-4 text-primary" /> Lun - Vie: 1pm - 11pm
            </li>
            <li className="flex items-center gap-2">
              <Clock className="size-4 text-primary" /> Sáb - Dom: 12pm - 12am
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Pizza a la Brasa. Nombre - todos los derechos reservados.
      </div>
    </footer>
  )
}
