import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { UserRole } from '@/types'

const ROLE_HOME: Record<UserRole, string> = {
  client: '/dashboard',
  lawyer: '/onboarding',
  admin: '/admin',
}
const PUBLIC = ['/', '/login', '/register']

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(list: any) {
          list.forEach(({ name, value }: any) => req.cookies.set(name, value))
          res = NextResponse.next({ request: req })
          list.forEach(({ name, value, options }: any) =>
            res.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = req.nextUrl.pathname
  const isPublic = PUBLIC.some(p => path === p)

  if (!user && !isPublic) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    const role = profile?.role as UserRole | undefined

    if (path === '/login' || path === '/register') {
      return NextResponse.redirect(
        new URL(role ? ROLE_HOME[role] : '/dashboard', req.url)
      )
    }
    if (path.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    if (path.startsWith('/whiteboard') && role !== 'lawyer') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    if (path.startsWith('/dashboard') && role === 'lawyer') {
      return NextResponse.redirect(new URL('/whiteboard', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
