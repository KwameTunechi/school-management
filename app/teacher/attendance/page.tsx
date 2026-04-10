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
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#0d1b2a' }}>Attendance</h1>
        <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>Select a class to record attendance.</p>
      </div>

      {classes.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center" style={{ border: '1px solid #ebebeb' }}>
          <p className="text-sm" style={{ color: '#9ca3af' }}>No classes assigned yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #ebebeb' }}>
          <ul>
            {classes.map((c, i) => {
              const done    = c.attendance_count >= c.student_count && c.student_count > 0;
              const partial = c.attendance_count > 0 && !done;
              return (
                <li key={c.class_name} style={{ borderTop: i === 0 ? 'none' : '1px solid #f5f5f5' }}>
                  <Link
                    href={`/teacher/attendance/${encodeURIComponent(c.class_name)}`}
                    className="flex items-center justify-between px-5 py-4"
                  >
                    <div>
                      <p className="font-semibold text-sm" style={{ color: '#0d1b2a' }}>{c.class_name}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>
                        {c.student_count} student{c.student_count !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2.5">
                      {done ? (
                        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>Recorded</span>
                      ) : partial ? (
                        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md" style={{ backgroundColor: '#fffbeb', color: '#d97706' }}>Partial</span>
                      ) : (
                        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md" style={{ backgroundColor: '#f5f5f5', color: '#9ca3af' }}>Pending</span>
                      )}
                      <svg className="w-4 h-4" fill="none" stroke="#d1d5db" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
