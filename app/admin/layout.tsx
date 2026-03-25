import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { AdminSidebar } from '@/components/AdminSidebar';

export const metadata = {
  title: "Admin — Korle Gonno Methodist Basic 'B' School",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) redirect('/login');
  if (session.user.role !== 'admin') redirect('/dashboard');

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar
        fullName={session.user.full_name}
        email={session.user.email ?? ''}
      />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div />
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              Logged in as{' '}
              <span className="font-semibold text-gray-800">{session.user.full_name}</span>
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide"
              style={{ backgroundColor: '#0d1b2a', color: '#c9952a' }}
            >
              Admin
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
