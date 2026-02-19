
export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            produtos: {
                Row: {
                    id: string
                    created_at: string
                    nome: string
                    codigo: string | null
                    categoria: string
                    descricao: string | null
                    foto_url: string | null
                    metadados: Json | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    nome: string
                    codigo?: string | null
                    categoria: string
                    descricao?: string | null
                    foto_url?: string | null
                    metadados?: Json | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    nome?: string
                    codigo?: string | null
                    categoria?: string
                    descricao?: string | null
                    foto_url?: string | null
                    metadados?: Json | null
                }
            }
        }
    }
}
