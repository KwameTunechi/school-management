'use server';

import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import getDb from '@/lib/db';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') throw new Error('Unauthorized');
}

// ── Create ───────────────────────────────────────────────────────────────────
export async function createTeacher(formData: FormData) {
  await requireAdmin();

  const fullName = (formData.get('full_name') as string).trim();
  const email    = (formData.get('email')     as string).trim().toLowerCase();
  const phone    = (formData.get('phone')     as string | null)?.trim() || null;
  const password = formData.get('password')   as string;

  if (!fullName || !email || !password)
    redirect('/admin/teachers/new?error=All+required+fields+must+be+filled');

  if (password.length < 6)
    redirect('/admin/teachers/new?error=Password+must+be+at+least+6+characters');

  const db = getDb();
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing)
    redirect('/admin/teachers/new?error=A+user+with+that+email+already+exists');

  const hash = await bcrypt.hash(password, 12);
  db.prepare(
    'INSERT INTO users (email, password_hash, full_name, role, phone) VALUES (?, ?, ?, ?, ?)'
  ).run(email, hash, fullName, 'teacher', phone);

  revalidatePath('/admin/teachers');
  redirect('/admin/teachers?success=Teacher+account+created+successfully');
}

// ── Update ───────────────────────────────────────────────────────────────────
export async function updateTeacher(id: number, formData: FormData) {
  await requireAdmin();

  const fullName = (formData.get('full_name') as string).trim();
  const email    = (formData.get('email')     as string).trim().toLowerCase();
  const phone    = (formData.get('phone')     as string | null)?.trim() || null;

  if (!fullName || !email)
    redirect(`/admin/teachers/${id}?error=Name+and+email+are+required`);

  const db = getDb();
  const conflict = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, id);
  if (conflict)
    redirect(`/admin/teachers/${id}?error=That+email+is+already+in+use`);

  db.prepare('UPDATE users SET full_name = ?, email = ?, phone = ? WHERE id = ?')
    .run(fullName, email, phone, id);

  revalidatePath('/admin/teachers');
  redirect('/admin/teachers?success=Teacher+updated+successfully');
}

// ── Reset password ────────────────────────────────────────────────────────────
export async function resetPassword(id: number, formData: FormData) {
  await requireAdmin();

  const newPassword = formData.get('new_password') as string;
  if (!newPassword || newPassword.length < 6)
    redirect(`/admin/teachers/${id}?error=Password+must+be+at+least+6+characters#reset-password`);

  const hash = await bcrypt.hash(newPassword, 12);
  getDb().prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, id);

  revalidatePath(`/admin/teachers/${id}`);
  redirect(`/admin/teachers/${id}?success=Password+reset+successfully`);
}

// ── Assignments ───────────────────────────────────────────────────────────────
export async function addAssignment(teacherId: number, formData: FormData) {
  await requireAdmin();

  const subjectId = parseInt(formData.get('subject_id') as string, 10);
  const className = (formData.get('class_name') as string).trim();

  if (!subjectId || !className)
    redirect(`/admin/teachers/${teacherId}/assignments?error=Subject+and+class+are+required`);

  const db = getDb();
  try {
    db.prepare(
      'INSERT INTO teacher_assignments (teacher_id, subject_id, class_name) VALUES (?, ?, ?)'
    ).run(teacherId, subjectId, className);
  } catch {
    redirect(`/admin/teachers/${teacherId}/assignments?error=That+assignment+already+exists`);
  }

  revalidatePath(`/admin/teachers/${teacherId}/assignments`);
  redirect(`/admin/teachers/${teacherId}/assignments?success=Assignment+added`);
}

export async function deleteAssignment(formData: FormData) {
  await requireAdmin();

  const assignmentId = parseInt(formData.get('assignment_id') as string, 10);
  const teacherId    = parseInt(formData.get('teacher_id')    as string, 10);

  getDb().prepare('DELETE FROM teacher_assignments WHERE id = ?').run(assignmentId);

  revalidatePath(`/admin/teachers/${teacherId}/assignments`);
  redirect(`/admin/teachers/${teacherId}/assignments`);
}
