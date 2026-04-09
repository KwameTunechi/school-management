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
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Top nav — hidden on mobile, visible from sm up */}
      <div className="hidden sm:block">
        <Navbar
          role="teacher"
          fullName={session.user.full_name}
          email={session.user.email ?? ''}
        />
      </div>

      {/* Mobile top bar */}
      <div className="sm:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <span className="text-sm font-bold text-gray-900">KGMBS</span>
        <span className="text-xs text-gray-500 truncate max-w-[160px]">{session.user.full_name}</span>
      </div>

      {/* Main content — extra bottom padding on mobile for bottom nav */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 sm:pb-6">
        {children}
      </main>

      {/* Bottom nav — mobile only */}
      <TeacherBottomNav />
    </div>
  );
}
