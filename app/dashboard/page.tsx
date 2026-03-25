import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect('/login');

  // Route by role
  if (session.user.role === 'admin') redirect('/admin');
  if (session.user.role === 'teacher') redirect('/teacher');

  redirect('/');
}
