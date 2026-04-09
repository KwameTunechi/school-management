import Link from 'next/link';
import getDb from '@/lib/db';
import { PageHeader } from '@/components/admin/FormField';

const NAVY = '#0d1b2a';
const GOLD  = '#c9952a';

interface AssignmentRow {
  id: number;
  teacher_name: string;
  teacher_email: string;
  subject_name: string;
  subject_code: string;
  class_name: string;
  student_count: number;
}

function getAssignments(): AssignmentRow[] {
  return getDb().prepare(`
    SELECT
      ta.id,
      u.full_name   AS teacher_name,
      u.email       AS teacher_email,
      sub.name      AS subject_name,
      sub.code      AS subject_code,
      ta.class_name,
      (SELECT COUNT(*) FROM students WHERE class_name = ta.class_name) AS student_count
    FROM teacher_assignments ta
    JOIN users u    ON u.id    = ta.teacher_id
    JOIN subjects sub ON sub.id = ta.subject_id
    ORDER BY ta.class_name, sub.name, u.full_name
  `).all() as AssignmentRow[];
}

// Group by class
function groupByClass(rows: AssignmentRow[]) {
  const map: Record<string, AssignmentRow[]> = {};
  for (const r of rows) {
    (map[r.class_name] ??= []).push(r);
  }
  return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
}

export default function AssignmentsPage() {
  const rows    = getAssignments();
  const grouped = groupByClass(rows);

  return (
    <div>
      <PageHeader
        title="All Assignments"
        subtitle={`${rows.length} teacher–subject–class assignment${rows.length !== 1 ? 's' : ''}`}
        action={
          <Link
            href="/admin/teachers"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Manage by Teacher
          </Link>
        }
      />

      {grouped.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No assignments yet.</p>
          <Link href="/admin/teachers" className="text-sm underline mt-2 inline-block" style={{ color: NAVY }}>
            Assign subjects to teachers →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map(([className, assignments]) => (
            <div key={className} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 flex items-center justify-between" style={{ backgroundColor: NAVY }}>
                <h2 className="font-semibold text-white text-sm">{className}</h2>
                <span className="text-xs" style={{ color: GOLD }}>
                  {assignments[0].student_count} student{assignments[0].student_count !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Mobile: card list */}
              <div className="sm:hidden divide-y divide-gray-100">
                {assignments.map((a) => (
                  <div key={a.id} className="px-4 py-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-xs font-mono font-semibold px-2 py-0.5 rounded"
                        style={{ backgroundColor: GOLD + '1a', color: NAVY }}
                      >
                        {a.subject_code}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{a.subject_name}</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      <Link href={`/admin/teachers/${a.id}`} className="hover:underline">
                        {a.teacher_name}
                      </Link>
                    </p>
                  </div>
                ))}
              </div>

              {/* Desktop: table */}
              <table className="hidden sm:table w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Subject</th>
                    <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Teacher</th>
                    <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Email</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {assignments.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-xs font-mono font-semibold px-2 py-0.5 rounded"
                            style={{ backgroundColor: GOLD + '1a', color: NAVY }}
                          >
                            {a.subject_code}
                          </span>
                          <span className="text-gray-800">{a.subject_name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-700">
                        <Link href={`/admin/teachers/${a.id}`} className="hover:underline">
                          {a.teacher_name}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-gray-400 text-xs hidden md:table-cell">{a.teacher_email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
