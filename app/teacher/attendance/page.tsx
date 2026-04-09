import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import getDb from '@/lib/db';

const NAVY = '#0d1b2a';
const GOLD  = '#c9952a';

interface ClassInfo {
  class_name: string;
  student_count: number;
  attendance_count: number;
}

function getClasses(teacherId: number): ClassInfo[] {
  return getDb().prepare(`
    SELECT
      ta.class_name,
      (SELECT COUNT(*) FROM students WHERE class_name = ta.class_name) AS student_count,
      (SELECT COUNT(*) FROM attendance a
       JOIN students st ON st.id = a.student_id
       WHERE st.class_name = ta.class_name
      ) AS attendance_count
    FROM teacher_assignments ta
    WHERE ta.teacher_id = ?
    GROUP BY ta.class_name
    ORDER BY ta.class_name
  `).all(teacherId) as ClassInfo[];
}

export default async function AttendancePage() {
  const session   = await getServerSession(authOptions);
  const teacherId = parseInt(session!.user.id);
  const classes   = getClasses(teacherId);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Attendance</h1>
        <p className="text-sm text-gray-500 mt-0.5">Select a class to record attendance.</p>
      </div>

      {classes.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No classes assigned yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {classes.map((c) => {
            const done    = c.attendance_count >= c.student_count && c.student_count > 0;
            const partial = c.attendance_count > 0 && !done;
            return (
              <Link
                key={c.class_name}
                href={`/teacher/attendance/${encodeURIComponent(c.class_name)}`}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: NAVY }}
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  {done ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                      Recorded
                    </span>
                  ) : partial ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium">
                      Partial
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                      Pending
                    </span>
                  )}
                </div>
                <h2 className="font-semibold text-gray-900">{c.class_name}</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {c.student_count} student{c.student_count !== 1 ? 's' : ''}
                </p>
                <div className="flex items-center gap-1 mt-3 text-xs font-medium group-hover:text-gray-600 transition-colors"
                  style={{ color: NAVY }}>
                  Take attendance
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
