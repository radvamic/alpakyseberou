import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { quizPlayers } from '@/db/schema';
import { isAdmin } from '@/lib/admin-auth';

/**
 * Smaže jednoho hráče (?id=) nebo všechny (?all=1) — např. testovací data
 * před svatbou. Odpovědi smaže ON DELETE CASCADE.
 */
export async function DELETE(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const params = request.nextUrl.searchParams;

    if (params.get('all') === '1') {
      await db.delete(quizPlayers);
      return NextResponse.json({ success: true });
    }

    const id = Number(params.get('id'));
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    await db.delete(quizPlayers).where(eq(quizPlayers.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin quiz players DELETE error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
