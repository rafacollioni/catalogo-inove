import { createClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'
import ProductForm from '@/components/admin/ProductForm'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: product } = await supabase
        .from('produtos')
        .select('*')
        .eq('id', id)
        .single()

    if (!product) {
        notFound()
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">editar produto</h1>
                <p className="text-gray-500 text-sm mt-1">atualize as informações do produto</p>
            </div>
            <ProductForm product={product} />
        </div>
    )
}
