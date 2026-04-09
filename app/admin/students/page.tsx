import Link from 'next/link';
import getDb from '@/lib/db';
import { Alert, PageHeader } from '@/components/admin/FormField';
import { DeleteButton } from '@/components/DeleteButton';
import { deleteStudent } from './actions';

const NAVY = '#0d1b2a';
const GOLD  = '#c9952a';

interface StudentRow {
  id: number;
  student_id: string;
  full_name: string;
  class_name: string;
  gender: string;
  term: number;
  year: number;
}

function getStudents(search: string, classFilter: string): StudentRow[] {
  const db = getDb();
  let query = 'SELECT * FROM students WHERE 1=1';
  const params: string[] = [];

  if (search) {
    query += ' AND (full_name LIKE ? OR student_id LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  if (classFilter) {
    query += ' AND class_name = ?';
    params.push(classFilter);
  }
  query += ' ORDER BY class_name, full_name';
  return db.prepare(query).all(...params) as StudentRow[];
}

function getClasses(): string[] {
  return (getDb()
    .prepare('SELECT DISTINCT class_name FROM students ORDER BY class_name')
    .all() as { class_name: string }[])
    .map(r => r.class_name);
}

type PageProps = {
  searchParams: Promise<{ success?: string; error?: string; q?: string; class?: string }>;
};

export default async function StudentsPage({ searchParams }: PageProps) {
  const sp          = await searchParams;
  const search      = sp.q      ?? '';
  const classFilter = sp.class  ?? '';
  const students    = getStudents(search, classFilter);
  const classes     = getClasses();

  return (
    <div>
      <PageHeader
        title="Students"
        subtitle={`${students.length} student${students.length !== 1 ? 's' : ''}`}
        action={
          <Link
            href="/admin/students/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
            style={{ backgroundColor: NAVY }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Student
          </Link>
        }
      />

      {sp.success && <div className="mb-4"><Alert type="success" message={decodeURIComponent(sp.success)} /></div>}
      {sp.error   && <div className="mb-4"><Alert type="error"   message={decodeURIComponent(sp.error)}   /></div>}

      {/* Search + filter */}
      <form method="GET" className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          name="q"
          defaultValue={search}
          placeholder="Search by name or ID…"
          className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1b2a]/20"
        />
        <select
          name="class"
          defaultValue={classFilter}
          className="px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1b2a]/20"
        >
          <option value="">All Classes</option>
          {classes.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button
          type="submit"
          className="px-5 py-2.5 rounded-lg text-sm font-medium text-white"
          style={{ backgroundColor: NAVY }}
        >
          Filter
        </button>
        {(search || classFilter) && (
          <Link href="/admin/students" className="px-5 py-2.5 rounded-lg text-sm border border-gray-300 text-gray-600 text-center">
            Clear
          </Link>
        )}
      </form>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {students.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-500 text-sm">
            No students found.
          </div>
        ) : students.map((s) => (
          <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-gray-900">{s.full_name}</p>
                <p className="text-xs text-gray-400 font-mono mt-0.5">{s.student_id}</p>
              </div>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">{s.class_name}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
              <span>{s.gender}</span>
              <span>·</span>
              <span>Term {s.term}, {s.year}</span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/admin/students/${s.id}`}
                className="flex-1 text-center py-1.5 rounded-lg text-xs font-medium border border-gray-300 text-gray-700"
              >
                Edit
              </Link>
              <Link
                href={`/reports/${s.student_id}`}
                className="flex-1 text-center py-1.5 rounded-lg text-xs font-medium text-white"
                style={{ backgroundColor: NAVY }}
              >
                Report
              </Link>
              <form action={deleteStudent}>
                <input type="hidden" name="id" value={s.id} />
                <DeleteButton
                  message={`Delete ${s.full_name}? This cannot be undone.`}
                  className="py-1.5 px-3 rounded-lg text-xs font-medium bg-red-50 text-red-600 border border-red-200"
                >
                  Delete
                </DeleteButton>
              </form>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {students.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No students found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: NAVY }} className="text-white">
                <th className="text-left px-5 py-3.5 font-medium">Student ID</th>
                <th className="text-left px-5 py-3.5 font-medium">Full Name</th>
                <th className="text-left px-5 py-3.5 font-medium">Class</th>
                <th className="text-left px-5 py-3.5 font-medium">Gender</th>
                <th className="text-left px-5 py-3.5 font-medium hidden lg:table-cell">Term / Year</th>
                <th className="text-center px-5 py-3.5 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs text-gray-600">{s.student_id}</td>
                  <td className="px-5 py-3.5 font-medium text-gray-900">{s.full_name}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">{s.class_name}</span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">{s.gender}</td>
                  <td className="px-5 py-3.5 text-gray-500 hidden lg:table-cell">Term {s.term}, {s.year}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/admin/students/${s.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/reports/${s.student_id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium text-white"
                        style={{ backgroundColor: NAVY }}
                      >
                        Report
                      </Link>
                      <form action={deleteStudent}>
                        <input type="hidden" name="id" value={s.id} />
                        <DeleteButton
                          message={`Delete ${s.full_name}? This cannot be undone.`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                        >
                          Delete
                        </DeleteButton>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
