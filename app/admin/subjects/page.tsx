import Link from 'next/link';
import getDb from '@/lib/db';
import { Alert, PageHeader } from '@/components/admin/FormField';
import { DeleteButton } from '@/components/DeleteButton';
import { deleteSubject } from './actions';

const NAVY = '#0d1b2a';
const GOLD  = '#c9952a';

interface SubjectRow {
  id: number;
  name: string;
  code: string;
  assignment_count: number;
}

function getSubjects(): SubjectRow[] {
  return getDb().prepare(`
    SELECT
      s.id,
      s.name,
      s.code,
      COUNT(ta.id) AS assignment_count
    FROM subjects s
    LEFT JOIN teacher_assignments ta ON ta.subject_id = s.id
    GROUP BY s.id
    ORDER BY s.name
  `).all() as SubjectRow[];
}

type PageProps = {
  searchParams: Promise<{ success?: string; error?: string }>;
};

export default async function SubjectsPage({ searchParams }: PageProps) {
  const sp       = await searchParams;
  const subjects = getSubjects();

  return (
    <div>
      <PageHeader
        title="Subjects"
        subtitle={`${subjects.length} subject${subjects.length !== 1 ? 's' : ''} offered`}
        action={
          <Link
            href="/admin/subjects/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
            style={{ backgroundColor: NAVY }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Subject
          </Link>
        }
      />

      {sp.success && <div className="mb-4"><Alert type="success" message={decodeURIComponent(sp.success)} /></div>}
      {sp.error   && <div className="mb-4"><Alert type="error"   message={decodeURIComponent(sp.error)}   /></div>}

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {subjects.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-500 text-sm">
            No subjects yet. Add the first one.
          </div>
        ) : subjects.map((s) => (
          <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <span
                className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg"
                style={{ backgroundColor: GOLD + '1a', color: NAVY }}
              >
                {s.code}
              </span>
              <span className="font-semibold text-gray-900">{s.name}</span>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              {s.assignment_count} teacher assignment{s.assignment_count !== 1 ? 's' : ''}
            </p>
            <div className="flex gap-2">
              <Link
                href={`/admin/subjects/${s.id}`}
                className="flex-1 text-center py-1.5 rounded-lg text-xs font-medium border border-gray-300 text-gray-700"
              >
                Edit
              </Link>
              <form action={deleteSubject} className="flex-1">
                <input type="hidden" name="id" value={s.id} />
                <DeleteButton
                  message={`Delete ${s.name}? This will also remove all scores and assignments for this subject.`}
                  className="w-full py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 border border-red-200"
                >
                  Delete
                </DeleteButton>
              </form>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {subjects.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">No subjects yet.</p>
            <Link href="/admin/subjects/new" className="text-sm underline mt-2 inline-block" style={{ color: NAVY }}>
              Add the first subject →
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: NAVY }} className="text-white">
                <th className="text-left px-5 py-3.5 font-medium">Code</th>
                <th className="text-left px-5 py-3.5 font-medium">Subject Name</th>
                <th className="text-left px-5 py-3.5 font-medium">Assigned Teachers</th>
                <th className="text-center px-5 py-3.5 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {subjects.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <span
                      className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg"
                      style={{ backgroundColor: GOLD + '1a', color: NAVY }}
                    >
                      {s.code}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-medium text-gray-900">{s.name}</td>
                  <td className="px-5 py-3.5 text-gray-500">
                    {s.assignment_count > 0
                      ? `${s.assignment_count} assignment${s.assignment_count !== 1 ? 's' : ''}`
                      : <span className="text-gray-300 italic">None</span>
                    }
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/admin/subjects/${s.id}`}
                        className="px-3 py-1.5 rounded-md text-xs font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        Edit
                      </Link>
                      <form action={deleteSubject}>
                        <input type="hidden" name="id" value={s.id} />
                        <DeleteButton
                          message={`Delete ${s.name}? This will also remove all scores and assignments for this subject.`}
                          className="px-3 py-1.5 rounded-md text-xs font-medium bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                        >
                          Delete
                        </DeleteButton>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
