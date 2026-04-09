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

export async function saveClassRemarks(className: string, formData: FormData) {
  const teacherId = await requireTeacher();

  // Verify the teacher is assigned to this class
  const assigned = getDb()
    .prepare('SELECT id FROM teacher_assignments WHERE teacher_id = ? AND class_name = ? LIMIT 1')
    .get(teacherId, className);
  if (!assigned) throw new Error('Not authorised for this class');

  const count          = parseInt(formData.get('studentCount') as string, 10);
  const nextTermBegins = (formData.get('next_term_begins') as string)?.trim() || null;
  const db             = getDb();

  const upsert = db.prepare(`
    INSERT INTO remarks (student_id, class_teacher_remark, next_term_begins)
    VALUES (?, ?, ?)
    ON CONFLICT(student_id) DO UPDATE SET
      class_teacher_remark = excluded.class_teacher_remark,
      next_term_begins     = COALESCE(next_term_begins, excluded.next_term_begins)
  `);

  const saveAll = db.transaction(() => {
    for (let i = 0; i < count; i++) {
      const studentDbId        = parseInt(formData.get(`studentDbId_${i}`) as string, 10);
      const classTeacherRemark = (formData.get(`remark_${i}`) as string)?.trim() || null;
      if (isNaN(studentDbId)) continue;
      upsert.run(studentDbId, classTeacherRemark, nextTermBegins);
    }
  });

  saveAll();
  revalidatePath(`/teacher/remarks/${encodeURIComponent(className)}`);
  redirect(`/teacher/remarks/${encodeURIComponent(className)}?success=Remarks+saved+successfully`);
}
