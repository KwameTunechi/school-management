import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import getDb from '@/lib/db';
import { saveClassRemarks } from '../actions';

interface StudentRemark {
  id: number;
  student_id: string;
  full_name: string;
  class_teacher_remark: string | null;
  next_term_begins: string | null;
}

function getStudents(teacherId: number, className: string): StudentRemark[] {
  // Verify teacher is assigned to this class
  const assigned = getDb()
    .prepare('SELECT id FROM teacher_assignments WHERE teacher_id = ? AND class_name = ? LIMIT 1')
    .get(teacherId, className);
  if (!assigned) return [];

  return getDb().prepare(`
    SELECT
      s.id,
      s.student_id,
      s.full_name,
      r.class_teacher_remark,
      r.next_term_begins
    FROM students s
    LEFT JOIN remarks r ON r.student_id = s.id
    WHERE s.class_name = ?
    ORDER BY s.full_name
  `).all(className) as StudentRemark[];
}

type PageProps = {
  params:       Promise<{ classId: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
};

export default async function ClassRemarksPage({ params, searchParams }: PageProps) {
  const { classId } = await params;
  const sp          = await searchParams;
  const className   = decodeURIComponent(classId);
  const session     = await getServerSession(authOptions);
  const teacherId   = parseInt(session!.user.id);
  const students    = getStudents(teacherId, className);

  if (students.length === 0) notFound();

  const save           = saveClassRemarks.bind(null, className);
  const nextTermBegins = students.find(s => s.next_term_begins)?.next_term_begins ?? '';

  return (
    <div>
      <Link
        href="/teacher/remarks"
        className="inline-flex items-center gap-1.5 text-xs font-semibold mb-5"
        style={{ color: '#9ca3af' }}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </Link>

      <div className="mb-5">
        <h1 className="text-2xl font-bold" style={{ color: '#0d1b2a' }}>{className}</h1>
        <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>{students.length} student{students.length !== 1 ? 's' : ''} · Remarks</p>
      </div>

      {sp.success && (
        <div className="mb-4 flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a' }}>
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {decodeURIComponent(sp.success)}
        </div>
      )}

      <form action={save} className="space-y-3">
        <input type="hidden" name="studentCount" value={students.length} />

        {/* Next term begins */}
        <div className="bg-white rounded-2xl px-5 py-4" style={{ border: '1px solid #ebebeb' }}>
          <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#9ca3af' }}>
            Next Term Begins
          </label>
          <input
            type="text"
            name="next_term_begins"
            defaultValue={nextTermBegins}
            placeholder="e.g. Monday, 14th January, 2026"
            className="w-full px-4 py-2.5 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#c9952a]/20 focus:border-[#c9952a]"
            style={{ border: '1px solid #e8eaed' }}
          />
          <p className="text-xs mt-1.5" style={{ color: '#9ca3af' }}>Applies to all students in this class.</p>
        </div>

        {/* Student remarks */}
        {students.map((s, i) => (
          <div key={s.id} className="bg-white rounded-2xl px-5 py-4" style={{ border: '1px solid #ebebeb' }}>
            <input type="hidden" name={`studentDbId_${i}`} value={s.id} />
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
                style={{ backgroundColor: '#f5f5f5', color: '#0d1b2a' }}
              >
                {s.full_name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: '#0d1b2a' }}>{s.full_name}</p>
                <p className="text-xs font-mono" style={{ color: '#9ca3af' }}>{s.student_id}</p>
              </div>
            </div>
            <textarea
              name={`remark_${i}`}
              defaultValue={s.class_teacher_remark ?? ''}
              rows={2}
              placeholder="Write a remark for this student…"
              className="w-full px-4 py-2.5 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#c9952a]/20 focus:border-[#c9952a] resize-none"
              style={{ border: '1px solid #e8eaed' }}
            />
          </div>
        ))}

        {/* Save */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: '#0d1b2a' }}
          >
            Save Remarks
          </button>
        </div>
      </form>
    </div>
  );
}
