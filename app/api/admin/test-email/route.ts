import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { sendTestEmail } from '@/lib/mailer';

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await sendTestEmail();
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
