import { NextResponse } from 'next/server';

export function middleware(req) {
  const { pathname } = req.nextUrl;
  const needsAuth = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
  if (!needsAuth) return NextResponse.next();

  const auth = req.headers.get('authorization') || '';
  // Edge-среда: используем btoa
  const expected = 'Basic ' + btoa(`${process.env.ADMIN_USER}:${process.env.ADMIN_PASS}`);
  if (auth === expected) return NextResponse.next();

  return new NextResponse('Auth required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Admin"' },
  });
}

export const config = { matcher: ['/admin/:path*', '/api/admin/:path*'] };
