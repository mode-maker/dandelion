// middleware.ts (или middleware.js)
import { NextResponse } from 'next/server';

function unauthorized() {
  return new NextResponse('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Dandelion Admin"' },
  });
}

// безопасный декодер base64 (работает в Edge и в dev)
function b64decode(input: string): string {
  try {
    // Edge (Web API)
    // @ts-ignore
    if (typeof atob === 'function') return atob(input);
  } catch {}
  try {
    // Node/dev
    // @ts-ignore
    if (typeof Buffer !== 'undefined') return Buffer.from(input, 'base64').toString('utf-8');
  } catch {}
  return '';
}

export function middleware(req: Request & { nextUrl: URL }) {
  const { pathname } = req.nextUrl;

  // защищаем только /admin и /api/admin
  const needsAuth = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
  if (!needsAuth) return NextResponse.next();

  // пропускаем preflight и служебные
  // @ts-ignore
  if ((req as any).method === 'OPTIONS') return NextResponse.next();

  const user = process.env.ADMIN_USER || 'admin';
  const pass = process.env.ADMIN_PASS || '';

  const auth = (req.headers.get('authorization') || '').trim();
  if (!auth.startsWith('Basic ')) return unauthorized();

  const b64 = auth.slice(6);
  const decoded = b64decode(b64);
  if (!decoded.includes(':')) return unauthorized();

  const [login, password] = decoded.split(':');
  if (login !== user || password !== pass) return unauthorized();

  return NextResponse.next();
}

// Ограничиваем область действия middleware только нужными путями
export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
