import { NextResponse } from 'next/server';

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // защищаем /admin и /api/admin/*
  const needsAuth =
    pathname.startsWith('/admin') || pathname.startsWith('/api/admin');

  if (!needsAuth) return NextResponse.next();

  const auth = req.headers.get('authorization') || '';
  const expected =
    'Basic ' + btoa(`${process.env.ADMIN_USER}:${process.env.ADMIN_PASS}`);

  if (auth === expected) return NextResponse.next();

  return new NextResponse('Auth required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Admin"' },
  });
}

// ВРЕМЕННО включи на все пути, чтобы проверить, что работает.
// Потом вернём на ['/admin/:path*', '/api/admin/:path*']
export const config = { matcher: ['/:path*'] };
