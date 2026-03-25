import Link from 'next/link';
import { notFound } from 'next/navigation';
import getDb from '@/lib/db';
import { updateTeacher, resetPassword } from '../actions';
import { FormField, Alert, PageHeader } from '@/components/admin/FormField';

const NAVY = '#0d1b2a';
const GOLD = '#c9952a';

interface Teacher {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  role: string;
  created_at: string;
}

function getTeacher(id: number): Teacher | null {
  return getDb()
    .prepare("SELECT id, full_name, email, phone, role, created_at FROM users WHERE id = ? AND role = 'teacher'")
    .get(id) as Teacher | null;
}

export default async function EditTeacherPage(props: PageProps<'/admin/teachers/[id]'>) {
  const { id } = await props.params;
  const { error, success } = await props.searchParams as { error?: string; success?: string };

  const teacher = getTeacher(parseInt(id, 10));
  if (!teacher) notFound();

  const updateWithId = updateTeacher.bind(null, teacher.id);
  const resetWithId  = resetPassword.bind(null, teacher.id);

  return (
    <div className="max-w-xl space-y-6">
      <PageHeader
        title="Edit Teacher"
        subtitle={teacher.full_name}
        action={
          <Link href="/admin/teachers" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
            ← Back to teachers
          </Link>
        }
      />

      {success && <Alert type="success" message={decodeURIComponent(success)} />}
      {error   && <Alert type="error"   message={decodeURIComponent(error)}   />}

      {/* ── Profile details ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100">
          Profile Details
        </h2>

        <form action={updateWithId} className="space-y-4">
          <FormField
            label="Full Name"
            name="full_name"
            required
            defaultValue={teacher.full_name}
          />
          <FormField
            label="Email Address"
            name="email"
            type="email"
            required
            defaultValue={teacher.email}
          />
          <FormField
            label="Phone Number"
            name="phone"
            type="tel"
            defaultValue={teacher.phone ?? ''}
          />

          {/* Role — display only, not editable */}
          <div>
            <p className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">Role</p>
            <div
              className="px-4 py-2.5 rounded-lg border text-sm font-medium capitalize"
              style={{ backgroundColor: NAVY + '08', borderColor: NAVY + '22', color: NAVY }}
            >
              {teacher.role}
              <span className="ml-2 text-xs font-normal text-gray-400">(cannot be changed here)</span>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: NAVY }}
            >
              Save Changes
            </button>
            <Link
              href={`/admin/teachers/${teacher.id}/assignments`}
              className="px-5 py-2.5 rounded-lg text-sm font-medium border text-white transition-colors"
              style={{ backgroundColor: GOLD, borderColor: GOLD }}
            >
              Manage Subjects →
            </Link>
          </div>
        </form>
      </div>

      {/* ── Reset password ── */}
      <div id="reset-password" className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-1 pb-2 border-b border-gray-100">
          Reset Password
        </h2>
        <p className="text-xs text-gray-400 mb-4">
          Set a new password for {teacher.full_name}. They should change it after logging in.
        </p>

        <form action={resetWithId} className="space-y-4">
          <FormField
            label="New Password"
            name="new_password"
            type="password"
            required
            placeholder="Minimum 6 characters"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-gray-600 hover:bg-gray-700 transition-colors"
          >
            Reset Password
          </button>
        </form>
      </div>

      {/* ── Meta ── */}
      <p className="text-xs text-gray-400 pl-1">
        Account created: {new Date(teacher.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
      </p>

    </div>
  );
}
