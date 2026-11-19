'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ExternalLink,
  ImagePlus,
  Package,
  Pencil,
  Pizza,
  Plus,
  Power,
  Search,
  Star,
  Trash2,
} from 'lucide-react'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

type Category = 'pizzas' | 'bebidas' | 'postres'

type Product = {
  id: string
  name: string
  price: number
  category: Category
  description: string
  ingredients: string[]
  image: string
  popular: boolean
  active: boolean
  created_at?: string
}

const categoryLabels: Record<Category, string> = {
  pizzas: 'Pizzas',
  bebidas: 'Bebidas',
  postres: 'Postres',
}

const emptyForm = {
  name: '',
  price: '',
  category: 'pizzas' as Category,
  description: '',
  ingredients: '',
  image: '/images/pizza-margherita.png',
  popular: false,
}

export default function ProductosPage() {
  const supabase = createClient()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'all' | Category>('all')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const [form, setForm] = useState(emptyForm)

  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')

  async function loadProducts() {
    setLoading(true)

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error cargando productos:', error.message)
      toast.error('No se pudieron cargar los productos')
      setLoading(false)
      return
    }

    const formattedProducts: Product[] = (data ?? []).map((product: any) => ({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      category: product.category as Category,
      description: product.description ?? '',
      ingredients: Array.isArray(product.ingredients)
        ? product.ingredients.map(String)
        : [],
      image: product.image ?? '/placeholder.svg',
      popular: Boolean(product.popular),
      active: Boolean(product.active),
      created_at: product.created_at,
    }))

    setProducts(formattedProducts)
    setLoading(false)
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return products.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.description.toLowerCase().includes(normalizedSearch)

      const matchesCategory =
        categoryFilter === 'all' ||
        product.category === categoryFilter

      return matchesSearch && matchesCategory
    })
  }, [products, search, categoryFilter])

  const totalProducts = products.length
  const activeProducts = products.filter((product) => product.active).length
  const inactiveProducts = products.filter((product) => !product.active).length
  const pizzaProducts = products.filter(
    (product) => product.category === 'pizzas',
  ).length

  function openNewProduct() {
  setEditingProduct(null)
  setForm(emptyForm)
  setSelectedImageFile(null)
  setImagePreview(emptyForm.image)
  setDialogOpen(true)
}

  function openEditProduct(product: Product) {
    setEditingProduct(product)

    setForm({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      description: product.description,
      ingredients: product.ingredients.join(', '),
      image: product.image,
      popular: product.popular,
    })
    setSelectedImageFile(null)
    setImagePreview(product.image || '/placeholder.svg')

    setDialogOpen(true)
  }

  function closeDialog() {
  if (saving) return

  setDialogOpen(false)
  setEditingProduct(null)
  setForm(emptyForm)
  setSelectedImageFile(null)
  setImagePreview('')
}

  function handleImageSelect(file: File | undefined) {
  if (!file) return

  if (!file.type.startsWith('image/')) {
    toast.error('Selecciona solamente una imagen')
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    toast.error('La imagen no puede superar los 5 MB')
    return
  }

  setSelectedImageFile(file)
  setImagePreview(URL.createObjectURL(file))
}

  async function uploadProductImage(file: File) {
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'

  const fileName = `product-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${extension}`

  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      contentType: file.type,
      upsert: false,
    })

  if (error) {
    console.error('Error subiendo imagen:', error)
    throw new Error('No se pudo subir la imagen')
  }

  const { data: publicUrlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(data.path)

  return publicUrlData.publicUrl
}

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const name = form.name.trim()
    const price = Number(form.price)

    if (!name) {
      toast.error('Escribe el nombre del producto')
      return
    }

    if (!form.price || Number.isNaN(price) || price <= 0) {
      toast.error('Escribe un precio válido')
      return
    }

    setSaving(true)

    const ingredients = form.ingredients
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)

    let imageUrl = form.image.trim() || '/placeholder.svg'

try {
  if (selectedImageFile) {
    imageUrl = await uploadProductImage(selectedImageFile)
  }
} catch (error) {
  console.error(error)
  toast.error('No se pudo subir la imagen')
  setSaving(false)
  return
}

const productData = {
  name,
  price,
  category: form.category,
  description: form.description.trim(),
  ingredients,
  image: imageUrl,
  popular: form.popular,
}

    if (editingProduct) {
  const { data: userData, error: userError } = await supabase.auth.getUser()

  console.log('USUARIO ACTUAL:', userData.user?.id)
  console.log('ERROR USUARIO:', userError)

  if (!userData.user) {
    toast.error('La sesión del administrador no está disponible')
    setSaving(false)
    return
  }

  const { data, error } = await supabase
    .from('products')
    .update(productData)
    .eq('id', editingProduct.id)
    .select('id, name, price')
    .maybeSingle()

  console.log('RESULTADO UPDATE:', data)
  console.log('ERROR UPDATE:', error)

  if (error) {
    toast.error(`No se pudo actualizar: ${error.message}`)
    setSaving(false)
    return
  }

  if (!data) {
    toast.error(
      'Supabase no encontró una fila actualizable. Revisaremos la sesión/RLS.',
    )
    setSaving(false)
    return
  }

  toast.success('Producto actualizado correctamente')

    } else {
      const { error } = await supabase.from('products').insert({
        ...productData,
        active: true,
      })

      if (error) {
        console.error('Error creando producto:', error.message)
        toast.error('No se pudo crear el producto')
        setSaving(false)
        return
      }

      toast.success('Producto creado correctamente')
    }

    await loadProducts()

    setSaving(false)
    closeDialog()
  }

  async function toggleActive(product: Product) {
    const newActiveState = !product.active

    const { error } = await supabase
      .from('products')
      .update({ active: newActiveState })
      .eq('id', product.id)

    if (error) {
      console.error('Error cambiando estado:', error.message)
      toast.error('No se pudo cambiar el estado del producto')
      return
    }

    setProducts((current) =>
      current.map((item) =>
        item.id === product.id
          ? { ...item, active: newActiveState }
          : item,
      ),
    )

    toast.success(
      newActiveState
        ? `${product.name} está activo`
        : `${product.name} fue desactivado`,
    )
  }

  async function togglePopular(product: Product) {
    const newPopularState = !product.popular

    const { error } = await supabase
      .from('products')
      .update({ popular: newPopularState })
      .eq('id', product.id)

    if (error) {
      console.error('Error cambiando popularidad:', error.message)
      toast.error('No se pudo actualizar el producto')
      return
    }

    setProducts((current) =>
      current.map((item) =>
        item.id === product.id
          ? { ...item, popular: newPopularState }
          : item,
      ),
    )

    toast.success(
      newPopularState
        ? `${product.name} marcado como popular`
        : `${product.name} dejó de ser popular`,
    )
  }

  async function deleteProduct(product: Product) {
    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar "${product.name}"? Esta acción no se puede deshacer.`,
    )

    if (!confirmed) return

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', product.id)

    if (error) {
      console.error('Error eliminando producto:', error.message)
      toast.error(
        'No se pudo eliminar. Puedes desactivarlo en su lugar.',
      )
      return
    }

    setProducts((current) =>
      current.filter((item) => item.id !== product.id),
    )

    toast.success('Producto eliminado correctamente')
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Encabezado */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Package className="size-5" />
            </span>

            <div>
              <h1 className="font-serif text-3xl font-bold">
                Productos
              </h1>

              <p className="text-sm text-muted-foreground">
                Administra el menú de Pizza a la Brasa
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            render={<Link href="/menu" target="_blank" />}
          >
            <ExternalLink className="size-4" />
            Ver menú
          </Button>

          <Button onClick={openNewProduct}>
            <Plus className="size-4" />
            Nuevo producto
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total de productos"
          value={totalProducts}
          icon={<Package className="size-5" />}
          description="Productos registrados"
        />

        <StatCard
          title="Productos activos"
          value={activeProducts}
          icon={<Power className="size-5" />}
          description="Visibles en el menú"
        />

        <StatCard
          title="Pizzas"
          value={pizzaProducts}
          icon={<Pizza className="size-5" />}
          description="En la categoría pizzas"
        />

        <StatCard
          title="Inactivos"
          value={inactiveProducts}
          icon={<Power className="size-5" />}
          description="No visibles para clientes"
        />
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar producto..."
              className="pl-10"
            />
          </div>

          <Select
            value={categoryFilter}
            onValueChange={(value) =>
              setCategoryFilter(value as 'all' | Category)
            }
          >
            <SelectTrigger className="w-full lg:w-52">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              <SelectItem value="pizzas">Pizzas</SelectItem>
              <SelectItem value="bebidas">Bebidas</SelectItem>
              <SelectItem value="postres">Postres</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Productos */}
      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card
              key={index}
              className="overflow-hidden p-0"
            >
              <div className="aspect-[16/9] animate-pulse bg-secondary" />
              <div className="space-y-3 p-5">
                <div className="h-5 w-2/3 animate-pulse rounded bg-secondary" />
                <div className="h-4 w-1/3 animate-pulse rounded bg-secondary" />
                <div className="h-4 w-full animate-pulse rounded bg-secondary" />
                <div className="h-9 w-full animate-pulse rounded bg-secondary" />
              </div>
            </Card>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <Card className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-secondary">
            <Package className="size-7 text-muted-foreground" />
          </span>

          <h2 className="mt-4 font-serif text-xl font-semibold">
            No encontramos productos
          </h2>

          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Prueba con otro nombre o cambia el filtro de categoría.
          </p>

          <Button
            className="mt-5"
            variant="outline"
            onClick={() => {
              setSearch('')
              setCategoryFilter('all')
            }}
          >
            Limpiar filtros
          </Button>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="group overflow-hidden p-0 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
            >
              {/* Imagen */}
              <div className="relative aspect-[16/9] overflow-hidden bg-secondary">
                <img
                  src={product.image || '/placeholder.svg'}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
                  <Badge
                    variant={product.active ? 'default' : 'secondary'}
                  >
                    {product.active ? 'Activo' : 'Inactivo'}
                  </Badge>

                  {product.popular && (
                    <Badge className="gap-1 bg-accent text-accent-foreground">
                      <Star className="size-3 fill-current" />
                      Popular
                    </Badge>
                  )}
                </div>
              </div>

              {/* Información */}
              <div className="flex flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-serif text-xl font-semibold leading-tight">
                      {product.name}
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {categoryLabels[product.category]}
                    </p>
                  </div>

                  <span className="shrink-0 font-serif text-xl font-bold text-primary">
                    ${product.price.toFixed(2)}
                  </span>
                </div>

                {product.description && (
                  <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {product.description}
                  </p>
                )}

                {product.ingredients.length > 0 && (
                  <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground/80">
                    {product.ingredients.join(' · ')}
                  </p>
                )}

                {/* Acciones */}
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditProduct(product)}
                  >
                    <Pencil className="size-3.5" />
                    Editar
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleActive(product)}
                  >
                    <Power className="size-3.5" />
                    {product.active ? 'Desactivar' : 'Activar'}
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => togglePopular(product)}
                  >
                    <Star
                      className={`size-3.5 ${
                        product.popular ? 'fill-current text-primary' : ''
                      }`}
                    />
                    {product.popular ? 'Quitar popular' : 'Marcar popular'}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => deleteProduct(product)}
                  >
                    <Trash2 className="size-3.5" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Diálogo crear / editar */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeDialog()
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              {editingProduct ? 'Editar producto' : 'Nuevo producto'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-5 py-2">
              {/* Nombre */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="product-name">
                  Nombre del producto
                </Label>

                <Input
                  id="product-name"
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Ej. Pizza Pepperoni"
                  autoComplete="off"
                />
              </div>

              {/* Precio + categoría */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="product-price">
                    Precio (MXN)
                  </Label>

                  <Input
                    id="product-price"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.price}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        price: event.target.value,
                      }))
                    }
                    placeholder="189.00"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label>Categoría</Label>

                  <Select
                    value={form.category}
                    onValueChange={(value) =>
                      setForm((current) => ({
                        ...current,
                        category: value as Category,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="pizzas">Pizzas</SelectItem>
                      <SelectItem value="bebidas">Bebidas</SelectItem>
                      <SelectItem value="postres">Postres</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Descripción */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="product-description">
                  Descripción
                </Label>

                <Textarea
                  id="product-description"
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Describe brevemente el producto..."
                  rows={3}
                />
              </div>

              {/* Ingredientes */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="product-ingredients">
                  Ingredientes
                </Label>

                <Input
                  id="product-ingredients"
                  value={form.ingredients}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      ingredients: event.target.value,
                    }))
                  }
                  placeholder="Queso, pepperoni, salsa de tomate"
                />

                <p className="text-xs text-muted-foreground">
                  Escríbelos separados por comas.
                </p>
              </div>

              {/* Imagen */}
             <div className="flex flex-col gap-3">
               <Label>Imagen del producto</Label>

             <div className="overflow-hidden rounded-xl border border-border/60 bg-secondary">
              <div className="relative aspect-[16/7]">
                <img
                src={imagePreview || form.image || '/placeholder.svg'}
                alt="Vista previa del producto"
                className="h-full w-full object-cover"
                    />
                  </div>
                </div>

                <label
                  htmlFor="product-image-upload"
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border/70 px-4 py-6 text-sm font-medium transition-colors hover:bg-secondary"
                >
                  <ImagePlus className="size-5 text-primary" />

                  {selectedImageFile
                    ? selectedImageFile.name
                    : 'Seleccionar imagen desde tu computadora'}
                </label>

                <input
                  id="product-image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) =>
                    handleImageSelect(event.target.files?.[0])
                  }
                />

              <p className="text-xs text-muted-foreground">
              Formatos de imagen permitidos. Tamaño máximo: 5 MB.
              </p>
            </div>

              {/* Popular */}
              <button
                type="button"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    popular: !current.popular,
                  }))
                }
                className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-colors ${
                  form.popular
                    ? 'border-primary/40 bg-primary/10'
                    : 'border-border/60 hover:bg-secondary'
                }`}
              >
                <span
                  className={`flex size-10 items-center justify-center rounded-full ${
                    form.popular
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  <Star
                    className={`size-5 ${
                      form.popular ? 'fill-current' : ''
                    }`}
                  />
                </span>

                <span>
                  <span className="block font-medium">
                    Producto popular
                  </span>
                  <span className="block text-sm text-muted-foreground">
                    Se mostrará como producto destacado en el menú.
                  </span>
                </span>
              </button>
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={closeDialog}
                disabled={saving}
              >
                Cancelar
              </Button>

              <Button type="submit" disabled={saving}>
                {saving
                  ? 'Guardando...'
                  : editingProduct
                    ? 'Guardar cambios'
                    : 'Crear producto'}
              </Button>
            </DialogFooter>
          </form>
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
  icon: React.ReactNode
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