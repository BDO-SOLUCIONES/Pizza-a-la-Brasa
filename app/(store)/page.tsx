import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Flame, Leaf, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/site/product-card'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()

  // Consultar las pizzas activas directamente desde Supabase.
  const { data: productos, error } = await supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .eq('category', 'pizzas')
    .order('popular', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(3)

  if (error) {
    console.error(
      'Error al cargar las pizzas destacadas:',
      error.message,
    )
  }

  const destacadas = productos ?? []

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-pizza.png"
            alt="Pizza artesanal recién horneada"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-transparent" />
        </div>

        <div className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-center px-4 py-20">
          <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-primary/40 bg-background/40 px-4 py-1.5 text-sm text-primary backdrop-blur">
            <Flame className="size-4" /> Horneada a la leña
          </span>
          <h1 className="max-w-2xl text-balance font-serif text-5xl font-bold leading-[1.05] md:text-7xl">
            El arte de la pizza, en cada rebanada
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
            En Pizza a la Brasa combinamos masa fermentada lentamente, ingredientes frescos y
            el sabor inconfundible del horno de leña. Tradición italiana hecha para
            compartir.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" render={<Link href="/menu" />}>
              Ver el menú <ArrowRight className="size-4" />
            </Button>
            <Button size="lg" variant="outline" render={<Link href="/envios" />}>
              Pedir ahora
            </Button>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Flame,
              title: 'Horno de leña',
              text: 'Cada pizza se hornea a alta temperatura para una corteza perfecta.',
            },
            {
              icon: Leaf,
              title: 'Ingredientes frescos',
              text: 'Seleccionamos productos locales y de la mejor calidad cada día.',
            },
            {
              icon: Clock,
              title: 'Entrega rápida',
              text: 'A domicilio o para recoger, siempre calientita y a tiempo.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-border/60 bg-card p-6"
            >
              <span className="flex size-11 items-center justify-center rounded-full bg-primary/15 text-primary">
                <item.icon className="size-5" />
              </span>
              <h3 className="mt-4 font-serif text-xl font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Introducción con imagen */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
            <Image
              src="/images/pizzeria-interior.png"
              alt="Interior de la pizzería Pizza a la Brasa"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div>
            <span className="text-sm font-medium uppercase tracking-wider text-primary">
              Nuestra historia
            </span>
            <h2 className="mt-3 text-balance font-serif text-4xl font-bold">
              Una pizzería con alma italiana
            </h2>
            <p className="mt-5 leading-relaxed text-muted-foreground">
              Nacimos del amor por la cocina italiana auténtica. Nuestra masa reposa más
              de 48 horas para lograr una textura ligera y un sabor único. Cada receta es
              un homenaje a la tradición, preparada con dedicación artesanal.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Te invitamos a vivir la experiencia en Pizza a la Braza, ya sea en nuestro acogedor
              local o en la comodidad de tu hogar.
            </p>
            <Button variant="outline" className="mt-6" render={<Link href="/ubicacion" />}>
              Visítanos
            </Button>
          </div>
        </div>
      </section>

      {/* Destacadas */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <span className="text-sm font-medium uppercase tracking-wider text-primary">
              Las favoritas
            </span>
            <h2 className="mt-2 font-serif text-4xl font-bold">Nuestras pizzas estrella</h2>
          </div>
          <Button
            variant="ghost"
            className="hidden md:inline-flex"
            render={<Link href="/menu" />}
          >
            Ver todo <ArrowRight className="size-4" />
          </Button>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {destacadas.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </>
  )
}
