import { NextRequest } from 'next/server';

export function isAdmin(request: NextRequest): boolean {
  const cookie = request.cookies.get('admin-auth');
  const password = process.env.ADMIN_PASSWORD || 'alpaky2026';
  return cookie?.value === password;
}
