import { NextResponse } from 'next/server';

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // защищаем /admin и /api/admin/*
  const needsAuth =
    pathname.startsWith('/admin') || pathname.startsWith('/api/admin');

  if (!needsAuth) return NextResponse.next();

  const auth = req.headers.get('authorization');
  const good =
    'Basic ' +
    Buffer.from(`${process.env.ADMIN_USER}:${process.env.ADMIN_PASS}`).toString(
      'base64'
    );

  if (auth === good) return NextResponse.next();

  return new NextResponse('Auth required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Admin"' },
  });
}

export const config = { matcher: ['/:path*'] };

};
