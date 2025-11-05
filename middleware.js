// middleware.js
import { NextResponse } from 'next/server';

const BASIC_USER = process.env.ADMIN_USER || 'admin';
const BASIC_PASS = process.env.ADMIN_PASS || 'admin';
const realm = 'Restricted Dandelion Admin';

function unauthorized() {
  return new NextResponse('Auth required', {
    status: 401,
    headers: { 'WWW-Authenticate': `Basic realm="${realm}"` },
  });
}

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // Разрешаем публичные пути
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/albums') ||
    pathname.startsWith('/api/events') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/images') ||
    pathname === '/' ||
    pathname.startsWith('/gallery') ||
    pathname.startsWith('/events') ||
    pathname.startsWith('/workshops')
  ) {
    return NextResponse.next();
  }

  // Разрешаем ТОЛЬКО чтение списка фоток в админке без авторизации,
  // чтобы починить падение и видеть ошибки.
  if (pathname.startsWith('/api/admin/photos') && req.method === 'GET') {
    return NextResponse.next();
  }

  // Всё остальное под /admin и /api/admin — только с basic-auth
  const needsAuth =
    pathname === '/admin' ||
    pathname.startsWith('/admin/') ||
    pathname.startsWith('/api/admin');

  if (!needsAuth) return NextResponse.next();

  const auth = req.headers.get('authorization') || '';
  if (!auth.startsWith('Basic ')) return unauthorized();

  try {
    const [, base64] = auth.split(' ');
    const [user, pass] = Buffer.from(base64, 'base64').toString('utf8').split(':');
    if (user === BASIC_USER && pass === BASIC_PASS) {
      return NextResponse.next();
    }
  } catch (_) {}
  return unauthorized();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
