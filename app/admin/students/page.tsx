import Link from 'next/link';
import getDb from '@/lib/db';
import { Alert, PageHeader } from '@/components/admin/FormField';
import { DeleteButton } from '@/components/DeleteButton';
import { deleteStudent } from './actions';

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
        subtitle={`${students.length} student${students.length !== 1 ? 's' : ''} enrolled`}
        action={
          <Link
            href="/admin/students/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-95"
            style={{ backgroundColor: '#0d1b2a', boxShadow: '0 2px 8px rgba(13,27,42,0.2)' }}
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
          className="flex-1 px-4 py-2.5 rounded-xl border text-sm bg-white outline-none transition-all"
          style={{ borderColor: '#e8eaed' }}
        />
        <select
          name="class"
          defaultValue={classFilter}
          className="px-3 py-2.5 rounded-xl border text-sm bg-white outline-none"
          style={{ borderColor: '#e8eaed', color: '#374151' }}
        >
          <option value="">All Classes</option>
          {classes.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
          style={{ backgroundColor: '#0d1b2a' }}
        >
          Filter
        </button>
        {(search || classFilter) && (
          <Link
            href="/admin/students"
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-center"
            style={{ border: '1px solid #e8eaed', color: '#6b7280', backgroundColor: '#ffffff' }}
          >
            Clear
          </Link>
        )}
      </form>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {students.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center text-sm" style={{ border: '1px solid #e8eaed', color: '#9ca3af' }}>
            No students found.
          </div>
        ) : students.map((s) => (
          <div key={s.id} className="bg-white rounded-2xl p-4" style={{ border: '1px solid #e8eaed' }}>
            <div className="flex items-start justify-between mb-2.5">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}
                >
                  {s.full_name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: '#0d1b2a' }}>{s.full_name}</p>
                  <p className="text-xs font-mono mt-0.5" style={{ color: '#9ca3af' }}>{s.student_id}</p>
                </div>
              </div>
              <span
                className="text-xs font-medium px-2.5 py-1 rounded-lg"
                style={{ backgroundColor: '#f7f8fa', color: '#6b7280' }}
              >
                {s.class_name}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs mb-3" style={{ color: '#9ca3af' }}>
              <span>{s.gender}</span>
              <span>·</span>
              <span>Term {s.term}, {s.year}</span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/admin/students/${s.id}`}
                className="flex-1 text-center py-2 rounded-xl text-xs font-semibold"
                style={{ border: '1px solid #e8eaed', color: '#374151', backgroundColor: '#ffffff' }}
              >
                Edit
              </Link>
              <Link
                href={`/reports/${s.student_id}`}
                className="flex-1 text-center py-2 rounded-xl text-xs font-semibold text-white"
                style={{ backgroundColor: '#0d1b2a' }}
              >
                Report
              </Link>
              <form action={deleteStudent}>
                <input type="hidden" name="id" value={s.id} />
                <DeleteButton
                  message={`Delete ${s.full_name}? This cannot be undone.`}
                  className="py-2 px-3 rounded-xl text-xs font-semibold"
                  style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}
                >
                  Delete
                </DeleteButton>
              </form>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #e8eaed' }}>
        {students.length === 0 ? (
          <div className="p-12 text-center" style={{ color: '#9ca3af' }}>No students found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#f7f8fa', borderBottom: '1px solid #e8eaed' }}>
                <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Student ID</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Full Name</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Class</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Gender</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider hidden lg:table-cell" style={{ color: '#9ca3af' }}>Term / Year</th>
                <th className="text-center px-5 py-3.5 text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <tr
                  key={s.id}
                  className="transition-colors hover:bg-gray-50"
                  style={{ borderTop: i === 0 ? 'none' : '1px solid #f3f4f6' }}
                >
                  <td className="px-5 py-3.5 font-mono text-xs" style={{ color: '#9ca3af' }}>{s.student_id}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                        style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}
                      >
                        {s.full_name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()}
                      </div>
                      <span className="font-medium" style={{ color: '#0d1b2a' }}>{s.full_name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className="text-xs font-medium px-2.5 py-1 rounded-lg"
                      style={{ backgroundColor: '#f7f8fa', color: '#6b7280' }}
                    >
                      {s.class_name}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm" style={{ color: '#6b7280' }}>{s.gender}</td>
                  <td className="px-5 py-3.5 text-sm hidden lg:table-cell" style={{ color: '#9ca3af' }}>Term {s.term}, {s.year}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/admin/students/${s.id}`}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors hover:bg-gray-100"
                        style={{ border: '1px solid #e8eaed', color: '#374151', backgroundColor: '#f7f8fa' }}
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/reports/${s.student_id}`}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                        style={{ backgroundColor: '#0d1b2a' }}
                      >
                        Report
                      </Link>
                      <form action={deleteStudent}>
                        <input type="hidden" name="id" value={s.id} />
                        <DeleteButton
                          message={`Delete ${s.full_name}? This cannot be undone.`}
                          className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold"
                          style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}
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
