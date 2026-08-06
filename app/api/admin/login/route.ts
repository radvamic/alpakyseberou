import { NextRequest, NextResponse } from 'next/server';
import { getAdminPassword } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    const adminPassword = getAdminPassword();

    if (password !== adminPassword) {
      return NextResponse.json({ error: 'Nesprávné heslo' }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set('admin-auth', password, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('[admin/login]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set('admin-auth', '', { maxAge: 0, path: '/' });
  return response;
}
