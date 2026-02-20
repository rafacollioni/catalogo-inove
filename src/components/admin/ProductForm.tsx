'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Database } from '@/types/database'
import { Plus, X, Upload, Loader2, Save, UploadCloud } from 'lucide-react'
import Image from 'next/image'

type Product = Database['public']['Tables']['produtos']['Row']

interface ProductFormData {
    nome: string;
    codigo: string;
    categoria: string;
    descricao: string;
    foto_url: string;
    metadados: {
        cores?: string[];
        codigos_cores?: Record<string, string>;
        [key: string]: any;
    };
}

export default function ProductForm({ product, onSuccess }: { product?: Product, onSuccess?: () => void }) {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)

    const [formData, setFormData] = useState<ProductFormData>({
        nome: product?.nome || '',
        codigo: product?.codigo || '',
        categoria: product?.categoria || 'Toalhas',
        descricao: product?.descricao || '',
        foto_url: product?.foto_url || '',
        metadados: (product?.metadados as any) || {}
    })

    // Parse existing metadata if any
    const initialMetadata = product?.metadados
        ? Object.entries(product.metadados as Record<string, string>).map(([key, value]) => ({ key, value }))
        : []

    const [metadata, setMetadata] = useState<{ key: string; value: string }[]>(initialMetadata)

    const handleMetadataChange = (index: number, field: 'key' | 'value', value: string) => {
        const newMetadata = [...metadata]
        newMetadata[index][field] = value
        setMetadata(newMetadata)
    }

    const addMetadataField = () => {
        setMetadata([...metadata, { key: '', value: '' }])
    }

    const removeMetadataField = (index: number) => {
        const newMetadata = metadata.filter((_, i) => i !== index)
        setMetadata(newMetadata)
    }

    const uploadFile = async (file: File) => {
        try {
            setUploading(true)

            const fileExt = file.name.split('.').pop() || 'png'
            const fileName = `${Math.random()}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('produtos')
                .upload(filePath, file)

            if (uploadError) {
                throw uploadError
            }

            const { data } = supabase.storage.from('produtos').getPublicUrl(filePath)

            setFormData(prev => ({ ...prev, foto_url: data.publicUrl }))
        } catch (error) {
            alert('erro ao fazer upload da imagem')
            console.error(error)
        } finally {
            setUploading(false)
        }
    }

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) {
            return
        }
        await uploadFile(e.target.files[0])
    }

    const handlePaste = async (e: React.ClipboardEvent) => {
        const items = e.clipboardData.items
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                e.preventDefault()
                const file = items[i].getAsFile()
                if (file) {
                    await uploadFile(file)
                    return
                }
            }
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)


        // Convert metadata array back to object
        const metadadosObject = metadata.reduce((acc, curr) => {
            if (curr.key.trim() && curr.value.trim()) {
                acc[curr.key.trim()] = curr.value.trim()
            }
            return acc
        }, {} as Record<string, any>)

        // Include cores and codigos_cores from formData
        if ((formData.metadados as any)?.cores) {
            metadadosObject.cores = (formData.metadados as any).cores
        }
        if ((formData.metadados as any)?.codigos_cores) {
            metadadosObject.codigos_cores = (formData.metadados as any).codigos_cores
        }

        try {
            const productData = {
                ...formData,
                metadados: metadadosObject,
            }

            if (product) {
                // Update
                const { error } = await (supabase
                    .from('produtos') as any)
                    .update(productData)
                    .eq('id', product.id)
                if (error) throw error
            } else {
                // Insert
                const { error } = await (supabase
                    .from('produtos') as any)
                    .insert(productData)
                if (error) throw error
            }

            router.push('/admin')
            router.refresh()
        } catch (error) {
            alert('erro ao salvar produto')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-8 bg-white p-6 rounded-lg border border-gray-200 shadow-sm max-w-3xl mx-auto"
            onPaste={handlePaste}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Nome do Produto</label>
                        <input
                            required
                            type="text"
                            value={formData.nome}
                            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-900 placeholder-gray-400"
                            placeholder="Ex: INOVE® DISPENSER..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Código</label>
                            <input
                                type="text"
                                value={formData.codigo}
                                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-900 placeholder-gray-400"
                                placeholder="Ex: TH-001"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Categoria</label>
                            <select
                                value={formData.categoria}
                                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white"
                            >
                                <option value="Toalhas para Mãos">Toalhas para Mãos</option>
                                <option value="Guardanapos">Guardanapos</option>
                                <option value="Papel Higiênico">Papel Higiênico</option>
                                <option value="Sabonete e Higiene">Sabonete e Higiene</option>
                                <option value="Químicos Concentrados">Químicos Concentrados</option>
                                <option value="Químicos Pronto Uso">Químicos Pronto Uso</option>
                                <option value="Acessórios e Dispensers">Acessórios e Dispensers</option>
                                <option value="Sacos de Lixo">Sacos de Lixo</option>
                                <option value="Panos e Wipers">Panos e Wipers</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Descrição (Itens em lista)</label>
                        <textarea
                            rows={6}
                            value={formData.descricao}
                            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-900 placeholder-gray-400 font-mono"
                            placeholder={`• Design elegante
• Fabricado em ABS
• Fácil manutenção
• (Cada linha será um item)`}
                        />
                    </div>
                </div>


                <div className="space-y-4">
                    <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Imagem do Produto</label>
                    <div
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors relative h-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        tabIndex={0}
                    >
                        {formData.foto_url ? (
                            <div className="relative w-full h-full">
                                <img
                                    src={formData.foto_url}
                                    alt="Preview"
                                    className="w-full h-full object-contain"
                                />
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, foto_url: '' })}
                                    className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <UploadCloud className="h-12 w-12 text-gray-400 mb-2" />
                                <p className="text-sm text-gray-500">
                                    <span className="font-semibold text-blue-600">Clique para upload</span>
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    ou dê <span className="font-bold bg-gray-100 px-1 rounded text-gray-700">Ctrl+V</span> para colar
                                </p>
                                <p className="text-xs text-gray-400 mt-2">PNG, JPG, WEBP (max. 2MB)</p>
                                <input
                                    type="file"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    accept="image/*"
                                    onChange={handleUpload}
                                    disabled={uploading}
                                />
                            </div>
                        )}
                        {uploading && (
                            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Seção de Cores */}
            <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-bold text-blue-900 uppercase tracking-wide mb-4">Cores Disponíveis</h3>
                <div className="flex flex-wrap gap-4 items-center">
                    {/* Cores Padrão */}
                    {[
                        { label: 'Branco', value: '#FFFFFF', border: true },
                        { label: 'Preto', value: '#000000', border: false },
                        { label: 'Transparente', value: 'transparent', border: true }, // Representado visualmente
                    ].map((color) => {
                        const isSelected = (formData.metadados as any)?.cores?.includes(color.value);
                        return (
                            <button
                                key={color.value}
                                type="button"
                                onClick={() => {
                                    const currentColors = (formData.metadados as any)?.cores || [];
                                    const newColors = isSelected
                                        ? currentColors.filter((c: string) => c !== color.value)
                                        : [...currentColors, color.value];
                                    setFormData({
                                        ...formData,
                                        metadados: { ...formData.metadados, cores: newColors }
                                    });
                                }}
                                className={`flex items-center gap-2 px-3 py-2 rounded-md border transition-all ${isSelected
                                    ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div
                                    className={`w-4 h-4 rounded-full ${color.border ? 'border border-gray-300' : ''}`}
                                    style={{
                                        backgroundColor: color.value === 'transparent' ? 'transparent' : color.value,
                                        backgroundImage: color.value === 'transparent' ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)' : 'none',
                                        backgroundSize: '4px 4px',
                                        backgroundPosition: '0 0, 0 2px, 2px -2px, -2px 0px'
                                    }}
                                />
                                <span className="text-sm font-medium text-gray-700">{color.label}</span>
                            </button>
                        );
                    })}

                    {/* Cor Personalizada */}
                    <div className="flex items-center gap-2 border-l pl-4 border-gray-200">
                        <label className="text-sm font-bold text-gray-700 uppercase">Outra:</label>
                        <div className="relative group">
                            <input
                                type="color"
                                className="w-8 h-8 cursor-pointer rounded overflow-hidden p-0 border border-gray-300"
                                onChange={(e) => {
                                    const color = e.target.value;
                                    const currentColors = (formData.metadados as any)?.cores || [];
                                    if (!currentColors.includes(color)) {
                                        setFormData({
                                            ...formData,
                                            metadados: { ...formData.metadados, cores: [...currentColors, color] }
                                        });
                                    }
                                }}
                            />
                            <span className="absolute bottom-full mb-1 hidden group-hover:block w-max text-xs bg-gray-800 text-white px-2 py-1 rounded">Adicionar cor</span>
                        </div>
                    </div>
                </div>

                {/* Lista de Cores Selecionadas (Visual) */}
                <div className="mt-4 flex flex-col gap-3">
                    {((formData.metadados as any)?.cores || []).map((color: string) => (
                        <div key={color} className="flex items-center gap-3 bg-gray-50 p-2 rounded-md border border-gray-200">
                            <div className="relative group shrink-0">
                                <div
                                    className="w-10 h-10 rounded-full border border-gray-300 shadow-sm"
                                    style={{
                                        backgroundColor: color === 'transparent' ? 'transparent' : color,
                                        backgroundImage: color === 'transparent' ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)' : 'none',
                                        backgroundSize: '4px 4px'
                                    }}
                                />
                            </div>

                            <div className="flex-grow">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                                    Código para esta cor
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ex: 41702002"
                                    className="w-full rounded text-sm border-gray-300 py-1.5 px-3 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                    value={(formData.metadados as any)?.codigos_cores?.[color] || ''}
                                    onChange={(e) => {
                                        const newCodes = { ...((formData.metadados as any)?.codigos_cores || {}) };
                                        newCodes[color] = e.target.value;
                                        setFormData({
                                            ...formData,
                                            metadados: { ...formData.metadados, codigos_cores: newCodes }
                                        });
                                    }}
                                />
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    const currentColors = (formData.metadados as any)?.cores || [];
                                    const newCodes = { ...((formData.metadados as any)?.codigos_cores || {}) };
                                    delete newCodes[color]; // Remove code when color is removed

                                    setFormData({
                                        ...formData,
                                        metadados: {
                                            ...formData.metadados,
                                            cores: currentColors.filter((c: string) => c !== color),
                                            codigos_cores: newCodes
                                        }
                                    });
                                }}
                                className="text-gray-400 hover:text-red-500 p-2"
                                title="Remover cor"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Metadados (Chave-Valor) */}
            <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-blue-900 uppercase tracking-wide">Especificações Técnicas</h3>
                    <button
                        type="button"
                        onClick={addMetadataField}
                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                        <Plus size={16} />
                        adicionar campo
                    </button>
                </div>

                <div className="space-y-3 bg-gray-50 p-4 rounded-md">
                    {metadata.length === 0 && (
                        <p className="text-sm text-gray-400 text-center italic">nenhuma especificação adicionada</p>
                    )}
                    {metadata.map((item, index) => (
                        <div key={index} className="flex gap-3 items-start">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={item.key}
                                    onChange={(e) => handleMetadataChange(index, 'key', e.target.value)}
                                    placeholder="ex: cor, peso, medidas"
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400"
                                />
                            </div>
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={item.value}
                                    onChange={(e) => handleMetadataChange(index, 'value', e.target.value)}
                                    placeholder="valor"
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => removeMetadataField(index)}
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    disabled={loading || uploading}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors font-medium"
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin" size={18} />
                            salvando...
                        </>
                    ) : (
                        <>
                            <Save size={18} />
                            salvar produto
                        </>
                    )}
                </button>
            </div>
        </form>
    )
}
