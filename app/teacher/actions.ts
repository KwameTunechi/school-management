'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import getDb from '@/lib/db';

async function requireTeacher() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'teacher') throw new Error('Unauthorized');
  return parseInt(session.user.id, 10);
}

// ── Save marks ────────────────────────────────────────────────────────────────
export async function saveMarks(
  subjectId: number,
  className: string,
  formData: FormData
) {
  const teacherId = await requireTeacher();

  // Verify assignment
  const assignment = getDb()
    .prepare('SELECT id FROM teacher_assignments WHERE teacher_id = ? AND subject_id = ? AND class_name = ?')
    .get(teacherId, subjectId, className);
  if (!assignment) throw new Error('Not authorised for this class/subject');

  const count = parseInt(formData.get('studentCount') as string, 10);
  const db = getDb();

  const update = db.prepare(
    'UPDATE scores SET class_score = ?, exam_score = ?, teacher_remark = ? WHERE student_id = ? AND subject_id = ?'
  );
  const insert = db.prepare(
    'INSERT INTO scores (student_id, subject_id, class_score, exam_score, teacher_remark) VALUES (?, ?, ?, ?, ?)'
  );
  const existing = db.prepare('SELECT id FROM scores WHERE student_id = ? AND subject_id = ?');

  const saveAll = db.transaction(() => {
    for (let i = 0; i < count; i++) {
      const studentDbId = parseInt(formData.get(`studentDbId_${i}`) as string, 10);
      const rawClass    = formData.get(`classScore_${i}`) as string;
      const rawExam     = formData.get(`examScore_${i}`)  as string;
      const remark      = (formData.get(`remark_${i}`)    as string).trim() || null;

      const classScore = parseFloat(rawClass);
      const examScore  = parseFloat(rawExam);

      if (isNaN(classScore) || classScore < 0 || classScore > 30) continue;
      if (isNaN(examScore)  || examScore  < 0 || examScore  > 70) continue;

      const row = existing.get(studentDbId, subjectId) as { id: number } | undefined;
      if (row) {
        update.run(classScore, examScore, remark, studentDbId, subjectId);
      } else {
        insert.run(studentDbId, subjectId, classScore, examScore, remark);
      }
    }
  });

  saveAll();
  revalidatePath(`/teacher/marks/${encodeURIComponent(className)}/${subjectId}`);
  redirect(`/teacher/marks/${encodeURIComponent(className)}/${subjectId}?success=Scores+saved+successfully`);
}

// ── Save attendance ───────────────────────────────────────────────────────────
export async function saveAttendance(className: string, formData: FormData) {
  const teacherId = await requireTeacher();

  // Verify teacher has at least one assignment in this class
  const assigned = getDb()
    .prepare('SELECT id FROM teacher_assignments WHERE teacher_id = ? AND class_name = ? LIMIT 1')
    .get(teacherId, className);
  if (!assigned) throw new Error('Not authorised for this class');

  const count = parseInt(formData.get('studentCount') as string, 10);
  const term  = parseInt(formData.get('term')         as string, 10);
  const year  = parseInt(formData.get('year')         as string, 10);
  const db    = getDb();

  const update = db.prepare(
    'UPDATE attendance SET days_present = ?, total_days = ?, term = ?, year = ? WHERE student_id = ?'
  );
  const insert = db.prepare(
    'INSERT INTO attendance (student_id, term, year, days_present, total_days) VALUES (?, ?, ?, ?, ?)'
  );
  const existing = db.prepare('SELECT id FROM attendance WHERE student_id = ?');

  const saveAll = db.transaction(() => {
    for (let i = 0; i < count; i++) {
      const studentDbId = parseInt(formData.get(`studentDbId_${i}`) as string, 10);
      const daysPresent = parseInt(formData.get(`daysPresent_${i}`) as string, 10);
      const totalDays   = parseInt(formData.get(`totalDays_${i}`)   as string, 10);

      if (isNaN(daysPresent) || isNaN(totalDays)) continue;
      if (daysPresent < 0 || totalDays < 1 || daysPresent > totalDays) continue;

      const row = existing.get(studentDbId) as { id: number } | undefined;
      if (row) {
        update.run(daysPresent, totalDays, term, year, studentDbId);
      } else {
        insert.run(studentDbId, term, year, daysPresent, totalDays);
      }
    }
  });

  saveAll();
  revalidatePath(`/teacher/attendance/${encodeURIComponent(className)}`);
  redirect(`/teacher/attendance/${encodeURIComponent(className)}?success=Attendance+saved+successfully`);
}

// ── Update teacher profile ────────────────────────────────────────────────────
export async function updateProfile(formData: FormData) {
  const teacherId = await requireTeacher();
  const fullName  = (formData.get('full_name') as string).trim();
  const phone     = (formData.get('phone')     as string).trim() || null;

  if (!fullName) redirect('/teacher/profile?error=Name+is+required');

  getDb().prepare('UPDATE users SET full_name = ?, phone = ? WHERE id = ?')
    .run(fullName, phone, teacherId);

  revalidatePath('/teacher/profile');
  redirect('/teacher/profile?success=Profile+updated');
}
