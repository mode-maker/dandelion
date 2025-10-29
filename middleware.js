// middleware.js
import { NextResponse } from 'next/server';

function unauthorized() {
  return new NextResponse('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Dandelion Admin"' },
  });
}

// Безопасный base64-декодер для Edge (atob) и dev/Node (Buffer)
function b64decode(input) {
  try {
    if (typeof atob === 'function') return atob(input);
  } catch {}
  try {
    if (typeof Buffer !== 'undefined') return Buffer.from(input, 'base64').toString('utf-8');
  } catch {}
  return '';
}

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // Защищаем только /admin и /api/admin
  const needsAuth = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
  if (!needsAuth) return NextResponse.next();

  // Пропускаем preflight-запросы
  if (req.method === 'OPTIONS') return NextResponse.next();

  const user = process.env.ADMIN_USER || 'admin';
  const pass = process.env.ADMIN_PASS || '';

  const auth = (req.headers.get('authorization') || '').trim();
  if (!auth.startsWith('Basic ')) return unauthorized();

  const decoded = b64decode(auth.slice(6));
  const sepIndex = decoded.indexOf(':');
  if (sepIndex === -1) return unauthorized();

  const login = decoded.slice(0, sepIndex);
  const password = decoded.slice(sepIndex + 1);

  if (login !== user || password !== pass) return unauthorized();

  return NextResponse.next();
}

// Ограничиваем работу middleware только нужными путями
export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
