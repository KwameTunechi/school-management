import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import getDb from '@/lib/db';
import { SignatureUpload } from '@/components/SignatureUpload';
import { updateProfile } from '@/app/teacher/actions';

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

  const initials = teacher.full_name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="space-y-5">

      {/* Header card */}
      <div
        className="rounded-2xl p-6 flex items-center gap-4 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0d1b2a 0%, #132236 100%)' }}
      >
        <div
          className="absolute -right-6 -top-6 w-28 h-28 rounded-full"
          style={{ backgroundColor: 'rgba(201,149,42,0.07)' }}
        />
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold shrink-0 relative z-10"
          style={{ backgroundColor: '#c9952a', color: '#0d1b2a' }}
        >
          {initials}
        </div>
        <div className="relative z-10 min-w-0">
          <h1 className="text-lg font-bold text-white truncate">{teacher.full_name}</h1>
          <p className="text-sm truncate" style={{ color: 'rgba(255,255,255,0.5)' }}>{teacher.email}</p>
          <span
            className="inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-lg"
            style={{ backgroundColor: 'rgba(201,149,42,0.15)', color: '#c9952a' }}
          >
            Teacher
          </span>
        </div>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm border" style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', color: '#16a34a' }}>
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm border" style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca', color: '#dc2626' }}>
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {errorMsg}
        </div>
      )}

      {/* Personal details form */}
      <div className="bg-white rounded-2xl p-5 sm:p-6" style={{ border: '1px solid #e8eaed' }}>
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: '#eff6ff' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="#3b82f6" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold" style={{ color: '#0d1b2a' }}>Personal Details</h2>
            <p className="text-xs" style={{ color: '#9ca3af' }}>Update your name and phone number</p>
          </div>
        </div>

        <form action={updateProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#6b7280' }} htmlFor="full_name">
              Full Name <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              defaultValue={teacher.full_name}
              required
              className="w-full rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#c9952a]/20 focus:border-[#c9952a] transition-all duration-150"
              style={{ border: '1px solid #e8eaed' }}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#6b7280' }} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={teacher.email}
              disabled
              className="w-full rounded-xl px-4 py-3 text-sm cursor-not-allowed"
              style={{ border: '1px solid #e8eaed', backgroundColor: '#f7f8fa', color: '#9ca3af' }}
            />
            <p className="text-xs mt-1.5" style={{ color: '#9ca3af' }}>Email address cannot be changed.</p>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#6b7280' }} htmlFor="phone">
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={teacher.phone ?? ''}
              placeholder="e.g. 0244 000 000"
              className="w-full rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#c9952a]/20 focus:border-[#c9952a] transition-all duration-150"
              style={{ border: '1px solid #e8eaed' }}
            />
          </div>
          <div className="pt-1">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-95"
              style={{ backgroundColor: '#0d1b2a', boxShadow: '0 2px 8px rgba(13,27,42,0.2)' }}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* Signature section */}
      <div className="bg-white rounded-2xl p-5 sm:p-6" style={{ border: '1px solid #e8eaed' }}>
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'rgba(201,149,42,0.1)' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="#c9952a" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold" style={{ color: '#0d1b2a' }}>Signature</h2>
            <p className="text-xs" style={{ color: '#9ca3af' }}>Appears on student report cards</p>
          </div>
        </div>
        <p className="text-xs mb-4" style={{ color: '#9ca3af' }}>
          Upload a clear PNG or JPG on a white background for best results.
        </p>
        <SignatureUpload currentPath={teacher.signature_path} />
      </div>
    </div>
  );
}
