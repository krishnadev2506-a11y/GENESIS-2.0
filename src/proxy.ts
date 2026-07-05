import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

// We have to use 'jose' in proxy because jsonwebtoken uses Node.js crypto module
// which is not available in the Edge runtime (used by older middleware setups)

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback_secret_for_development_only'
);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public paths that don't require authentication
  if (
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/schedule' ||
    pathname.startsWith('/api/') // API routes handle their own auth
  ) {
    return NextResponse.next();
  }

  // Get token from cookie
  const token = request.cookies.get('genesis_token')?.value;

  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const { payload } = await jose.jwtVerify(token, secret);
      if (payload.role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch {
      // Token invalid or expired
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('genesis_token');
      return response;
    }
  }

  // Protect /dashboard routes
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const { payload } = await jose.jwtVerify(token, secret);
      // Both users and admins can access dashboard if needed, but primarily users
      if (payload.role !== 'user' && payload.role !== 'admin') {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    } catch {
      // Token invalid or expired
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('genesis_token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
