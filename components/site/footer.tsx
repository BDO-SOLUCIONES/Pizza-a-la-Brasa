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
            <li className="flex items-center gap-2">
              <MapPin className="size-4 text-primary" /> Av. Italia 123, Centro
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-4 text-primary" /> 55 1234 5678
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
