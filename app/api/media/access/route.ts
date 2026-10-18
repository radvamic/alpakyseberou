import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { grantAccess, hasMediaAccess, isCodeValid } from '@/lib/media/access';

/** Má prohlížeč přístup do galerie? */
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({ ok: hasMediaAccess(request) });
  } catch (error) {
    console.error('Media access GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

const bodySchema = z.object({ code: z.string().max(100) });

/** Ověří svatební kód a uloží přístup do cookie. */
export async function POST(request: NextRequest) {
  try {
    const parsed = bodySchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success || !isCodeValid(parsed.data.code)) {
      return NextResponse.json({ error: 'Neplatný kód' }, { status: 403 });
    }
    const response = NextResponse.json({ ok: true });
    grantAccess(response);
    return response;
  } catch (error) {
    console.error('Media access POST error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
