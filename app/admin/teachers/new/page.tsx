import Link from 'next/link';
import { createTeacher } from '../actions';
import { FormField, Alert, PageHeader } from '@/components/admin/FormField';

const NAVY = '#0d1b2a';

export default async function NewTeacherPage(props: PageProps<'/admin/teachers/new'>) {
  const { error } = await props.searchParams as { error?: string };

  return (
    <div className="max-w-xl">
      <PageHeader
        title="Add Teacher"
        subtitle="Create a new teacher account"
        action={
          <Link
            href="/admin/teachers"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← Back to teachers
          </Link>
        }
      />

      {error && <div className="mb-5"><Alert type="error" message={decodeURIComponent(error)} /></div>}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <form action={createTeacher} className="space-y-4">

          <FormField label="Full Name" name="full_name" required placeholder="e.g. Mr. Kwame Boateng" />

          <FormField label="Email Address" name="email" type="email" required placeholder="teacher@school.edu.gh" />

          <FormField label="Phone Number" name="phone" type="tel" placeholder="+233 24 000 0000" />

          <FormField
            label="Initial Password"
            name="password"
            type="password"
            required
            placeholder="Minimum 6 characters"
            hint="The teacher can change this after their first login."
          />

          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: NAVY }}
            >
              Create Teacher Account
            </button>
            <Link
              href="/admin/teachers"
              className="px-5 py-2.5 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
          </div>

        </form>
      </div>
    </div>
  );
}
