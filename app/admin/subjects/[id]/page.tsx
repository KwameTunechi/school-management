import Link from 'next/link';
import { notFound } from 'next/navigation';
import getDb from '@/lib/db';
import { Alert, PageHeader } from '@/components/admin/FormField';
import { updateSubject } from '../actions';

const NAVY = '#0d1b2a';

type PageProps = {
  params:       Promise<{ id: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
};

export default async function EditSubjectPage({ params, searchParams }: PageProps) {
  const { id: idStr } = await params;
  const sp            = await searchParams;
  const id            = parseInt(idStr, 10);

  const subject = getDb()
    .prepare('SELECT id, name, code FROM subjects WHERE id = ?')
    .get(id) as { id: number; name: string; code: string } | undefined;

  if (!subject) notFound();

  const update = updateSubject.bind(null, id);

  return (
    <div className="max-w-md">
      <PageHeader
        title="Edit Subject"
        subtitle={subject.name}
        action={
          <Link href="/admin/subjects" className="text-sm text-gray-500 hover:underline">
            ← Back
          </Link>
        }
      />

      {sp.success && <div className="mb-5"><Alert type="success" message={decodeURIComponent(sp.success)} /></div>}
      {sp.error   && <div className="mb-5"><Alert type="error"   message={decodeURIComponent(sp.error)}   /></div>}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6">
        <form action={update} className="space-y-4">

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
              Subject Name <span className="text-red-400">*</span>
            </label>
            <input
              name="name"
              defaultValue={subject.name}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1b2a]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
              Subject Code <span className="text-red-400">*</span>
            </label>
            <input
              name="code"
              defaultValue={subject.code}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1b2a]/20 font-mono"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white"
              style={{ backgroundColor: NAVY }}
            >
              Save Changes
            </button>
            <Link
              href="/admin/subjects"
              className="px-6 py-2.5 rounded-lg text-sm font-medium border border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
