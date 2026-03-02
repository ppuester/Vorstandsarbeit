import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Öffentliche Routen, die ohne Authentifizierung zugänglich sind
const publicRoutes = [
  '/login',
  '/api/users/login',
  '/api/users/logout',
  '/api/users/me',
  '/admin', // Payload Admin-Konsole
  '/admin/', // Payload Admin-Konsole
]

// Routen, die geschützt werden sollen
const protectedRoutes = [
  '/',
  '/kontobewegungen',
  '/flugzeuge',
  '/stammdaten',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Prüfe, ob es eine öffentliche Route ist
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  // Wenn es eine öffentliche Route ist, erlaube den Zugriff
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Prüfe, ob es eine geschützte Route ist
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  // Wenn es keine geschützte Route ist, erlaube den Zugriff (z.B. für API-Routen, die ihre eigene Auth haben)
  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  // Prüfe Authentifizierung für geschützte Routen
  const token = request.cookies.get('payload-token')?.value

  if (!token) {
    // Kein Token vorhanden - leite zur Login-Seite um
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Token vorhanden - erlaube Zugriff
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
