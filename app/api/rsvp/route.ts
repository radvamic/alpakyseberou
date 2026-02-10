import { NextRequest, NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/data';

interface RsvpEntry {
  id: number;
  name: string;
  email: string;
  attending: boolean;
  guests: number;
  children: boolean;
  childrenCount: number;
  menuPreference: string;
  allergies: string;
  songRequest: string;
  songNever: string;
  createdAt: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, attending, guests, children, childrenCount, menuPreference, allergies, songRequest, songNever } = body;

    if (!name || attending === undefined) {
      return NextResponse.json({ error: 'Name and attendance required' }, { status: 400 });
    }

    const rsvps = readData<RsvpEntry>('rsvp.json');
    const entry: RsvpEntry = {
      id: Date.now(),
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
    };

    rsvps.push(entry);
    writeData('rsvp.json', rsvps);

    return NextResponse.json({ success: true, message: 'RSVP saved!' });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET() {
  const rsvps = readData<RsvpEntry>('rsvp.json');
  return NextResponse.json(rsvps);
}
