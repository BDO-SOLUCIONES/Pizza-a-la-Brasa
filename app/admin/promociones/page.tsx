'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Edit,
  ExternalLink,
  Plus,
  Search,
  Tag,
  Trash2,
  Power,
} from 'lucide-react'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

type Promo = {
  id: string
  title: string
  description: string
  badge: string
  price: number | null
  active: boolean
  created_at?: string
}

const emptyForm = {
  title: '',
  description: '',
  badge: '',
  price: '',
}

export default function PromocionesPage() {
  const supabase = createClient()

  const [promos, setPromos] = useState<Promo[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [search, setSearch] = useState('')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPromo, setEditingPromo] = useState<Promo | null>(null)

  const [form, setForm] = useState(emptyForm)

  async function loadPromos() {
    setLoading(true)

    const { data, error } = await supabase
      .from('promos')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error cargando promociones:', error.message)
      toast.error('No se pudieron cargar las promociones')
      setLoading(false)
      return
    }

    const formattedPromos: Promo[] = (data ?? []).map((promo: any) => ({
      id: promo.id,
      title: promo.title ?? '',
      description: promo.description ?? '',
      badge: promo.badge ?? '',
      price:
        promo.price === null || promo.price === undefined
          ? null
          : Number(promo.price),
      active: Boolean(promo.active),
      created_at: promo.created_at,
    }))

    setPromos(formattedPromos)
    setLoading(false)
  }

  useEffect(() => {
    loadPromos()
  }, [])

  const filteredPromos = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    if (!normalizedSearch) {
      return promos
    }

    return promos.filter(
      (promo) =>
        promo.title.toLowerCase().includes(normalizedSearch) ||
        promo.description.toLowerCase().includes(normalizedSearch) ||
        promo.badge.toLowerCase().includes(normalizedSearch),
    )
  }, [promos, search])

  const totalPromos = promos.length
  const activePromos = promos.filter((promo) => promo.active).length
  const inactivePromos = promos.filter((promo) => !promo.active).length

  function openNewPromo() {
    setEditingPromo(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEditPromo(promo: Promo) {
    setEditingPromo(promo)

    setForm({
      title: promo.title,
      description: promo.description,
      badge: promo.badge,
      price: promo.price !== null ? promo.price.toString() : '',
    })

    setDialogOpen(true)
  }

  function closeDialog() {
    if (saving) return

    setDialogOpen(false)
    setEditingPromo(null)
    setForm(emptyForm)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const title = form.title.trim()
    const description = form.description.trim()
    const badge = form.badge.trim()

    if (!title) {
      toast.error('Escribe un título para la promoción')
      return
    }

    if (!description) {
      toast.error('Escribe una descripción')
      return
    }

    if (!badge) {
      toast.error('Escribe el texto de la etiqueta')
      return
    }

    let price: number | null = null

    if (form.price.trim()) {
      const parsedPrice = Number(form.price)

      if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
        toast.error('Escribe un precio válido')
        return
      }

      price = parsedPrice
    }

    setSaving(true)

    const promoData = {
      title,
      description,
      badge,
      price,
    }

    if (editingPromo) {
      const { error } = await supabase
        .from('promos')
        .update(promoData)
        .eq('id', editingPromo.id)

      if (error) {
        console.error(
          'Error actualizando promoción:',
          error.message,
        )

        toast.error('No se pudo actualizar la promoción')
        setSaving(false)
        return
      }

      toast.success('Promoción actualizada correctamente')
    } else {
      const { error } = await supabase.from('promos').insert({
        ...promoData,
        active: true,
      })

      if (error) {
        console.error(
          'Error creando promoción:',
          error.message,
        )

        toast.error('No se pudo crear la promoción')
        setSaving(false)
        return
      }

      toast.success('Promoción creada correctamente')
    }

    await loadPromos()

    setSaving(false)
    closeDialog()
  }

  async function toggleActive(promo: Promo) {
    const newActiveState = !promo.active

    const { error } = await supabase
      .from('promos')
      .update({
        active: newActiveState,
      })
      .eq('id', promo.id)

    if (error) {
      console.error(
        'Error cambiando estado de promoción:',
        error.message,
      )

      toast.error('No se pudo cambiar el estado')
      return
    }

    setPromos((current) =>
      current.map((item) =>
        item.id === promo.id
          ? {
              ...item,
              active: newActiveState,
            }
          : item,
      ),
    )

    toast.success(
      newActiveState
        ? 'Promoción activada'
        : 'Promoción desactivada',
    )
  }

  async function deletePromo(promo: Promo) {
    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar "${promo.title}"? Esta acción no se puede deshacer.`,
    )

    if (!confirmed) return

    const { error } = await supabase
      .from('promos')
      .delete()
      .eq('id', promo.id)

    if (error) {
      console.error(
        'Error eliminando promoción:',
        error.message,
      )

      toast.error('No se pudo eliminar la promoción')
      return
    }

    setPromos((current) =>
      current.filter((item) => item.id !== promo.id),
    )

    toast.success('Promoción eliminada correctamente')
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Encabezado */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Tag className="size-5" />
          </span>

          <div>
            <h1 className="font-serif text-3xl font-bold">
              Promociones
            </h1>

            <p className="text-sm text-muted-foreground">
              Administra las ofertas de Pizza a la Brasa
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            render={<Link href="/promos" target="_blank" />}
          >
            <ExternalLink className="size-4" />
            Ver promociones
          </Button>

          <Button onClick={openNewPromo}>
            <Plus className="size-4" />
            Nueva promoción
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Total"
          value={totalPromos}
          description="Promociones registradas"
          icon={<Tag className="size-5" />}
        />

        <StatCard
          title="Activas"
          value={activePromos}
          description="Visibles para clientes"
          icon={<Power className="size-5" />}
        />

        <StatCard
          title="Inactivas"
          value={inactivePromos}
          description="Promociones desactivadas"
          icon={<Power className="size-5" />}
        />
      </div>

      {/* Buscador */}
      <Card className="p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar promoción..."
            className="pl-10"
          />
        </div>
      </Card>

      {/* Contenido */}
      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card
              key={index}
              className="h-64 animate-pulse bg-secondary/40"
            />
          ))}
        </div>
      ) : filteredPromos.length === 0 ? (
        <Card className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-secondary">
            <Tag className="size-7 text-muted-foreground" />
          </span>

          <h2 className="mt-4 font-serif text-xl font-semibold">
            No encontramos promociones
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Prueba con otro término de búsqueda o crea una nueva promoción.
          </p>

          <Button
            className="mt-5"
            variant="outline"
            onClick={() => setSearch('')}
          >
            Limpiar búsqueda
          </Button>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredPromos.map((promo) => (
            <Card
              key={promo.id}
              className="group flex flex-col overflow-hidden border-primary/20 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
            >
              <div className="flex items-center justify-between border-b border-border/60 p-5">
                <Badge
                  variant={promo.active ? 'default' : 'secondary'}
                >
                  {promo.active ? 'Activa' : 'Inactiva'}
                </Badge>

                {promo.badge && (
                  <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">
                    {promo.badge}
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col gap-4 p-5">
                <div>
                  <h2 className="font-serif text-2xl font-semibold">
                    {promo.title}
                  </h2>

                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {promo.description}
                  </p>
                </div>

                {promo.price !== null && (
                  <div>
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">
                      Precio especial
                    </span>

                    <p className="mt-1 font-serif text-3xl font-bold text-primary">
                      ${promo.price.toFixed(2)}
                    </p>
                  </div>
                )}

                <div className="mt-auto grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditPromo(promo)}
                  >
                    <Edit className="size-3.5" />
                    Editar
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleActive(promo)}
                  >
                    <Power className="size-3.5" />
                    {promo.active ? 'Desactivar' : 'Activar'}
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => deletePromo(promo)}
                >
                  <Trash2 className="size-3.5" />
                  Eliminar promoción
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Crear / editar */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeDialog()
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              {editingPromo
                ? 'Editar promoción'
                : 'Nueva promoción'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-5 py-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="promo-title">
                  Título
                </Label>

                <Input
                  id="promo-title"
                  value={form.title}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  placeholder="2 pizzas por precio especial"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="promo-description">
                  Descripción
                </Label>

                <Textarea
                  id="promo-description"
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Describe qué incluye la promoción..."
                  rows={4}
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="promo-badge">
                    Etiqueta
                  </Label>

                  <Input
                    id="promo-badge"
                    value={form.badge}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        badge: event.target.value,
                      }))
                    }
                    placeholder="20% OFF"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="promo-price">
                    Precio especial
                  </Label>

                  <Input
                    id="promo-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        price: event.target.value,
                      }))
                    }
                    placeholder="299"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-border/60 bg-secondary/40 p-4">
                <p className="text-sm font-medium">
                  Vista rápida
                </p>

                <div className="mt-4 rounded-xl border border-primary/20 bg-background p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex size-10 items-center justify-center rounded-full bg-accent/15 text-accent">
                      <Tag className="size-5" />
                    </span>

                    {form.badge && (
                      <Badge className="bg-accent text-accent-foreground">
                        {form.badge}
                      </Badge>
                    )}
                  </div>

                  <h3 className="mt-4 font-serif text-xl font-semibold">
                    {form.title || 'Nombre de la promoción'}
                  </h3>

                  <p className="mt-2 text-sm text-muted-foreground">
                    {form.description ||
                      'Aquí aparecerá la descripción de la promoción.'}
                  </p>

                  {form.price && !Number.isNaN(Number(form.price)) && (
                    <p className="mt-4 font-serif text-2xl font-bold text-primary">
                      ${Number(form.price).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
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
                  : editingPromo
                    ? 'Guardar cambios'
                    : 'Crear promoción'}
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