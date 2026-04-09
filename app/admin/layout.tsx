import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { AdminShell } from '@/components/AdminShell';

export const metadata = {
  title: "Admin — Korle Gonno Methodist Basic 'B' School",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) redirect('/login');
  if (session.user.role !== 'admin') redirect('/dashboard');

  return (
    <AdminShell
      fullName={session.user.full_name}
      email={session.user.email ?? ''}
    >
      {children}
    </AdminShell>
  );
}
