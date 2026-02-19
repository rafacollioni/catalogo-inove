
import Image from 'next/image';
import { Database } from '@/types/database';

type Product = Database['public']['Tables']['produtos']['Row'];

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: { product: Product }) {
    const metadados = product.metadados as Record<string, any>
    const cores = metadados?.cores as string[] || []

    return (
        <div className="bg-white border-b border-gray-100 py-12 last:border-0">
            <div className="flex flex-col md:flex-row gap-8">

                {/* Coluna Esquerda: Título, Linha e Descrição */}
                <div className="flex-grow md:w-2/3">
                    <div className="mb-4">
                        <h3 className="text-2xl font-black text-blue-900 uppercase leading-none tracking-tight">
                            INOVE® {product.nome}
                        </h3>
                        <div className="h-1 w-full bg-blue-900 mt-2"></div>
                    </div>

                    <div className="space-y-4 pr-4">
                        {product.descricao && (
                            <ul className="space-y-1">
                                {product.descricao.split('\n').filter(line => line.trim().length > 0).map((line, i) => (
                                    <li key={i} className="flex items-start text-gray-600 font-medium text-base">
                                        <span className="mr-2 text-blue-900 font-bold">•</span>
                                        <span className="">{line}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Coluna Direita: Imagem e Metadados (Sidebar style) */}
                <div className="w-full md:w-1/3 flex flex-col">
                    {/* Container Imagem - Fundo unificado com o card (sem box cinza) */}
                    <div className="w-full flex items-start justify-center mb-4 md:-mt-2 relative">
                        {product.foto_url ? (
                            <img
                                src={product.foto_url}
                                alt={product.nome}
                                className="object-contain max-h-64 w-auto hover:scale-105 transition-transform duration-300"
                            />
                        ) : (
                            <div className="h-48 w-full bg-gray-50 flex items-center justify-center rounded-lg">
                                <span className="text-gray-400 text-sm font-medium">Sem Imagem</span>
                            </div>
                        )}
                    </div>

                    {/* Metadados e Cores (Alinhados à esquerda da coluna da imagem) */}
                    <div className="w-full space-y-2 pl-4 md:pl-0">
                        {/* Cores */}
                        {cores && cores.length > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-gray-700 uppercase whitespace-nowrap">CORES:</span>
                                <div className="flex gap-1.5 flex-wrap">
                                    {cores.map((cor: string, idx: number) => (
                                        <div
                                            key={idx}
                                            className={`w-5 h-5 rounded-full border border-gray-400 shadow-sm ${cor === '#FFFFFF' ? 'bg-white' : ''}`}
                                            style={{
                                                backgroundColor: cor === 'transparent' ? 'transparent' : cor,
                                                backgroundImage: cor === 'transparent' ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)' : 'none',
                                                backgroundSize: '4px 4px'
                                            }}
                                            title={cor}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Metadados Extras */}
                        {metadados && Object.keys(metadados).length > 0 && (
                            <div className="space-y-1">
                                {Object.entries(metadados)
                                    .filter(([key, value]) => key !== 'cores' && key !== 'codigos_cores' && typeof value !== 'object')
                                    .map(([key, value]) => (
                                        <div key={key} className="text-sm">
                                            <span className="font-bold text-gray-700 uppercase mr-1">{key}:</span>
                                            <span className="text-gray-500 font-medium uppercase">{String(value)}</span>
                                        </div>
                                    ))}
                            </div>
                        )}

                        {/* Códigos por Cor */}
                        {metadados?.codigos_cores && Object.entries(metadados.codigos_cores).map(([cor, codigo]) => {
                            const colorName = {
                                '#FFFFFF': 'BRANCO',
                                '#000000': 'PRETO',
                                'transparent': 'TRANSL'
                            }[cor] || 'COR';

                            return (
                                <div key={cor} className="text-sm font-bold text-gray-700 uppercase">
                                    CÓDIGO {colorName}: <span className="text-gray-500 font-medium">{codigo as string}</span>
                                </div>
                            )
                        })}

                        {/* Código Geral (Exibir apenas se não houver códigos específicos de cor, ou se for diferente) */}
                        {product.codigo && (!metadados?.codigos_cores || Object.keys(metadados.codigos_cores).length === 0) && (
                            <div className="text-sm font-bold text-gray-700 uppercase">
                                CÓDIGO: <span className="text-gray-500 font-medium">{product.codigo}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
