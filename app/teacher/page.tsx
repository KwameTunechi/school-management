import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import getDb from '@/lib/db';

const NAVY = '#0d1b2a';
const GOLD = '#c9952a';

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
  const session = await getServerSession(authOptions);
  const teacherId = parseInt(session!.user.id);
  const assignments = getAssignments(teacherId);

  // Group by class
  const byClass = assignments.reduce<Record<string, Assignment[]>>((acc, a) => {
    (acc[a.class_name] ??= []).push(a);
    return acc;
  }, {});

  const totalClasses  = Object.keys(byClass).length;
  const totalSubjects = assignments.length;
  const totalStudents = Object.values(byClass).reduce((sum, items) => {
    // de-duplicate student count per class (same class appears once)
    return sum + (items[0]?.student_count ?? 0);
  }, 0);

  return (
    <div className="space-y-5">

      {/* Welcome */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          Welcome, {session!.user.full_name}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Your class and subject assignments for this term.</p>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Classes',  value: totalClasses  },
          { label: 'Subjects', value: totalSubjects  },
          { label: 'Students', value: totalStudents  },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
            <p className="text-2xl font-bold" style={{ color: NAVY }}>{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Class cards */}
      {totalClasses === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No classes assigned yet.</p>
          <p className="text-gray-400 text-sm mt-1">Contact your admin to be assigned subjects.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(byClass).map(([className, subjects]) => (
            <div key={className} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Card header */}
              <div
                className="px-5 py-3.5 flex items-center justify-between"
                style={{ backgroundColor: NAVY }}
              >
                <div>
                  <h2 className="font-semibold text-white">{className}</h2>
                  <p className="text-xs mt-0.5" style={{ color: GOLD }}>
                    {subjects[0].student_count} student{subjects[0].student_count !== 1 ? 's' : ''}
                  </p>
                </div>
                <Link
                  href={`/teacher/attendance/${encodeURIComponent(className)}`}
                  className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
                  style={{ backgroundColor: GOLD + '28', color: GOLD }}
                >
                  Attendance
                </Link>
              </div>

              {/* Subject list */}
              <ul className="divide-y divide-gray-50">
                {subjects.map((s) => (
                  <li key={s.subject_id}>
                    <Link
                      href={`/teacher/marks/${encodeURIComponent(className)}/${s.subject_id}`}
                      className="flex items-center justify-between px-5 py-3 hover:bg-blue-50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="text-xs font-mono font-semibold px-2 py-0.5 rounded"
                          style={{ backgroundColor: GOLD + '1a', color: NAVY }}
                        >
                          {s.subject_code}
                        </span>
                        <span className="text-sm text-gray-800">{s.subject_name}</span>
                      </div>
                      <span className="text-xs text-gray-400 group-hover:text-gray-600 transition-colors">
                        Enter marks →
                      </span>
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
