import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { Navbar } from '@/components/Navbar';

export const metadata = { title: "Teacher Portal — KGMBS" };

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session)                        redirect('/login');
  if (session.user.role !== 'teacher') redirect('/dashboard');

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar
        role="teacher"
        fullName={session.user.full_name}
        email={session.user.email ?? ''}
      />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>
    </div>
  );
}
