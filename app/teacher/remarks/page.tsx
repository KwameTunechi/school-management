import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import getDb from '@/lib/db';

function getClasses(teacherId: number): string[] {
  return (getDb()
    .prepare('SELECT DISTINCT class_name FROM teacher_assignments WHERE teacher_id = ? ORDER BY class_name')
    .all(teacherId) as { class_name: string }[])
    .map(r => r.class_name);
}

export default async function RemarksIndexPage() {
  const session   = await getServerSession(authOptions);
  const teacherId = parseInt(session!.user.id);
  const classes   = getClasses(teacherId);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#0d1b2a' }}>Remarks</h1>
        <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>Enter class teacher remarks for your students.</p>
      </div>

      {classes.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center" style={{ border: '1px solid #ebebeb' }}>
          <p className="text-sm" style={{ color: '#9ca3af' }}>No classes assigned yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #ebebeb' }}>
          <ul>
            {classes.map((c, i) => (
              <li key={c} style={{ borderTop: i === 0 ? 'none' : '1px solid #f5f5f5' }}>
                <Link
                  href={`/teacher/remarks/${encodeURIComponent(c)}`}
                  className="flex items-center justify-between px-5 py-4"
                >
                  <p className="font-semibold text-sm" style={{ color: '#0d1b2a' }}>{c}</p>
                  <div className="flex items-center gap-1.5" style={{ color: '#9ca3af' }}>
                    <span className="text-xs">Enter remarks</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
