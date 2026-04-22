import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (path === '/admin/login') {
    return NextResponse.next();
  }

  const cookie = request.cookies.get('admin-auth');
  const password = process.env.ADMIN_PASSWORD || 'alpaky2026';

  if (!cookie || cookie.value !== password) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
