import Link from 'next/link';
import getDb from '@/lib/db';
import { Alert, FormField, PageHeader } from '@/components/admin/FormField';
import { createStudent } from '../actions';

const NAVY = '#0d1b2a';

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

function getClasses(): string[] {
  return (getDb()
    .prepare('SELECT DISTINCT class_name FROM students ORDER BY class_name')
    .all() as { class_name: string }[])
    .map(r => r.class_name);
}

const CURRENT_YEAR = new Date().getFullYear();

export default async function NewStudentPage({ searchParams }: PageProps) {
  const sp      = await searchParams;
  const classes = getClasses();

  return (
    <div className="max-w-xl">
      <PageHeader
        title="Add Student"
        subtitle="Create a new student record"
        action={
          <Link href="/admin/students" className="text-sm text-gray-500 hover:underline">
            ← Back
          </Link>
        }
      />

      {sp.error && <div className="mb-5"><Alert type="error" message={decodeURIComponent(sp.error)} /></div>}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6">
        <form action={createStudent} className="space-y-4">

          <FormField
            label="Student ID"
            name="student_id"
            required
            placeholder="e.g. KG2024001"
            hint="Must be unique. Will be uppercased automatically."
          />

          <FormField
            label="Full Name"
            name="full_name"
            required
            placeholder="e.g. Kwame Mensah"
          />

          {/* Class name — select from existing or type new */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
              Class <span className="text-red-400">*</span>
            </label>
            <input
              name="class_name"
              list="class-list"
              required
              placeholder={classes.length ? 'Select or type class name' : 'e.g. Class 5A'}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1b2a]/20"
            />
            {classes.length > 0 && (
              <datalist id="class-list">
                {classes.map(c => <option key={c} value={c} />)}
              </datalist>
            )}
          </div>

          {/* Gender */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
              Gender <span className="text-red-400">*</span>
            </label>
            <select
              name="gender"
              required
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1b2a]/20"
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          {/* Term + Year */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
                Term <span className="text-red-400">*</span>
              </label>
              <select
                name="term"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1b2a]/20"
              >
                <option value="">Select</option>
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
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1b2a]/20"
              >
                <option value="">Select</option>
                {[CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1].map(y => (
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
              Add Student
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
