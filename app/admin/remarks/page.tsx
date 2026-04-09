import getDb from '@/lib/db';
import { Alert, PageHeader } from '@/components/admin/FormField';
import { saveRemarks } from './actions';

const NAVY = '#0d1b2a';
const GOLD  = '#c9952a';

interface StudentRemark {
  id: number;
  student_id: string;
  full_name: string;
  class_teacher_remark: string | null;
  head_teacher_remark: string | null;
  next_term_begins: string | null;
}

function getClasses(): string[] {
  return (getDb()
    .prepare('SELECT DISTINCT class_name FROM students ORDER BY class_name')
    .all() as { class_name: string }[])
    .map(r => r.class_name);
}

function getStudentsWithRemarks(className: string): StudentRemark[] {
  return getDb().prepare(`
    SELECT
      s.id,
      s.student_id,
      s.full_name,
      r.class_teacher_remark,
      r.head_teacher_remark,
      r.next_term_begins
    FROM students s
    LEFT JOIN remarks r ON r.student_id = s.id
    WHERE s.class_name = ?
    ORDER BY s.full_name
  `).all(className) as StudentRemark[];
}

type PageProps = {
  searchParams: Promise<{ class?: string; success?: string; error?: string }>;
};

export default async function RemarksPage({ searchParams }: PageProps) {
  const sp          = await searchParams;
  const classes     = getClasses();
  const className   = sp.class ?? classes[0] ?? '';
  const students    = className ? getStudentsWithRemarks(className) : [];

  // Next term date (take from first student with it, or empty)
  const nextTermBegins = students.find(s => s.next_term_begins)?.next_term_begins ?? '';

  const save = className ? saveRemarks.bind(null, className) : async () => {};

  return (
    <div>
      <PageHeader
        title="Remarks"
        subtitle="Set class teacher and head teacher remarks for each student"
      />

      {sp.success && <div className="mb-4"><Alert type="success" message={decodeURIComponent(sp.success)} /></div>}
      {sp.error   && <div className="mb-4"><Alert type="error"   message={decodeURIComponent(sp.error)}   /></div>}

      {/* Class selector */}
      <form method="GET" className="flex gap-3 mb-5">
        <select
          name="class"
          defaultValue={className}
          className="flex-1 sm:flex-none sm:w-56 px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1b2a]/20"
          onChange={(e) => {
            // This is a server form, use normal submit
          }}
        >
          {classes.length === 0 && <option value="">No classes</option>}
          {classes.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button
          type="submit"
          className="px-5 py-2.5 rounded-lg text-sm font-medium text-white"
          style={{ backgroundColor: NAVY }}
        >
          Load
        </button>
      </form>

      {!className ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500 text-sm">
          No students found. Add students first.
        </div>
      ) : (
        <form action={save}>
          <input type="hidden" name="studentCount" value={students.length} />

          {/* Next term begins — applies to whole class */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-4">
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
              Next Term Begins (applies to all students in {className})
            </label>
            <input
              type="text"
              name="next_term_begins"
              defaultValue={nextTermBegins}
              placeholder="e.g. Monday, 14th January, 2026"
              className="w-full sm:w-80 px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1b2a]/20"
            />
          </div>

          {/* Students */}
          <div className="space-y-4">
            {students.map((s, i) => (
              <div key={s.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5">
                <input type="hidden" name={`studentDbId_${i}`} value={s.id} />

                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ backgroundColor: GOLD + '22', color: NAVY }}
                  >
                    {s.full_name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{s.full_name}</p>
                    <p className="text-xs text-gray-400 font-mono">{s.student_id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Class Teacher Remark
                    </label>
                    <textarea
                      name={`classTeacherRemark_${i}`}
                      defaultValue={s.class_teacher_remark ?? ''}
                      rows={2}
                      placeholder="e.g. A hardworking student…"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1b2a]/20 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Head Teacher Remark
                    </label>
                    <textarea
                      name={`headTeacherRemark_${i}`}
                      defaultValue={s.head_teacher_remark ?? ''}
                      rows={2}
                      placeholder="e.g. Keep up the good work…"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1b2a]/20 resize-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {students.length > 0 && (
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3 mt-6 -mx-4 sm:-mx-6 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white shadow-md"
                style={{ backgroundColor: NAVY }}
              >
                Save All Remarks
              </button>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
