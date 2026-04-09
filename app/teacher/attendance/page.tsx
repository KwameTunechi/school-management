import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import getDb from '@/lib/db';

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
        <h1 className="text-xl font-bold" style={{ color: '#0d1b2a' }}>Attendance</h1>
        <p className="text-sm mt-0.5" style={{ color: '#9ca3af' }}>Select a class to record attendance.</p>
      </div>

      {classes.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center" style={{ border: '1px solid #e8eaed' }}>
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: '#f7f8fa' }}
          >
            <svg className="w-7 h-7" fill="none" stroke="#9ca3af" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="font-medium" style={{ color: '#6b7280' }}>No classes assigned yet</p>
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
                className="group bg-white rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                style={{ border: '1px solid #e8eaed' }}
              >
                {/* Card top stripe */}
                <div
                  className="h-1.5"
                  style={{
                    background: done
                      ? 'linear-gradient(90deg, #10b981, #34d399)'
                      : partial
                      ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                      : 'linear-gradient(90deg, #0d1b2a, #132236)',
                  }}
                />
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        background: done
                          ? 'linear-gradient(135deg, #059669, #10b981)'
                          : partial
                          ? 'linear-gradient(135deg, #d97706, #f59e0b)'
                          : 'linear-gradient(135deg, #0d1b2a, #132236)',
                      }}
                    >
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    {done ? (
                      <span className="text-xs px-2.5 py-1 rounded-lg font-semibold" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>
                        Recorded
                      </span>
                    ) : partial ? (
                      <span className="text-xs px-2.5 py-1 rounded-lg font-semibold" style={{ backgroundColor: '#fefce8', color: '#ca8a04' }}>
                        Partial
                      </span>
                    ) : (
                      <span className="text-xs px-2.5 py-1 rounded-lg font-semibold" style={{ backgroundColor: '#f7f8fa', color: '#9ca3af' }}>
                        Pending
                      </span>
                    )}
                  </div>
                  <h2 className="font-bold text-base" style={{ color: '#0d1b2a' }}>{c.class_name}</h2>
                  <p className="text-sm mt-0.5" style={{ color: '#9ca3af' }}>
                    {c.student_count} student{c.student_count !== 1 ? 's' : ''}
                  </p>
                  <div
                    className="flex items-center gap-1 mt-4 text-xs font-semibold transition-colors"
                    style={{ color: '#0d1b2a' }}
                  >
                    Take attendance
                    <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
