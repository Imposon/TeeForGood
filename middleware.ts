import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Public routes that don't require subscription
const publicRoutes = [
  '/',
  '/login',
  '/signup',
  '/pricing',
  '/about',
  '/api/auth/login',
  '/api/auth/signup',
  '/api/auth/logout',
  '/api/subscription/webhook',
]

// Routes that require active subscription
const subscriptionRoutes = [
  '/dashboard',
  '/api/scores',
  '/api/draws',
  '/api/charities',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('auth-token')?.value

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Check authentication
  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // For API routes requiring subscription
  if (subscriptionRoutes.some(route => pathname.startsWith(route))) {
    try {
      // Decode token to check subscription status
      const payload = JSON.parse(
        Buffer.from(token.split('.')[1], 'base64').toString()
      )

      if (payload.subscriptionStatus !== 'active') {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json(
            { error: 'Active subscription required' },
            { status: 403 }
          )
        }
        return NextResponse.redirect(new URL('/pricing', request.url))
      }
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
