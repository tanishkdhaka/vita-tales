import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateSession, SESSION_COOKIE_NAME } from '@/lib/auth';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { v4 as uuidv4 } from 'uuid';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
]);

const EXTENSION_MAP: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/avif': '.avif',
  'image/gif': '.gif',
};

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    // 1. Validate session
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    const userId = token ? await validateSession(token) : null;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin session required' },
        { status: 401 }
      );
    }

    // 2. Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'No valid image file uploaded under field "file"' },
        { status: 400 }
      );
    }

    // 3. Validate file type
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          error:
            'Unsupported file type. Allowed formats: JPEG, PNG, WebP, AVIF, GIF',
        },
        { status: 400 }
      );
    }

    // 4. Validate file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'File size exceeds maximum allowed limit of 10MB' },
        { status: 400 }
      );
    }

    // 5. Generate unique filename and ensure directory exists
    const extension = EXTENSION_MAP[file.type] || '.jpg';
    const filename = `${uuidv4()}${extension}`;
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    const filePath = path.join(uploadsDir, filename);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await writeFile(filePath, buffer);

    return NextResponse.json({
      url: `/uploads/${filename}`,
      filename,
      size: file.size,
    });
  } catch (error) {
    console.error('Image upload failed:', error);
    return NextResponse.json(
      { error: 'Internal server error while saving uploaded image' },
      { status: 500 }
    );
  }
}
