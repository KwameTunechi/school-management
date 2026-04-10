import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { Navbar } from '@/components/Navbar';
import { TeacherBottomNav } from '@/components/TeacherBottomNav';

export const metadata = { title: "Teacher Portal — KGMBS" };

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session)                        redirect('/login');
  if (session.user.role !== 'teacher') redirect('/dashboard');

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f7f8fa' }}>
      {/* Top nav — hidden on mobile, visible from sm up */}
      <div className="hidden sm:block">
        <Navbar
          role="teacher"
          fullName={session.user.full_name}
          email={session.user.email ?? ''}
        />
      </div>

      {/* Mobile top bar */}
      <div
        className="sm:hidden sticky top-0 z-30 px-5 py-3.5 flex items-center justify-between bg-white"
        style={{ borderBottom: '1px solid #f0f0f0' }}
      >
        <span className="text-sm font-bold" style={{ color: '#0d1b2a' }}>KGMBS</span>
        <span className="text-xs font-medium truncate max-w-[160px]" style={{ color: '#9ca3af' }}>
          {session.user.full_name}
        </span>
      </div>

      {/* Main content — extra bottom padding on mobile for bottom nav */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-5 pb-24 sm:pb-6">
        {children}
      </main>

      {/* Bottom nav — mobile only */}
      <TeacherBottomNav />
    </div>
  );
}
