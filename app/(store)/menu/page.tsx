'use client'

import { useEffect, useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ProductCard } from '@/components/site/product-card'
import { categoryLabels, type Category, type Product } from '@/lib/menu-data'
import { supabase } from '@/lib/supabase'

const categories: Category[] = ['pizzas', 'bebidas', 'postres']

export default function MenuPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function loadProducts() {
      setLoading(true)

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false })

      if (error) {
        setErrorMessage(error.message)
        setLoading(false)
        return
      }

      const formattedProducts: Product[] = (data || []).map((product: any) => ({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        category: product.category as Category,
        description: product.description ?? '',
        ingredients: Array.isArray(product.ingredients) ? product.ingredients : [],
        image: product.image ?? '/placeholder.svg',
        popular: Boolean(product.popular),
      }))

      setProducts(formattedProducts)
      setLoading(false)
    }

    loadProducts()
  }, [])

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <header className="mb-10 text-center">
        <span className="text-sm font-medium uppercase tracking-wider text-primary">
          Nuestro menú
        </span>
        <h1 className="mt-2 font-serif text-4xl font-bold md:text-5xl">
          Elige tu favorita
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Pizzas artesanales, bebidas refrescantes y postres para cerrar con broche de
          oro. Agrega lo que quieras a tu carrito.
        </p>
      </header>

      {loading && (
        <p className="text-center text-muted-foreground">
          Cargando productos...
        </p>
      )}

      {errorMessage && (
        <p className="mx-auto max-w-xl rounded-lg border border-red-500 p-4 text-center text-red-500">
          Error al cargar productos: {errorMessage}
        </p>
      )}

      {!loading && !errorMessage && (
        <Tabs defaultValue="pizzas" className="w-full">
          <TabsList className="mx-auto mb-8 flex w-fit">
            {categories.map((cat) => (
              <TabsTrigger key={cat} value={cat} className="px-5">
                {categoryLabels[cat]}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((cat) => {
            const productsByCategory = products.filter((p) => p.category === cat)

            return (
              <TabsContent key={cat} value={cat}>
                {productsByCategory.length === 0 ? (
                  <p className="text-center text-muted-foreground">
                    No hay productos disponibles en esta categoría.
                  </p>
                ) : (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {productsByCategory.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </TabsContent>
            )
          })}
        </Tabs>
      )}
    </div>
  )
}