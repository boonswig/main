import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export const proxy = withAuth(
  function proxy(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Admin routes require admin role
    if (pathname.startsWith('/admin') && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/playbook', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: ['/playbook/:path*', '/admin/:path*'],
}
