import Link from 'next/link';
import { Alert, FormField, PageHeader } from '@/components/admin/FormField';
import { createSubject } from '../actions';

const NAVY = '#0d1b2a';

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function NewSubjectPage({ searchParams }: PageProps) {
  const sp = await searchParams;

  return (
    <div className="max-w-md">
      <PageHeader
        title="Add Subject"
        subtitle="Create a new subject offered by the school"
        action={
          <Link href="/admin/subjects" className="text-sm text-gray-500 hover:underline">
            ← Back
          </Link>
        }
      />

      {sp.error && <div className="mb-5"><Alert type="error" message={decodeURIComponent(sp.error)} /></div>}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6">
        <form action={createSubject} className="space-y-4">

          <FormField
            label="Subject Name"
            name="name"
            required
            placeholder="e.g. Mathematics"
          />

          <FormField
            label="Subject Code"
            name="code"
            required
            placeholder="e.g. MATH"
            hint="Short code used on reports. Will be uppercased."
          />

          <div className="pt-2 flex gap-3">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white"
              style={{ backgroundColor: NAVY }}
            >
              Add Subject
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
