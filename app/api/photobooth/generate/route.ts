import { NextRequest, NextResponse } from 'next/server';
import { generatePhoto } from '@/lib/openai';
import { getMotifById } from '@/components/photobooth/motifs';
import { ensureUploadDirs } from '@/lib/data';
import fs from 'fs';
import path from 'path';

const ipGenerationCounts = new Map<string, { count: number; lastReset: number }>();

const MAX_GENERATIONS = 5;
const RESET_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
const COOLDOWN_MS = 30 * 1000; // 30s between generations
const ipLastGeneration = new Map<string, number>();

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; cooldownLeft: number } {
  const now = Date.now();

  const lastGen = ipLastGeneration.get(ip) || 0;
  const cooldownLeft = Math.max(0, COOLDOWN_MS - (now - lastGen));
  if (cooldownLeft > 0) {
    const entry = ipGenerationCounts.get(ip);
    return { allowed: false, remaining: entry ? MAX_GENERATIONS - entry.count : MAX_GENERATIONS, cooldownLeft };
  }

  let entry = ipGenerationCounts.get(ip);
  if (!entry || now - entry.lastReset > RESET_INTERVAL_MS) {
    entry = { count: 0, lastReset: now };
    ipGenerationCounts.set(ip, entry);
  }

  const remaining = MAX_GENERATIONS - entry.count;
  if (remaining <= 0) {
    return { allowed: false, remaining: 0, cooldownLeft: 0 };
  }

  return { allowed: true, remaining, cooldownLeft: 0 };
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateCheck = checkRateLimit(ip);

    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: rateCheck.cooldownLeft > 0
            ? 'Příliš rychle! Počkejte chvíli před dalším generováním.'
            : 'Dosáhli jste limitu generování. Zkuste to později.',
          remaining: rateCheck.remaining,
          cooldownLeft: rateCheck.cooldownLeft,
        },
        { status: 429 },
      );
    }

    ensureUploadDirs();
    const formData = await request.formData();

    const motifId = formData.get('motifId') as string;
    const couplePhotosJson = formData.get('couplePhotos') as string;
    const userPhoto = formData.get('userPhoto') as File;

    if (!motifId || !userPhoto) {
      return NextResponse.json(
        { error: 'Missing required fields: motifId, userPhoto' },
        { status: 400 },
      );
    }

    const motif = getMotifById(motifId);
    if (!motif) {
      return NextResponse.json({ error: 'Invalid motif ID' }, { status: 400 });
    }

    const bytes = await userPhoto.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = path.extname(userPhoto.name) || '.jpg';
    const tempFilename = `temp-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const tempPath = path.join(process.cwd(), 'public/uploads/photobooth', tempFilename);
    fs.writeFileSync(tempPath, buffer);

    let couplePhotoPaths: string[] = [];
    if (couplePhotosJson) {
      try {
        couplePhotoPaths = JSON.parse(couplePhotosJson);
      } catch {
        // ignore parse errors
      }
    }

    const prompt = couplePhotoPaths.length > 0
      ? motif.promptWithCouple
      : motif.promptSolo;

    const generatedUrl = await generatePhoto({
      userPhotoPath: tempPath,
      couplePhotoPaths,
      prompt,
    });

    // Clean up temp file
    try { fs.unlinkSync(tempPath); } catch { /* ignore */ }

    // Update rate limit counters
    const entry = ipGenerationCounts.get(ip)!;
    entry.count++;
    ipLastGeneration.set(ip, Date.now());

    return NextResponse.json({
      success: true,
      generatedUrl,
      originalUrl: `/uploads/photobooth/${tempFilename}`,
      remaining: MAX_GENERATIONS - entry.count,
    });
  } catch (error) {
    console.error('Photobooth generate error:', error);
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
