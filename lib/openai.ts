import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { ensureUploadDirs } from './data';

let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return _openai;
}

export interface GeneratePhotoOptions {
  userPhotoPath: string;
  couplePhotoPaths?: string[];
  prompt: string;
}

export async function generatePhoto({
  userPhotoPath,
  couplePhotoPaths = [],
  prompt,
}: GeneratePhotoOptions): Promise<string> {
  ensureUploadDirs();

  const imageFiles: File[] = [];

  const userPhotoBuffer = fs.readFileSync(userPhotoPath);
  const userBlob = new Blob([new Uint8Array(userPhotoBuffer)], { type: 'image/png' });
  imageFiles.push(new File([userBlob], 'user_photo.png', { type: 'image/png' }));

  for (let i = 0; i < couplePhotoPaths.length; i++) {
    const fullPath = path.join(process.cwd(), 'public', couplePhotoPaths[i]);
    if (fs.existsSync(fullPath)) {
      const buf = fs.readFileSync(fullPath);
      const blob = new Blob([new Uint8Array(buf)], { type: 'image/png' });
      imageFiles.push(new File([blob], `couple_photo_${i}.png`, { type: 'image/png' }));
    }
  }

  const response = await getOpenAI().images.edit({
    model: 'gpt-image-1',
    image: imageFiles,
    prompt,
    size: '1024x1024',
    quality: 'high',
  });

  const imageBase64 = response.data?.[0]?.b64_json;
  if (!imageBase64) {
    throw new Error('No image data returned from OpenAI');
  }

  const buffer = Buffer.from(imageBase64, 'base64');
  const filename = `pb-${Date.now()}-${Math.round(Math.random() * 1e9)}.png`;
  const outputPath = path.join(
    process.cwd(),
    'public/uploads/photobooth',
    filename,
  );
  fs.writeFileSync(outputPath, buffer);

  return `/uploads/photobooth/${filename}`;
}
