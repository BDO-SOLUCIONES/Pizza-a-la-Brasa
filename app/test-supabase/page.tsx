'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Product = {
  id: string
  name: string
  price: number
  category: string
  description: string
  active: boolean
}

export default function TestSupabasePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function loadProducts() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)

      if (error) {
        setErrorMessage(error.message)
        return
      }

      setProducts(data || [])
    }

    loadProducts()
  }, [])

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="font-serif text-4xl font-bold">Prueba Supabase</h1>

      {errorMessage && (
        <p className="mt-4 rounded-lg border border-red-500 p-4 text-red-500">
          Error: {errorMessage}
        </p>
      )}

      <p className="mt-4 text-muted-foreground">
        Productos encontrados: {products.length}
      </p>

      <div className="mt-6 grid gap-4">
        {products.map((product) => (
          <div key={product.id} className="rounded-xl border p-4">
            <h2 className="text-xl font-semibold">{product.name}</h2>
            <p className="text-muted-foreground">{product.description}</p>
            <p className="mt-2 font-bold">${product.price}</p>
          </div>
        ))}
      </div>
    </div>
  )
}