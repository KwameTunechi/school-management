import Link from 'next/link';
import getDb from '@/lib/db';
import { PageHeader } from '@/components/admin/FormField';

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
  score_count: number;
  has_attendance: number;
  has_remarks: number;
}

function getStudents(search: string, classFilter: string): StudentRow[] {
  const db = getDb();
  let query = `
    SELECT
      s.id,
      s.student_id,
      s.full_name,
      s.class_name,
      s.gender,
      s.term,
      s.year,
      (SELECT COUNT(*) FROM scores sc WHERE sc.student_id = s.id)    AS score_count,
      (SELECT COUNT(*) FROM attendance a WHERE a.student_id = s.id) > 0 AS has_attendance,
      (SELECT COUNT(*) FROM remarks   r WHERE r.student_id = s.id)  > 0 AS has_remarks
    FROM students s
    WHERE 1=1
  `;
  const params: string[] = [];

  if (search) {
    query += ' AND (s.full_name LIKE ? OR s.student_id LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  if (classFilter) {
    query += ' AND s.class_name = ?';
    params.push(classFilter);
  }
  query += ' ORDER BY s.class_name, s.full_name';
  return db.prepare(query).all(...params) as StudentRow[];
}

function getClasses(): string[] {
  return (getDb()
    .prepare('SELECT DISTINCT class_name FROM students ORDER BY class_name')
    .all() as { class_name: string }[])
    .map(r => r.class_name);
}

type PageProps = {
  searchParams: Promise<{ q?: string; class?: string }>;
};

export default async function ReportsPage({ searchParams }: PageProps) {
  const sp          = await searchParams;
  const search      = sp.q     ?? '';
  const classFilter = sp.class ?? '';
  const students    = getStudents(search, classFilter);
  const classes     = getClasses();

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Browse and download student terminal reports"
      />

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
          Search
        </button>
        {(search || classFilter) && (
          <Link href="/admin/reports" className="px-5 py-2.5 rounded-lg text-sm border border-gray-300 text-gray-600 text-center">
            Clear
          </Link>
        )}
      </form>

      <p className="text-xs text-gray-400 mb-4">{students.length} student{students.length !== 1 ? 's' : ''} found</p>

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

            {/* Readiness indicators */}
            <div className="flex gap-2 mb-3">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                s.score_count > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
              }`}>
                {s.score_count > 0 ? `${s.score_count} scores` : 'No scores'}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                s.has_attendance ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
              }`}>
                {s.has_attendance ? 'Attendance ✓' : 'No attendance'}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                s.has_remarks ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
              }`}>
                {s.has_remarks ? 'Remarks ✓' : 'No remarks'}
              </span>
            </div>

            <div className="flex gap-2">
              <Link
                href={`/reports/${s.student_id}`}
                className="flex-1 text-center py-2 rounded-lg text-xs font-medium text-white"
                style={{ backgroundColor: NAVY }}
              >
                View Report
              </Link>
              <Link
                href={`/reports/${s.student_id}/pdf`}
                className="flex-1 text-center py-2 rounded-lg text-xs font-medium border border-gray-300 text-gray-700"
              >
                Download PDF
              </Link>
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
                <th className="text-left px-5 py-3.5 font-medium">Student</th>
                <th className="text-left px-5 py-3.5 font-medium">Class</th>
                <th className="text-left px-5 py-3.5 font-medium hidden lg:table-cell">Term / Year</th>
                <th className="text-left px-5 py-3.5 font-medium">Readiness</th>
                <th className="text-center px-5 py-3.5 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-gray-900">{s.full_name}</p>
                    <p className="text-xs text-gray-400 font-mono">{s.student_id}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">{s.class_name}</span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 hidden lg:table-cell">
                    Term {s.term}, {s.year}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-1 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        s.score_count > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {s.score_count > 0 ? `${s.score_count} scores` : 'No scores'}
                      </span>
                      {s.has_attendance ? (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">Attendance ✓</span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-400">No attendance</span>
                      )}
                      {s.has_remarks ? (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">Remarks ✓</span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-400">No remarks</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/reports/${s.student_id}`}
                        className="px-3 py-1.5 rounded-md text-xs font-medium text-white"
                        style={{ backgroundColor: NAVY }}
                      >
                        View
                      </Link>
                      <Link
                        href={`/reports/${s.student_id}/pdf`}
                        className="px-3 py-1.5 rounded-md text-xs font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        PDF
                      </Link>
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
