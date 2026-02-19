'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { LogOut, Package, PlusCircle, LayoutDashboard } from 'lucide-react'

export default function AdminNav() {
    const router = useRouter()
    const pathname = usePathname()
    const supabase = createClient()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    const isActive = (path: string) => pathname === path

    return (
        <nav className="bg-white border-b border-gray-200 px-4 py-3 mb-6">
            <div className="container mx-auto flex justify-between items-center">
                <div className="flex items-center space-x-6">
                    <Link href="/admin" className="text-xl font-bold text-blue-600 flex items-center gap-2">
                        <LayoutDashboard size={20} />
                        inove
                    </Link>

                    <div className="hidden md:flex space-x-4">
                        <Link
                            href="/admin"
                            className={`flex items-center gap-2 text-sm font-bold uppercase tracking-wide transition-colors ${isActive('/admin') ? 'text-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
                        >
                            <Package size={18} />
                            Produtos
                        </Link>
                        <Link
                            href="/admin/produtos/novo"
                            className={`flex items-center gap-2 text-sm font-bold uppercase tracking-wide transition-colors ${isActive('/admin/produtos/novo') ? 'text-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
                        >
                            <PlusCircle size={18} />
                            Novo Produto
                        </Link>
                        <Link
                            href="/"
                            target="_blank"
                            className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-gray-600 hover:text-blue-500 transition-colors"
                        >
                            <LayoutDashboard size={18} />
                            Ver Catálogo
                        </Link>
                    </div>
                </div>
                <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-red-500 hover:text-red-700 transition-colors"
                >
                    <LogOut size={18} />
                    <span className="hidden sm:inline">Sair</span>
                </button>
            </div>
        </nav>
    )
}
