import { NextRequest, NextResponse } from 'next/server';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { quizQuestions } from '@/db/schema';
import { canManageQuiz } from '@/lib/quiz-organizer';
import { deletePhotoFile } from '@/lib/delete-stored-photo';

const questionSchema = z.object({
  number: z.number().int().min(1).max(999),
  imageUrl: z.string().trim().max(500),
  questionCs: z.string().trim().min(1).max(1000),
  questionEn: z.string().trim().max(1000),
  options: z
    .array(
      z.object({
        cs: z.string().trim().min(1).max(300),
        en: z.string().trim().max(300),
      }),
    )
    .length(3),
  correctOption: z.number().int().min(0).max(2),
});

const INVALID_INPUT =
  'Neplatná data — vyplň číslo, otázku česky a všechny tři odpovědi česky.';

function parseId(request: NextRequest): number | null {
  const id = Number(request.nextUrl.searchParams.get('id'));
  return Number.isInteger(id) && id > 0 ? id : null;
}

async function numberTaken(number: number, exceptId?: number): Promise<boolean> {
  const existing = await db
    .select({ id: quizQuestions.id })
    .from(quizQuestions)
    .where(eq(quizQuestions.number, number))
    .get();
  return Boolean(existing && existing.id !== exceptId);
}

/** Maže jen obrázky nahrané přes admin; výchozí fotky v /assets nechává být. */
function deleteUploadedQuizImage(url: string) {
  if (!url.startsWith('/uploads/quiz/')) return;
  deletePhotoFile(url);
  deletePhotoFile(url.replace(/\.jpg$/, '_thumb.jpg'));
}

export async function POST(request: NextRequest) {
  if (!canManageQuiz(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const parsed = questionSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: INVALID_INPUT }, { status: 400 });
    }

    if (await numberTaken(parsed.data.number)) {
      return NextResponse.json(
        { error: `Otázka číslo ${parsed.data.number} už existuje.` },
        { status: 409 },
      );
    }

    const question = await db.insert(quizQuestions).values(parsed.data).returning().get();
    return NextResponse.json(question);
  } catch (error) {
    console.error('Admin quiz question POST error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!canManageQuiz(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const id = parseId(request);
    if (!id) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const parsed = questionSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: INVALID_INPUT }, { status: 400 });
    }

    const existing = await db.select().from(quizQuestions).where(eq(quizQuestions.id, id)).get();
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (await numberTaken(parsed.data.number, id)) {
      return NextResponse.json(
        { error: `Otázka číslo ${parsed.data.number} už existuje.` },
        { status: 409 },
      );
    }

    const question = await db
      .update(quizQuestions)
      .set({ ...parsed.data, updatedAt: sql`(datetime('now'))` })
      .where(eq(quizQuestions.id, id))
      .returning()
      .get();

    if (existing.imageUrl !== question.imageUrl) {
      deleteUploadedQuizImage(existing.imageUrl);
    }

    return NextResponse.json(question);
  } catch (error) {
    console.error('Admin quiz question PUT error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!canManageQuiz(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const id = parseId(request);
    if (!id) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const existing = await db.select().from(quizQuestions).where(eq(quizQuestions.id, id)).get();
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Odpovědi hostů na otázku smaže ON DELETE CASCADE.
    await db.delete(quizQuestions).where(eq(quizQuestions.id, id));
    deleteUploadedQuizImage(existing.imageUrl);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin quiz question DELETE error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
