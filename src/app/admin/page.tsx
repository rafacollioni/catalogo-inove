import { createClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { PlusCircle, Pencil, Trash2 } from 'lucide-react'
import { Database } from '@/types/database'
import { revalidatePath } from 'next/cache' // Import revalidatePath
import { redirect } from 'next/navigation' // Import redirect

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
    const supabase = await createClient()


    const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .order('created_at', { ascending: false })

    const produtos = data as unknown as Database['public']['Tables']['produtos']['Row'][] | null

    // Server Action for Deletion
    async function deleteProduct(formData: FormData) {
        'use server'
        const id = formData.get('id') as string
        const supabase = await createClient()

        await (supabase.from('produtos') as any).delete().eq('id', id)
        revalidatePath('/admin')
        revalidatePath('/')
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-blue-900 uppercase tracking-wide">Gerenciar Produtos</h1>
                <Link
                    href="/admin/produtos/novo"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800 transition-colors text-sm font-medium uppercase tracking-wide"
                >
                    <PlusCircle size={18} />
                    Novo Produto
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Produto</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Categoria</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Código</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {produtos?.map((produto) => (
                                <tr key={produto.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0">
                                                {produto.foto_url ? (
                                                    <img className="h-10 w-10 rounded-full object-cover" src={produto.foto_url} alt="" />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">IMG</div>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{produto.nome}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {produto.categoria}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {produto.codigo || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-3">
                                            <Link href={`/admin/produtos/editar/${produto.id}`} className="text-blue-600 hover:text-blue-900">
                                                <Pencil size={18} />
                                            </Link>
                                            <form action={deleteProduct}>
                                                <input type="hidden" name="id" value={produto.id} />
                                                <button type="submit" className="text-red-600 hover:text-red-900">
                                                    <Trash2 size={18} />
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {(!produtos || produtos.length === 0) && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500">
                                        nenhum produto cadastrado
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
