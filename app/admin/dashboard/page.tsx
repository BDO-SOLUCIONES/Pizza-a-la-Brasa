import { createClient } from '@supabase/supabase-js' //[cite: 2]
import { LayoutDashboard, Pizza, ShoppingCart } from 'lucide-react' //[cite: 2]

// Conexión a tu base de datos
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL! //[cite: 1]
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY! //[cite: 1]
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function DashboardPage() {
  // Lógica de negocio (separada de la vista)
  // const { data: pedidos } = await supabase.from('pedidos').select('*')

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard - Pizza a la Brasa</h1>
      </header>

      {/* Tarjetas de Resumen (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm flex items-center space-x-4 border-l-4 border-orange-500">
          <ShoppingCart className="text-orange-500 w-8 h-8" />
          <div>
            <p className="text-gray-500 text-sm">Pedidos de Hoy</p>
            <p className="text-2xl font-bold">24</p>
          </div>
        </div>
        {/* Aquí podemos agregar tarjetas para Ganancias y Clientes */}
      </div>

      {/* Sección Principal: Gráfica y Tabla de Control */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Espacio para la Gráfica Estadística Estática */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Métricas de Ventas</h2>
          <div className="h-64 bg-gray-50 border border-gray-200 rounded flex items-center justify-center">
            <span className="text-gray-400">[Aquí integraremos la gráfica estática sin saltos]</span>
          </div>
        </div>

        {/* Panel de Controles Rápidos y Estados */}
        <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Monitor de Cocina</h2>
            <button className="text-sm text-red-500 hover:text-red-700 transition-colors">Limpiar tabla</button>
          </div>
          <ul className="space-y-4 flex-grow">
            <li className="flex justify-between items-center bg-gray-50 p-3 rounded">
              <div className="flex items-center gap-2">
                <Pizza className="w-5 h-5 text-orange-400" />
                <span className="font-medium">Margarita Grande</span>
              </div>
              {/* Aquí irá el componente interactivo Toggle Switch */}
              <span className="bg-yellow-200 text-yellow-800 text-xs px-2 py-1 rounded-full font-bold tracking-wide">
                En Horno
              </span>
            </li>
          </ul>
        </div>

      </div>
    </div>
  )
}