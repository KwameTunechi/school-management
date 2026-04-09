import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import getDb from '@/lib/db';

const NAVY = '#0d1b2a';
const GOLD  = '#c9952a';

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
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Remarks</h1>
        <p className="text-sm text-gray-500 mt-0.5">Enter class teacher remarks for your students.</p>
      </div>

      {classes.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No classes assigned yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {classes.map((c) => (
            <Link
              key={c}
              href={`/teacher/remarks/${encodeURIComponent(c)}`}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow group"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ backgroundColor: NAVY }}
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <h2 className="font-semibold text-gray-900">{c}</h2>
              <p className="flex items-center gap-1 mt-2 text-xs font-medium transition-colors"
                style={{ color: NAVY }}>
                Enter remarks
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
