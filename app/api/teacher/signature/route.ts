import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import getDb from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'teacher') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const fd = await req.formData();
  const file = fd.get('file') as File | null;

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  if (!['image/png', 'image/jpeg'].includes(file.type)) {
    return NextResponse.json({ error: 'Only PNG or JPG files are supported' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File must be smaller than 2 MB' }, { status: 400 });
  }

  const ext = file.type === 'image/png' ? 'png' : 'jpg';
  const userId = session.user.id;
  const filename = `${userId}.${ext}`;
  const sigDir  = path.join(process.cwd(), 'public', 'signatures');
  const sigPath = path.join(sigDir, filename);

  await mkdir(sigDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(sigPath, buffer);

  const relativePath = `signatures/${filename}`;
  getDb()
    .prepare('UPDATE users SET signature_path = ? WHERE id = ?')
    .run(relativePath, parseInt(userId));

  return NextResponse.json({ path: relativePath });
}
