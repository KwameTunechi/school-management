import Link from 'next/link';
import { notFound } from 'next/navigation';
import getDb from '@/lib/db';
import { addAssignment, deleteAssignment } from '../../actions';
import { Alert, PageHeader } from '@/components/admin/FormField';

const NAVY = '#0d1b2a';
const GOLD = '#c9952a';

interface Teacher { id: number; full_name: string; email: string }
interface Subject  { id: number; name: string; code: string }
interface Assignment {
  id: number;
  subject_name: string;
  subject_code: string;
  class_name: string;
}

function getData(teacherId: number) {
  const db = getDb();

  const teacher = db
    .prepare("SELECT id, full_name, email FROM users WHERE id = ? AND role = 'teacher'")
    .get(teacherId) as Teacher | undefined;

  if (!teacher) return null;

  const subjects = db
    .prepare('SELECT id, name, code FROM subjects ORDER BY name')
    .all() as Subject[];

  const assignments = db.prepare(`
    SELECT ta.id, sub.name as subject_name, sub.code as subject_code, ta.class_name
    FROM teacher_assignments ta
    JOIN subjects sub ON sub.id = ta.subject_id
    WHERE ta.teacher_id = ?
    ORDER BY ta.class_name, sub.name
  `).all(teacherId) as Assignment[];

  return { teacher, subjects, assignments };
}

export default async function AssignmentsPage(props: PageProps<'/admin/teachers/[id]/assignments'>) {
  const { id } = await props.params;
  const { error, success } = await props.searchParams as { error?: string; success?: string };

  const teacherId = parseInt(id, 10);
  const data = getData(teacherId);
  if (!data) notFound();

  const { teacher, subjects, assignments } = data;
  const addWithId    = addAssignment.bind(null, teacherId);
  const deleteAction = deleteAssignment;

  // Group assignments by class for display
  const byClass = assignments.reduce<Record<string, Assignment[]>>((acc, a) => {
    (acc[a.class_name] ??= []).push(a);
    return acc;
  }, {});

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        title="Subject Assignments"
        subtitle={`${teacher.full_name} · ${assignments.length} assignment${assignments.length !== 1 ? 's' : ''}`}
        action={
          <div className="flex items-center gap-3">
            <Link
              href={`/admin/teachers/${teacherId}`}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← Edit profile
            </Link>
            <Link
              href="/admin/teachers"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              All teachers
            </Link>
          </div>
        }
      />

      {success && <Alert type="success" message={decodeURIComponent(success)} />}
      {error   && <Alert type="error"   message={decodeURIComponent(error)}   />}

      {/* ── Current assignments ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800 text-sm">Current Assignments</h2>
        </div>

        {assignments.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-gray-400 text-sm">No subjects assigned yet.</p>
            <p className="text-gray-400 text-xs mt-1">Use the form below to add assignments.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {Object.entries(byClass).map(([className, items]) => (
              <div key={className} className="px-5 py-3">
                <p
                  className="text-xs font-bold uppercase tracking-wide mb-2"
                  style={{ color: NAVY }}
                >
                  {className}
                </p>
                <div className="space-y-1.5">
                  {items.map((a) => (
                    <div key={a.id} className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs px-2 py-0.5 rounded-md font-mono font-semibold"
                          style={{ backgroundColor: GOLD + '22', color: NAVY }}
                        >
                          {a.subject_code}
                        </span>
                        <span className="text-sm text-gray-700">{a.subject_name}</span>
                      </div>
                      {/* Delete form */}
                      <form action={deleteAction}>
                        <input type="hidden" name="assignment_id" value={a.id} />
                        <input type="hidden" name="teacher_id"    value={teacherId} />
                        <button
                          type="submit"
                          className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Remove
                        </button>
                      </form>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Add assignment form ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="font-semibold text-gray-800 text-sm mb-4 pb-2 border-b border-gray-100">
          Add Assignment
        </h2>

        <form action={addWithId} className="space-y-4">
          {/* Subject dropdown */}
          <div>
            <label
              htmlFor="subject_id"
              className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5"
            >
              Subject <span className="text-red-400">*</span>
            </label>
            <select
              id="subject_id"
              name="subject_id"
              required
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900
                bg-white focus:outline-none focus:ring-2 focus:ring-[#0d1b2a]/20 focus:border-[#0d1b2a] transition-colors"
            >
              <option value="">Select a subject…</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          {/* Class name */}
          <div>
            <label
              htmlFor="class_name"
              className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5"
            >
              Class Name <span className="text-red-400">*</span>
            </label>
            <input
              id="class_name"
              name="class_name"
              type="text"
              required
              placeholder="e.g. Class 6A"
              list="class-suggestions"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900
                placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0d1b2a]/20 focus:border-[#0d1b2a] transition-colors"
            />
            {/* Suggestions from existing classes */}
            <datalist id="class-suggestions">
              {Array.from(new Set(assignments.map(a => a.class_name))).map(c => (
                <option key={c} value={c} />
              ))}
              <option value="Class 6A" />
              <option value="Class 6B" />
            </datalist>
            <p className="text-xs text-gray-400 mt-1">Type or select from suggestions.</p>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: NAVY }}
          >
            Add Assignment
          </button>
        </form>
      </div>

    </div>
  );
}
