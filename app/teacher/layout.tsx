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
        className="sm:hidden sticky top-0 z-30 px-4 py-3 flex items-center justify-between"
        style={{
          background: 'linear-gradient(135deg, #0d1b2a 0%, #132236 100%)',
          boxShadow: '0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{ backgroundColor: 'rgba(201,149,42,0.2)' }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="#c9952a" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
            </svg>
          </div>
          <span className="text-sm font-bold text-white">KGMBS</span>
        </div>
        <span className="text-xs truncate max-w-[160px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
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
