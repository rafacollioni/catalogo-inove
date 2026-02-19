
import { Database } from './database'

export type Produto = Database['public']['Tables']['produtos']['Row']

export type ProdutoFormData = {
    nome: string
    codigo: string
    categoria: string
    descricao: string
    foto_url: string
    metadados: { key: string; value: string }[]
}
