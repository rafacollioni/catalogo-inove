'use client'

import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Lock, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setError('Credenciais inválidas. Tente novamente.')
            setLoading(false)
        } else {
            router.push('/admin')
            router.refresh()
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-blue-900 p-8 text-center">
                    <div className="inline-flex p-3 bg-white/10 rounded-full mb-4">
                        <Lock className="text-white h-8 w-8" />
                    </div>
                    <h1 className="text-2xl font-black text-white uppercase tracking-wider">
                        Área Administrativa
                    </h1>
                    <p className="text-blue-100 mt-2 text-sm font-medium">
                        Acesso exclusivo para gerenciamento
                    </p>
                </div>

                <div className="p-8">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-sm font-medium">
                                <span className="block w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                                    Email Corporativo
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-gray-800 font-medium placeholder:text-gray-300"
                                    placeholder="seu@email.com"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                                    Senha de Acesso
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-gray-800 font-medium placeholder:text-gray-300"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-3.5 rounded-lg transition-all transform active:scale-[0.98] uppercase tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin h-5 w-5" />
                            ) : (
                                <>
                                    Entrar no Sistema
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <Link
                            href="/"
                            className="text-gray-400 hover:text-blue-600 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                            <ArrowRight className="rotate-180" size={14} />
                            Voltar para o Catálogo
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
