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

export async function createStudent(formData: FormData) {
  await requireAdmin();

  const studentId = (formData.get('student_id') as string).trim().toUpperCase();
  const fullName  = (formData.get('full_name')  as string).trim();
  const className = (formData.get('class_name') as string).trim();
  const gender    = (formData.get('gender')     as string).trim();
  const term      = parseInt(formData.get('term') as string, 10);
  const year      = parseInt(formData.get('year') as string, 10);

  if (!studentId || !fullName || !className || !gender || !term || !year)
    redirect('/admin/students/new?error=All+fields+are+required');

  if (!['Male', 'Female'].includes(gender))
    redirect('/admin/students/new?error=Invalid+gender');

  if (term < 1 || term > 3)
    redirect('/admin/students/new?error=Term+must+be+1%2C+2+or+3');

  const db = getDb();
  const existing = db.prepare('SELECT id FROM students WHERE student_id = ?').get(studentId);
  if (existing)
    redirect('/admin/students/new?error=A+student+with+that+ID+already+exists');

  db.prepare(
    'INSERT INTO students (student_id, full_name, class_name, gender, term, year) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(studentId, fullName, className, gender, term, year);

  revalidatePath('/admin/students');
  redirect('/admin/students?success=Student+added+successfully');
}

export async function updateStudent(id: number, formData: FormData) {
  await requireAdmin();

  const studentId = (formData.get('student_id') as string).trim().toUpperCase();
  const fullName  = (formData.get('full_name')  as string).trim();
  const className = (formData.get('class_name') as string).trim();
  const gender    = (formData.get('gender')     as string).trim();
  const term      = parseInt(formData.get('term') as string, 10);
  const year      = parseInt(formData.get('year') as string, 10);

  if (!studentId || !fullName || !className || !gender || !term || !year)
    redirect(`/admin/students/${id}?error=All+fields+are+required`);

  const db = getDb();
  const conflict = db.prepare('SELECT id FROM students WHERE student_id = ? AND id != ?').get(studentId, id);
  if (conflict)
    redirect(`/admin/students/${id}?error=That+student+ID+is+already+in+use`);

  db.prepare(
    'UPDATE students SET student_id = ?, full_name = ?, class_name = ?, gender = ?, term = ?, year = ? WHERE id = ?'
  ).run(studentId, fullName, className, gender, term, year, id);

  revalidatePath('/admin/students');
  redirect('/admin/students?success=Student+updated+successfully');
}

export async function deleteStudent(formData: FormData) {
  await requireAdmin();

  const id = parseInt(formData.get('id') as string, 10);
  const db = getDb();

  // Cascade deletes for scores, attendance, remarks
  db.prepare('DELETE FROM scores     WHERE student_id = ?').run(id);
  db.prepare('DELETE FROM attendance WHERE student_id = ?').run(id);
  db.prepare('DELETE FROM remarks    WHERE student_id = ?').run(id);
  db.prepare('DELETE FROM students   WHERE id = ?').run(id);

  revalidatePath('/admin/students');
  redirect('/admin/students?success=Student+deleted+successfully');
}
