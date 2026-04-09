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

  const firstName = session!.user.full_name.split(' ')[0];

  return (
    <div className="space-y-5">

      {/* Welcome banner */}
      <div
        className="rounded-2xl px-6 py-5 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0d1b2a 0%, #132236 100%)' }}
      >
        <div
          className="absolute -right-8 -top-8 w-32 h-32 rounded-full"
          style={{ backgroundColor: 'rgba(201,149,42,0.08)' }}
        />
        <div
          className="absolute right-4 bottom-0 w-20 h-20 rounded-full"
          style={{ backgroundColor: 'rgba(201,149,42,0.06)' }}
        />
        <p className="text-xs tracking-widest uppercase font-semibold mb-1 relative z-10" style={{ color: '#c9952a' }}>
          Good day
        </p>
        <h1 className="text-xl font-bold text-white relative z-10">
          {firstName}!
        </h1>
        <p className="text-sm mt-1 relative z-10" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Your classes and subjects for this term.
        </p>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Classes',  value: totalClasses,  color: '#3b82f6', bg: '#eff6ff'  },
          { label: 'Subjects', value: totalSubjects,  color: '#c9952a', bg: '#fef9ee' },
          { label: 'Students', value: totalStudents,  color: '#10b981', bg: '#f0fdf4' },
        ].map(({ label, value, color, bg }) => (
          <div
            key={label}
            className="bg-white rounded-2xl p-4 text-center"
            style={{ border: '1px solid #e8eaed' }}
          >
            <p className="text-2xl font-bold" style={{ color }}>{value}</p>
            <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Section title */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>
          My Classes
        </h2>
      </div>

      {/* Class cards */}
      {totalClasses === 0 ? (
        <div
          className="bg-white rounded-2xl p-12 text-center"
          style={{ border: '1px solid #e8eaed' }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: '#f7f8fa' }}
          >
            <svg className="w-7 h-7" fill="none" stroke="#9ca3af" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p className="font-medium" style={{ color: '#6b7280' }}>No classes assigned yet</p>
          <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>Contact your admin to be assigned subjects.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(byClass).map(([className, subjects]) => (
            <div
              key={className}
              className="bg-white rounded-2xl overflow-hidden"
              style={{ border: '1px solid #e8eaed' }}
            >
              {/* Card header */}
              <div
                className="px-5 py-4 flex items-center justify-between"
                style={{ background: 'linear-gradient(135deg, #0d1b2a 0%, #132236 100%)' }}
              >
                <div>
                  <h2 className="font-bold text-white text-base">{className}</h2>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(201,149,42,0.85)' }}>
                    {subjects[0].student_count} student{subjects[0].student_count !== 1 ? 's' : ''}
                  </p>
                </div>
                <Link
                  href={`/teacher/attendance/${encodeURIComponent(className)}`}
                  className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all"
                  style={{ backgroundColor: 'rgba(201,149,42,0.15)', color: '#c9952a', border: '1px solid rgba(201,149,42,0.25)' }}
                >
                  Attendance
                </Link>
              </div>

              {/* Subject list */}
              <ul>
                {subjects.map((s, i) => (
                  <li key={s.subject_id} style={{ borderTop: i === 0 ? 'none' : '1px solid #f9fafb' }}>
                    <Link
                      href={`/teacher/marks/${encodeURIComponent(className)}/${s.subject_id}`}
                      className="flex items-center justify-between px-5 py-3.5 transition-colors group hover:bg-blue-50/50"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg"
                          style={{ backgroundColor: 'rgba(201,149,42,0.1)', color: '#0d1b2a' }}
                        >
                          {s.subject_code}
                        </span>
                        <span className="text-sm font-medium" style={{ color: '#374151' }}>{s.subject_name}</span>
                      </div>
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors"
                        style={{ backgroundColor: '#f7f8fa' }}
                      >
                        <svg className="w-3 h-3" fill="none" stroke="#9ca3af" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
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
