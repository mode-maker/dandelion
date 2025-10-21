import { NextResponse } from 'next/server';

export function middleware() {
  return new NextResponse('Auth required (test)', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Admin"' },
  });
}

// ВРЕМЕННО — на все пути
export const config = { matcher: ['/:path*'] };
