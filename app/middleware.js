// middleware.js
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export function middleware(request) {
  const path = request.nextUrl.pathname
  const cookieStore = cookies()
  const isAuthenticated = cookieStore.get('admin-authenticated')?.value === 'true'

  // Protect all routes under /admin
  if (path.startsWith('/admin') && !isAuthenticated) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}