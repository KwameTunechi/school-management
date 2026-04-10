import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import getDb from '@/lib/db';

interface Assignment {
  subject_id: number;
  subject_name: string;
  subject_code: string;
  class_name: string;
  student_count: number;
}

function getAssignments(teacherId: number): Assignment[] {
  return getDb().prepare(`
    SELECT
      ta.subject_id,
      sub.name   AS subject_name,
      sub.code   AS subject_code,
      ta.class_name,
      (SELECT COUNT(*) FROM students WHERE class_name = ta.class_name) AS student_count
    FROM teacher_assignments ta
    JOIN subjects sub ON sub.id = ta.subject_id
    WHERE ta.teacher_id = ?
    ORDER BY ta.class_name, sub.name
  `).all(teacherId) as Assignment[];
}

export default async function TeacherHomePage() {
  const session    = await getServerSession(authOptions);
  const teacherId  = parseInt(session!.user.id);
  const assignments = getAssignments(teacherId);

  const byClass = assignments.reduce<Record<string, Assignment[]>>((acc, a) => {
    (acc[a.class_name] ??= []).push(a);
    return acc;
  }, {});

  const firstName = session!.user.full_name.split(' ')[0];
  const totalClasses = Object.keys(byClass).length;

  return (
    <div>
      {/* Greeting */}
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#c9952a' }}>
          Good day
        </p>
        <h1 className="text-2xl font-bold" style={{ color: '#0d1b2a' }}>{firstName}</h1>
        <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>
          {totalClasses === 0
            ? 'No classes assigned yet.'
            : `You have ${totalClasses} class${totalClasses !== 1 ? 'es' : ''} this term.`}
        </p>
      </div>

      {totalClasses === 0 ? (
        <div
          className="bg-white rounded-2xl p-10 text-center"
          style={{ border: '1px solid #ebebeb' }}
        >
          <p className="text-sm" style={{ color: '#9ca3af' }}>Contact your admin to be assigned subjects.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(byClass).map(([className, subjects]) => (
            <div
              key={className}
              className="bg-white rounded-2xl overflow-hidden"
              style={{ border: '1px solid #ebebeb' }}
            >
              {/* Class header row */}
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #f5f5f5' }}>
                <div>
                  <h2 className="font-bold text-base" style={{ color: '#0d1b2a' }}>{className}</h2>
                  <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>
                    {subjects[0].student_count} student{subjects[0].student_count !== 1 ? 's' : ''}
                  </p>
                </div>
                <Link
                  href={`/teacher/attendance/${encodeURIComponent(className)}`}
                  className="text-xs font-semibold px-3.5 py-1.5 rounded-lg"
                  style={{ backgroundColor: '#f5f5f5', color: '#0d1b2a' }}
                >
                  Attendance
                </Link>
              </div>

              {/* Subject rows */}
              <ul>
                {subjects.map((s, i) => (
                  <li
                    key={s.subject_id}
                    style={{ borderTop: i === 0 ? 'none' : '1px solid #f9f9f9' }}
                  >
                    <Link
                      href={`/teacher/marks/${encodeURIComponent(className)}/${s.subject_id}`}
                      className="flex items-center justify-between px-5 py-3.5"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="text-[11px] font-mono font-semibold w-14 text-center py-0.5 rounded-md shrink-0"
                          style={{ backgroundColor: '#f7f3ec', color: '#c9952a' }}
                        >
                          {s.subject_code}
                        </span>
                        <span className="text-sm" style={{ color: '#374151' }}>{s.subject_name}</span>
                      </div>
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="#d1d5db" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
