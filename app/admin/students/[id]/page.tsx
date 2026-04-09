import Link from 'next/link';
import { notFound } from 'next/navigation';
import getDb from '@/lib/db';
import { Alert, PageHeader } from '@/components/admin/FormField';
import { updateStudent } from '../actions';

const NAVY = '#0d1b2a';

type PageProps = {
  params:       Promise<{ id: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
};

function getStudent(id: number) {
  return getDb()
    .prepare('SELECT * FROM students WHERE id = ?')
    .get(id) as {
      id: number; student_id: string; full_name: string;
      class_name: string; gender: string; term: number; year: number;
    } | undefined;
}

function getClasses(): string[] {
  return (getDb()
    .prepare('SELECT DISTINCT class_name FROM students ORDER BY class_name')
    .all() as { class_name: string }[])
    .map(r => r.class_name);
}

const CURRENT_YEAR = new Date().getFullYear();

export default async function EditStudentPage({ params, searchParams }: PageProps) {
  const { id: idStr } = await params;
  const sp            = await searchParams;
  const id            = parseInt(idStr, 10);
  const student       = getStudent(id);
  if (!student) notFound();

  const classes = getClasses();

  // Bind server action to this student's id
  const update = updateStudent.bind(null, id);

  return (
    <div className="max-w-xl">
      <PageHeader
        title="Edit Student"
        subtitle={student.full_name}
        action={
          <Link href="/admin/students" className="text-sm text-gray-500 hover:underline">
            ← Back
          </Link>
        }
      />

      {sp.success && <div className="mb-5"><Alert type="success" message={decodeURIComponent(sp.success)} /></div>}
      {sp.error   && <div className="mb-5"><Alert type="error"   message={decodeURIComponent(sp.error)}   /></div>}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6">
        <form action={update} className="space-y-4">

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
              Student ID <span className="text-red-400">*</span>
            </label>
            <input
              name="student_id"
              defaultValue={student.student_id}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1b2a]/20 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
              Full Name <span className="text-red-400">*</span>
            </label>
            <input
              name="full_name"
              defaultValue={student.full_name}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1b2a]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
              Class <span className="text-red-400">*</span>
            </label>
            <input
              name="class_name"
              list="class-list"
              defaultValue={student.class_name}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1b2a]/20"
            />
            <datalist id="class-list">
              {classes.map(c => <option key={c} value={c} />)}
            </datalist>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
              Gender <span className="text-red-400">*</span>
            </label>
            <select
              name="gender"
              defaultValue={student.gender}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1b2a]/20"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
                Term <span className="text-red-400">*</span>
              </label>
              <select
                name="term"
                defaultValue={String(student.term)}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1b2a]/20"
              >
                <option value="1">Term 1</option>
                <option value="2">Term 2</option>
                <option value="3">Term 3</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
                Academic Year <span className="text-red-400">*</span>
              </label>
              <select
                name="year"
                defaultValue={String(student.year)}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1b2a]/20"
              >
                {[CURRENT_YEAR - 2, CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white"
              style={{ backgroundColor: NAVY }}
            >
              Save Changes
            </button>
            <Link
              href="/admin/students"
              className="px-6 py-2.5 rounded-lg text-sm font-medium border border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
