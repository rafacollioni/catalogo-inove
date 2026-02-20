
import { createClient } from '@/lib/supabase-server'
import ProductCard from '@/components/ProductCard'

import { Search, Filter, Package, Lock } from 'lucide-react'
import Link from 'next/link'
import { Database } from '@/types/database'

type Product = Database['public']['Tables']['produtos']['Row']

// Revalidate every 60 seconds (ISR) or 0 for dynamic. 0 is better for active catalog.
export const revalidate = 0

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; c?: string }> // searchParams is a Promise in Next 15+
}) {
  const resolvedParams = await searchParams
  const query = resolvedParams.q || ''
  const category = resolvedParams.c || ''

  const supabase = await createClient()
  let request = supabase.from('produtos').select('*')

  if (query) {
    // Search by name or description or code
    request = request.or(`nome.ilike.%${query}%,descricao.ilike.%${query}%,codigo.ilike.%${query}%`)
  }

  if (category) {
    request = request.eq('categoria', category)
  }

  const { data, error } = await request
  const produtos = data as Product[] | null



  const categories = [
    'Toalhas para Mãos',
    'Guardanapos',
    'Papel Higiênico',
    'Sabonete e Higiene',
    'Químicos Concentrados',
    'Químicos Pronto Uso',
    'Acessórios e Dispensers',
    'Sacos de Lixo',
    'Panos e Wipers'
  ]

  return (
    <main className="min-h-screen bg-white pb-12">
      {/* Header / Hero */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight uppercase">Inove Higiene</h1>


            <div className="flex items-center gap-4 w-full md:w-auto">
              {/* Search Bar */}
              <form className="w-full md:w-auto flex-grow flex items-center" action="/">
                <div className="relative w-full md:w-80">
                  <input
                    name="q"
                    defaultValue={query}
                    placeholder="Buscar produtos..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm placeholder:text-gray-400"
                  />
                  <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                </div>
              </form>

              <Link
                href="/login"
                className="flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded-full text-sm font-bold uppercase hover:bg-blue-800 transition-colors shadow-sm whitespace-nowrap"
                title="Acessar Área Administrativa"
              >
                <Lock size={16} />
                <span>Área Administrativa</span>
              </Link>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            <Link
              href="/"
              className={`px-4 py-2 rounded-full text-sm font-bold uppercase transition-colors tracking-wide ${!category
                ? 'bg-blue-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-blue-900'
                }`}
            >
              Todos
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/?c=${encodeURIComponent(cat)}`}
                className={`px-4 py-2 rounded-full text-sm font-bold uppercase transition-colors tracking-wide ${category === cat
                  ? 'bg-blue-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-blue-900'
                  }`}
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* Product Grid */}
      <div className="container mx-auto px-4 py-8">
        {error ? (
          <div className="text-center py-12">
            <p className="text-red-500">erro ao carregar produtos. tente novamente.</p>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
            {/* max-w-5xl para não ficar muito largo na lista horizontal */}
            <div className="flex flex-col gap-8">
              {produtos && produtos.length > 0 ? (
                produtos.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="text-center py-20 bg-gray-50 rounded-lg">
                  <Package className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                  <p className="text-gray-500 font-medium">Nenhum produto encontrado nesta categoria.</p>
                  {(query || category) && (
                    <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline text-sm">
                      limpar filtros
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
