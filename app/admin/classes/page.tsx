import Link from 'next/link';
import getDb from '@/lib/db';
import { PageHeader } from '@/components/admin/FormField';

const NAVY = '#0d1b2a';
const GOLD  = '#c9952a';

interface ClassStats {
  class_name: string;
  student_count: number;
  male_count: number;
  female_count: number;
  teacher_count: number;
  subject_count: number;
  has_scores: number;
  has_attendance: number;
}

function getClasses(): ClassStats[] {
  return getDb().prepare(`
    SELECT
      s.class_name,
      COUNT(DISTINCT s.id)                                          AS student_count,
      COUNT(DISTINCT CASE WHEN s.gender = 'Male'   THEN s.id END)  AS male_count,
      COUNT(DISTINCT CASE WHEN s.gender = 'Female' THEN s.id END)  AS female_count,
      COUNT(DISTINCT ta.teacher_id)                                 AS teacher_count,
      COUNT(DISTINCT ta.subject_id)                                 AS subject_count,
      (SELECT COUNT(*) FROM scores sc2
       JOIN students s2 ON s2.id = sc2.student_id
       WHERE s2.class_name = s.class_name) > 0                     AS has_scores,
      (SELECT COUNT(*) FROM attendance a
       JOIN students s3 ON s3.id = a.student_id
       WHERE s3.class_name = s.class_name) > 0                     AS has_attendance
    FROM students s
    LEFT JOIN teacher_assignments ta ON ta.class_name = s.class_name
    GROUP BY s.class_name
    ORDER BY s.class_name
  `).all() as ClassStats[];
}

export default function ClassesPage() {
  const classes = getClasses();

  return (
    <div>
      <PageHeader
        title="Classes"
        subtitle={`${classes.length} class${classes.length !== 1 ? 'es' : ''} in the system`}
      />

      {classes.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No classes yet. Add students first to create classes.</p>
          <Link href="/admin/students/new" className="text-sm underline mt-2 inline-block" style={{ color: NAVY }}>
            Add students →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((c) => (
            <div key={c.class_name} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Card header */}
              <div className="px-5 py-4 flex items-center justify-between" style={{ backgroundColor: NAVY }}>
                <h2 className="font-bold text-white text-base">{c.class_name}</h2>
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: GOLD + '28', color: GOLD }}
                >
                  {c.student_count} students
                </span>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-px bg-gray-100">
                {[
                  { label: 'Boys',      value: c.male_count },
                  { label: 'Girls',     value: c.female_count },
                  { label: 'Teachers',  value: c.teacher_count },
                  { label: 'Subjects',  value: c.subject_count },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white px-4 py-3 text-center">
                    <p className="text-xl font-bold text-gray-900">{value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              {/* Status indicators */}
              <div className="px-5 py-3 flex items-center gap-3 border-t border-gray-100">
                <span className={`flex items-center gap-1 text-xs font-medium ${c.has_scores ? 'text-green-600' : 'text-gray-400'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${c.has_scores ? 'bg-green-500' : 'bg-gray-300'}`} />
                  Marks
                </span>
                <span className={`flex items-center gap-1 text-xs font-medium ${c.has_attendance ? 'text-green-600' : 'text-gray-400'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${c.has_attendance ? 'bg-green-500' : 'bg-gray-300'}`} />
                  Attendance
                </span>
              </div>

              {/* Actions */}
              <div className="px-5 pb-4 flex gap-2">
                <Link
                  href={`/admin/students?class=${encodeURIComponent(c.class_name)}`}
                  className="flex-1 text-center py-2 rounded-lg text-xs font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  View Students
                </Link>
                <Link
                  href={`/admin/remarks?class=${encodeURIComponent(c.class_name)}`}
                  className="flex-1 text-center py-2 rounded-lg text-xs font-medium text-white hover:opacity-90"
                  style={{ backgroundColor: NAVY }}
                >
                  Remarks
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
