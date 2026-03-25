import { withAuth, type NextRequestWithAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextFetchEvent } from 'next/server';

const authGuard = withAuth(
  function (req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth.token?.role;

    // Admin-only area
    if (pathname.startsWith('/admin') && role !== 'admin')
      return NextResponse.redirect(new URL('/dashboard', req.url));

    // Teacher-only area
    if (pathname.startsWith('/teacher') && role !== 'teacher')
      return NextResponse.redirect(new URL('/dashboard', req.url));

    return NextResponse.next();
  },
  {
    pages: { signIn: '/login' },
    callbacks: { authorized: ({ token }) => !!token },
  }
);

export function proxy(request: NextRequestWithAuth, event: NextFetchEvent) {
  return authGuard(request, event);
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/reports/:path*',
    '/admin/:path*',
    '/teacher/:path*',
  ],
};
