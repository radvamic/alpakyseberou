import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { rsvps } from '@/db/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      attending,
      guests,
      children,
      childrenCount,
      menuPreference,
      allergies,
      songRequest,
      songNever,
    } = body;

    if (!name || attending === undefined) {
      return NextResponse.json(
        { error: 'Name and attendance required' },
        { status: 400 },
      );
    }

    const [entry] = await db
      .insert(rsvps)
      .values({
        name,
        email: email || '',
        attending: Boolean(attending),
        guests: parseInt(guests) || 1,
        children: Boolean(children),
        childrenCount: parseInt(childrenCount) || 0,
        menuPreference: menuPreference || '',
        allergies: allergies || '',
        songRequest: songRequest || '',
        songNever: songNever || '',
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json({ success: true, message: 'RSVP saved!', entry });
  } catch (error) {
    console.error('RSVP POST error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const allRsvps = await db.select().from(rsvps).all();
    return NextResponse.json(allRsvps);
  } catch (error) {
    console.error('RSVP GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
