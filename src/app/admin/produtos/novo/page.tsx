
import ProductForm from '@/components/admin/ProductForm'


export default function NewProductPage() {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">Novo Produto</h1>
                <p className="text-gray-500 text-sm mt-1">Preencha as informações para adicionar um item ao catálogo</p>
            </div>
            <ProductForm />
        </div>
    )
}
