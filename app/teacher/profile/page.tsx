import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import getDb from '@/lib/db';
import { SignatureUpload } from '@/components/SignatureUpload';
import { updateProfile } from '@/app/teacher/actions';

const NAVY = '#0d1b2a';
const GOLD = '#c9952a';

export default async function TeacherProfilePage(props: { searchParams: Promise<Record<string, string>> }) {
  const searchParams = await props.searchParams;
  const session = await getServerSession(authOptions);
  const teacherId = parseInt(session!.user.id);

  const teacher = getDb()
    .prepare('SELECT id, full_name, email, phone, signature_path FROM users WHERE id = ?')
    .get(teacherId) as {
      id: number;
      full_name: string;
      email: string;
      phone: string | null;
      signature_path: string | null;
    };

  const successMsg = searchParams?.success;
  const errorMsg   = searchParams?.error;

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500 mt-0.5">Update your name, phone and signature.</p>
      </div>

      {successMsg && (
        <div className="px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
          {errorMsg}
        </div>
      )}

      {/* Profile form */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
          Personal Details
        </h2>
        <form action={updateProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="full_name">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              defaultValue={teacher.full_name}
              required
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-offset-0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={teacher.email}
              disabled
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phone">
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={teacher.phone ?? ''}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
            />
          </div>
          <div className="pt-1">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: NAVY }}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* Signature section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1">
          Signature
        </h2>
        <p className="text-xs text-gray-400 mb-4">
          Your signature will appear on student report cards. Upload a clear PNG or JPG on a white background.
        </p>
        <SignatureUpload currentPath={teacher.signature_path} />
      </div>
    </div>
  );
}
