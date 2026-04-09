import Link from 'next/link';
import getDb from '@/lib/db';
import { Alert, PageHeader } from '@/components/admin/FormField';

interface TeacherRow {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  assignment_count: number;
  assignments: string | null;
}

function getTeachers(): TeacherRow[] {
  const db = getDb();
  return db.prepare(`
    SELECT
      u.id,
      u.full_name,
      u.email,
      u.phone,
      COUNT(ta.id) as assignment_count,
      GROUP_CONCAT(sub.code || ' / ' || ta.class_name, '  ·  ') as assignments
    FROM users u
    LEFT JOIN teacher_assignments ta ON ta.teacher_id = u.id
    LEFT JOIN subjects sub ON sub.id = ta.subject_id
    WHERE u.role = 'teacher'
    GROUP BY u.id
    ORDER BY u.full_name
  `).all() as TeacherRow[];
}

export default async function TeachersPage(props: PageProps<'/admin/teachers'>) {
  const { success, error } = await props.searchParams as { success?: string; error?: string };
  const teachers = getTeachers();

  return (
    <div>
      <PageHeader
        title="Teachers"
        subtitle={`${teachers.length} teacher account${teachers.length !== 1 ? 's' : ''}`}
        action={
          <Link
            href="/admin/teachers/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-95"
            style={{ backgroundColor: '#0d1b2a', boxShadow: '0 2px 8px rgba(13,27,42,0.2)' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Teacher
          </Link>
        }
      />

      {success && <div className="mb-4"><Alert type="success" message={decodeURIComponent(success)} /></div>}
      {error   && <div className="mb-4"><Alert type="error"   message={decodeURIComponent(error)}   /></div>}

      {teachers.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center" style={{ border: '1px solid #e8eaed' }}>
          <p style={{ color: '#6b7280' }}>No teachers yet.</p>
          <Link
            href="/admin/teachers/new"
            className="text-sm font-semibold underline mt-2 inline-block"
            style={{ color: '#0d1b2a' }}
          >
            Add the first teacher →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #e8eaed' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#f7f8fa', borderBottom: '1px solid #e8eaed' }}>
                <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Name</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Email</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider hidden md:table-cell" style={{ color: '#9ca3af' }}>Phone</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider hidden lg:table-cell" style={{ color: '#9ca3af' }}>Assignments</th>
                <th className="text-center px-5 py-3.5 text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((t, i) => (
                <tr
                  key={t.id}
                  className="transition-colors hover:bg-gray-50"
                  style={{ borderTop: i === 0 ? 'none' : '1px solid #f3f4f6' }}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
                        style={{ backgroundColor: 'rgba(201,149,42,0.12)', color: '#0d1b2a' }}
                      >
                        {t.full_name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()}
                      </div>
                      <span className="font-medium" style={{ color: '#0d1b2a' }}>{t.full_name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm" style={{ color: '#6b7280' }}>{t.email}</td>
                  <td className="px-5 py-3.5 text-sm hidden md:table-cell" style={{ color: '#9ca3af' }}>
                    {t.phone ?? '—'}
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    {t.assignment_count > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {t.assignments?.split('  ·  ').map((a: string, idx: number) => (
                          <span
                            key={idx}
                            className="inline-block text-xs font-medium px-2 py-0.5 rounded-lg"
                            style={{ backgroundColor: '#f7f8fa', color: '#6b7280', border: '1px solid #e8eaed' }}
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs italic" style={{ color: '#9ca3af' }}>No assignments</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-center gap-1.5">
                      <Link
                        href={`/admin/teachers/${t.id}`}
                        className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors hover:bg-gray-100"
                        style={{ border: '1px solid #e8eaed', color: '#374151', backgroundColor: '#f7f8fa' }}
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/admin/teachers/${t.id}/assignments`}
                        className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white"
                        style={{ backgroundColor: '#0d1b2a' }}
                      >
                        Subjects
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
