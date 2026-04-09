'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import getDb from '@/lib/db';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') throw new Error('Unauthorized');
}

export async function createSubject(formData: FormData) {
  await requireAdmin();

  const name = (formData.get('name') as string).trim();
  const code = (formData.get('code') as string).trim().toUpperCase();

  if (!name || !code)
    redirect('/admin/subjects/new?error=Name+and+code+are+required');

  const db = getDb();
  const existing = db.prepare('SELECT id FROM subjects WHERE code = ?').get(code);
  if (existing)
    redirect('/admin/subjects/new?error=A+subject+with+that+code+already+exists');

  db.prepare('INSERT INTO subjects (name, code) VALUES (?, ?)').run(name, code);

  revalidatePath('/admin/subjects');
  redirect('/admin/subjects?success=Subject+added+successfully');
}

export async function updateSubject(id: number, formData: FormData) {
  await requireAdmin();

  const name = (formData.get('name') as string).trim();
  const code = (formData.get('code') as string).trim().toUpperCase();

  if (!name || !code)
    redirect(`/admin/subjects/${id}?error=Name+and+code+are+required`);

  const db = getDb();
  const conflict = db.prepare('SELECT id FROM subjects WHERE code = ? AND id != ?').get(code, id);
  if (conflict)
    redirect(`/admin/subjects/${id}?error=That+code+is+already+used+by+another+subject`);

  db.prepare('UPDATE subjects SET name = ?, code = ? WHERE id = ?').run(name, code, id);

  revalidatePath('/admin/subjects');
  redirect('/admin/subjects?success=Subject+updated+successfully');
}

export async function deleteSubject(formData: FormData) {
  await requireAdmin();

  const id = parseInt(formData.get('id') as string, 10);
  const db = getDb();

  // Remove related scores and assignments before deleting
  db.prepare('DELETE FROM scores               WHERE subject_id = ?').run(id);
  db.prepare('DELETE FROM teacher_assignments  WHERE subject_id = ?').run(id);
  db.prepare('DELETE FROM subjects             WHERE id = ?').run(id);

  revalidatePath('/admin/subjects');
  redirect('/admin/subjects?success=Subject+deleted');
}
