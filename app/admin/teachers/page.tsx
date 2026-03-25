import Link from 'next/link';
import getDb from '@/lib/db';
import { Alert, PageHeader } from '@/components/admin/FormField';

const NAVY = '#0d1b2a';
const GOLD = '#c9952a';

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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
            style={{ backgroundColor: NAVY }}
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
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No teachers yet.</p>
          <Link href="/admin/teachers/new" className="text-sm underline mt-2 inline-block" style={{ color: NAVY }}>
            Add the first teacher →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: NAVY }} className="text-white">
                <th className="text-left px-5 py-3.5 font-medium">Full Name</th>
                <th className="text-left px-5 py-3.5 font-medium">Email</th>
                <th className="text-left px-5 py-3.5 font-medium hidden md:table-cell">Phone</th>
                <th className="text-left px-5 py-3.5 font-medium hidden lg:table-cell">Assigned Subjects / Classes</th>
                <th className="text-center px-5 py-3.5 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {teachers.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                        style={{ backgroundColor: GOLD + '22', color: NAVY }}
                      >
                        {t.full_name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">{t.full_name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">{t.email}</td>
                  <td className="px-5 py-3.5 text-gray-500 hidden md:table-cell">
                    {t.phone ?? <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    {t.assignment_count > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {t.assignments?.split('  ·  ').map((a, i) => (
                          <span
                            key={i}
                            className="inline-block text-xs px-2 py-0.5 rounded-md border"
                            style={{ backgroundColor: NAVY + '0d', borderColor: NAVY + '22', color: NAVY }}
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">No assignments</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/admin/teachers/${t.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </Link>
                      <Link
                        href={`/admin/teachers/${t.id}#reset-password`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium text-white transition-colors"
                        style={{ backgroundColor: '#6b7280' }}
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                        Reset PW
                      </Link>
                      <Link
                        href={`/admin/teachers/${t.id}/assignments`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium text-white transition-colors"
                        style={{ backgroundColor: NAVY }}
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
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
