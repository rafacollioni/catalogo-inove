
import AdminNav from '@/components/AdminNav'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-gray-50">
            <AdminNav />
            <main className="container mx-auto px-4 pb-12">
                {children}
            </main>
        </div>
    )
}
