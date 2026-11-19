export type Category = 'pizzas' | 'bebidas' | 'postres'

export type Product = {
  id: string
  name: string
  description: string
  ingredients: string[]
  price: number
  image: string
  category: Category
  popular?: boolean
}

export type Promo = {
  id: string
  title: string
  description: string
  badge: string
  price?: number
  active: boolean
}

export const products: Product[] = [
  {
    id: 'margherita',
    name: 'Margherita',
    description: 'La clásica italiana, simple y perfecta.',
    ingredients: ['Salsa de tomate', 'Mozzarella fresca', 'Albahaca', 'Aceite de oliva'],
    price: 149,
    image: '/images/pizza-margherita.png',
    category: 'pizzas',
    popular: true,
  },
  {
    id: 'pepperoni',
    name: 'Pepperoni',
    description: 'Generosa capa de pepperoni crujiente.',
    ingredients: ['Salsa de tomate', 'Mozzarella', 'Pepperoni'],
    price: 179,
    image: '/images/pizza-pepperoni.png',
    category: 'pizzas',
    popular: true,
  },
  {
    id: 'cuatro-quesos',
    name: 'Cuatro Quesos',
    description: 'Mezcla cremosa de quesos seleccionados.',
    ingredients: ['Mozzarella', 'Gorgonzola', 'Parmesano', 'Provolone'],
    price: 199,
    image: '/images/pizza-cuatro-quesos.png',
    category: 'pizzas',
  },
  {
    id: 'vegetariana',
    name: 'Vegetariana',
    description: 'Fresca y colorida con vegetales de temporada.',
    ingredients: ['Salsa de tomate', 'Mozzarella', 'Pimientos', 'Champiñones', 'Cebolla', 'Aceitunas'],
    price: 175,
    image: '/images/pizza-vegetariana.png',
    category: 'pizzas',
  },
  {
    id: 'suprema',
    name: 'Suprema',
    description: 'Para los amantes de la carne, abundante y sabrosa.',
    ingredients: ['Salsa de tomate', 'Mozzarella', 'Salchicha', 'Jamón', 'Tocino', 'Pimientos'],
    price: 219,
    image: '/images/pizza-suprema.png',
    category: 'pizzas',
    popular: true,
  },
  {
    id: 'refresco',
    name: 'Refresco Artesanal',
    description: 'Bebida fría de la casa, 355 ml.',
    ingredients: ['Cola', 'Naranja', 'Limón', 'Toronja'],
    price: 35,
    image: '/images/bebida-refresco.png',
    category: 'bebidas',
  },
  {
    id: 'tiramisu',
    name: 'Tiramisú',
    description: 'Postre italiano clásico con cacao y café.',
    ingredients: ['Mascarpone', 'Café', 'Cacao', 'Bizcocho'],
    price: 79,
    image: '/images/postre-tiramisu.png',
    category: 'postres',
  },
]

export const promos: Promo[] = [
  {
    id: 'martes-2x1',
    title: 'Martes 2x1 en Pizzas',
    description: 'Lleva dos pizzas medianas al precio de una todos los martes.',
    badge: 'Cada martes',
    active: true,
  },
  {
    id: 'combo-familiar',
    title: 'Combo Familiar',
    description: 'Pizza grande + 4 refrescos + tiramisú para compartir.',
    badge: 'Ahorra 20%',
    price: 349,
    active: true,
  },
  {
    id: 'happy-hour',
    title: 'Happy Hour 6-8 pm',
    description: 'Segunda pizza a mitad de precio de lunes a jueves.',
    badge: '50% OFF',
    active: true,
  },
]

export const categoryLabels: Record<Category, string> = {
  pizzas: 'Pizzas',
  bebidas: 'Bebidas',
  postres: 'Postres',
}

export function formatPrice(value: number) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
  }).format(value)
}
