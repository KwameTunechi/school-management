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

export async function saveRemarks(className: string, formData: FormData) {
  await requireAdmin();

  const count         = parseInt(formData.get('studentCount') as string, 10);
  const nextTermBegins = (formData.get('next_term_begins') as string)?.trim() || null;
  const db            = getDb();

  const upsert = db.prepare(`
    INSERT INTO remarks (student_id, class_teacher_remark, head_teacher_remark, next_term_begins)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(student_id) DO UPDATE SET
      class_teacher_remark = excluded.class_teacher_remark,
      head_teacher_remark  = excluded.head_teacher_remark,
      next_term_begins     = excluded.next_term_begins
  `);

  const saveAll = db.transaction(() => {
    for (let i = 0; i < count; i++) {
      const studentDbId        = parseInt(formData.get(`studentDbId_${i}`) as string, 10);
      const classTeacherRemark = (formData.get(`classTeacherRemark_${i}`) as string)?.trim() || null;
      const headTeacherRemark  = (formData.get(`headTeacherRemark_${i}`)  as string)?.trim() || null;
      if (isNaN(studentDbId)) continue;
      upsert.run(studentDbId, classTeacherRemark, headTeacherRemark, nextTermBegins);
    }
  });

  saveAll();
  revalidatePath('/admin/remarks');
  redirect(`/admin/remarks?class=${encodeURIComponent(className)}&success=Remarks+saved+successfully`);
}
