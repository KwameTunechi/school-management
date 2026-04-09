import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import getDb from '@/lib/db';

interface Assignment {
  subject_id: number;
  subject_name: string;
  subject_code: string;
  class_name: string;
  scored_count: number;
  student_count: number;
}

function getAssignments(teacherId: number): Assignment[] {
  return getDb().prepare(`
    SELECT
      ta.subject_id,
      sub.name   AS subject_name,
      sub.code   AS subject_code,
      ta.class_name,
      (SELECT COUNT(*) FROM students WHERE class_name = ta.class_name) AS student_count,
      (SELECT COUNT(*) FROM scores sc
       JOIN students st ON st.id = sc.student_id
       WHERE sc.subject_id = ta.subject_id AND st.class_name = ta.class_name
      ) AS scored_count
    FROM teacher_assignments ta
    JOIN subjects sub ON sub.id = ta.subject_id
    WHERE ta.teacher_id = ?
    ORDER BY ta.class_name, sub.name
  `).all(teacherId) as Assignment[];
}

export default async function MarksPage() {
  const session     = await getServerSession(authOptions);
  const teacherId   = parseInt(session!.user.id);
  const assignments = getAssignments(teacherId);

  const byClass = assignments.reduce<Record<string, Assignment[]>>((acc, a) => {
    (acc[a.class_name] ??= []).push(a);
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#0d1b2a' }}>Marks Entry</h1>
        <p className="text-sm mt-0.5" style={{ color: '#9ca3af' }}>Select a subject to enter or update scores.</p>
      </div>

      {assignments.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center" style={{ border: '1px solid #e8eaed' }}>
          <p style={{ color: '#9ca3af' }}>No subjects assigned yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(byClass).map(([className, subjects]) => (
            <div key={className} className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #e8eaed' }}>
              <div
                className="px-5 py-3.5 flex items-center justify-between"
                style={{ background: 'linear-gradient(135deg, #0d1b2a 0%, #132236 100%)' }}
              >
                <span className="font-bold text-white">{className}</span>
                <span className="text-xs font-medium" style={{ color: 'rgba(201,149,42,0.85)' }}>
                  {subjects[0].student_count} student{subjects[0].student_count !== 1 ? 's' : ''}
                </span>
              </div>
              <ul>
                {subjects.map((s, i) => {
                  const done    = s.scored_count >= s.student_count && s.student_count > 0;
                  const partial = s.scored_count > 0 && !done;
                  return (
                    <li key={s.subject_id} style={{ borderTop: i === 0 ? 'none' : '1px solid #f9fafb' }}>
                      <Link
                        href={`/teacher/marks/${encodeURIComponent(className)}/${s.subject_id}`}
                        className="flex items-center justify-between px-5 py-3.5 transition-colors group hover:bg-blue-50/40"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg shrink-0"
                            style={{ backgroundColor: 'rgba(201,149,42,0.1)', color: '#0d1b2a' }}
                          >
                            {s.subject_code}
                          </span>
                          <span className="text-sm font-medium" style={{ color: '#374151' }}>{s.subject_name}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {done ? (
                            <span className="text-xs px-2.5 py-1 rounded-lg font-semibold" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>
                              Done
                            </span>
                          ) : partial ? (
                            <span className="text-xs px-2.5 py-1 rounded-lg font-semibold" style={{ backgroundColor: '#fefce8', color: '#ca8a04' }}>
                              {s.scored_count}/{s.student_count}
                            </span>
                          ) : (
                            <span className="text-xs px-2.5 py-1 rounded-lg font-semibold" style={{ backgroundColor: '#f7f8fa', color: '#9ca3af' }}>
                              Pending
                            </span>
                          )}
                          <div
                            className="w-6 h-6 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: '#f7f8fa' }}
                          >
                            <svg className="w-3 h-3" fill="none" stroke="#9ca3af" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
