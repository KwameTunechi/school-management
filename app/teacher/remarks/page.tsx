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
    <div className="space-y-5">

      <div>
        <h1 className="text-xl font-bold" style={{ color: '#0d1b2a' }}>Remarks</h1>
        <p className="text-sm mt-0.5" style={{ color: '#9ca3af' }}>Enter class teacher remarks for your students.</p>
      </div>

      {classes.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center" style={{ border: '1px solid #e8eaed' }}>
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: '#f7f8fa' }}
          >
            <svg className="w-7 h-7" fill="none" stroke="#9ca3af" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </div>
          <p className="font-medium" style={{ color: '#6b7280' }}>No classes assigned yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {classes.map((c) => (
            <Link
              key={c}
              href={`/teacher/remarks/${encodeURIComponent(c)}`}
              className="group bg-white rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              style={{ border: '1px solid #e8eaed' }}
            >
              {/* Top accent */}
              <div className="h-1.5" style={{ background: 'linear-gradient(90deg, #c9952a, #e8b84b)' }} />
              <div className="p-5">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'linear-gradient(135deg, #c9952a, #e8b84b)' }}
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <h2 className="font-bold text-base" style={{ color: '#0d1b2a' }}>{c}</h2>
                <div
                  className="flex items-center gap-1 mt-3 text-xs font-semibold transition-colors"
                  style={{ color: '#c9952a' }}
                >
                  Enter remarks
                  <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
