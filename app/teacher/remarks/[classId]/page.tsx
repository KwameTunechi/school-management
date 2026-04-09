import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import getDb from '@/lib/db';
import { saveClassRemarks } from '../actions';

const NAVY = '#0d1b2a';
const GOLD  = '#c9952a';

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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/teacher/remarks" className="text-xs text-gray-500 hover:underline mb-1 block">
            ← Back to Remarks
          </Link>
          <h1 className="text-xl font-bold text-gray-900">{className} — Remarks</h1>
          <p className="text-sm text-gray-500 mt-0.5">{students.length} student{students.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {sp.success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {decodeURIComponent(sp.success)}
        </div>
      )}

      <form action={save}>
        <input type="hidden" name="studentCount" value={students.length} />

        {/* Next term begins */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5 mb-4">
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
            Next Term Begins
          </label>
          <input
            type="text"
            name="next_term_begins"
            defaultValue={nextTermBegins}
            placeholder="e.g. Monday, 14th January, 2026"
            className="w-full sm:w-80 px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1b2a]/20"
          />
          <p className="text-xs text-gray-400 mt-1">Applies to all students in this class.</p>
        </div>

        {/* Student remarks */}
        <div className="space-y-3">
          {students.map((s, i) => (
            <div key={s.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5">
              <input type="hidden" name={`studentDbId_${i}`} value={s.id} />

              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ backgroundColor: GOLD + '22', color: NAVY }}
                >
                  {s.full_name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{s.full_name}</p>
                  <p className="text-xs text-gray-400 font-mono">{s.student_id}</p>
                </div>
              </div>

              <label className="block text-xs font-medium text-gray-500 mb-1">
                Class Teacher Remark
              </label>
              <textarea
                name={`remark_${i}`}
                defaultValue={s.class_teacher_remark ?? ''}
                rows={2}
                placeholder="e.g. A dedicated student who shows great potential…"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1b2a]/20 resize-none"
              />
            </div>
          ))}
        </div>

        {/* Sticky save button */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3 mt-6 -mx-4 sm:-mx-6 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white shadow"
            style={{ backgroundColor: NAVY }}
          >
            Save Remarks
          </button>
        </div>
      </form>
    </div>
  );
}
