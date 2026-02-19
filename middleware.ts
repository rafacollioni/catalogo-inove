
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    // 1. Check for Env Vars to prevent startup crash
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.error('Middleware Error: Missing Supabase Environment Variables')
        // If critical vars are missing, we pass the request through to avoid a total 500 error on the edge,
        // although the app will likely fail later if it needs data.
        return NextResponse.next()
    }

    try {
        let response = NextResponse.next({
            request: {
                headers: request.headers,
            },
        })

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll()
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                        response = NextResponse.next({
                            request: {
                                headers: request.headers,
                            },
                        })
                        cookiesToSet.forEach(({ name, value, options }) =>
                            response.cookies.set(name, value, options)
                        )
                    },
                },
            }
        )

        // Refresh session if expired - required for Server Components
        // https://supabase.com/docs/guides/auth/server-side/nextjs
        const { data: { user }, error } = await supabase.auth.getUser()

        // Protect /admin routes
        if (request.nextUrl.pathname.startsWith('/admin')) {
            if (error || !user) {
                return NextResponse.redirect(new URL('/login', request.url))
            }
        }

        return response

    } catch (e) {
        // Catch any other middleware errors (like cookie parsing issues)
        console.error('Middleware execution failed:', e)
        return NextResponse.next()
    }
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
