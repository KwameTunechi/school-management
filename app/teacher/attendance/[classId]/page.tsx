import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import getDb from '@/lib/db';
import { AttendanceForm } from '@/components/AttendanceForm';

async function getData(teacherId: number, className: string) {
  const db = getDb();

  const assigned = db
    .prepare('SELECT id FROM teacher_assignments WHERE teacher_id = ? AND class_name = ? LIMIT 1')
    .get(teacherId, className);
  if (!assigned) return null;

  const students = db.prepare(`
    SELECT
      s.id           AS dbId,
      s.student_id   AS studentId,
      s.full_name    AS fullName,
      a.days_present AS daysPresent,
      a.total_days   AS totalDays
    FROM students s
    LEFT JOIN attendance a ON a.student_id = s.id
    WHERE s.class_name = ?
    ORDER BY s.full_name
  `).all(className) as {
    dbId: number;
    studentId: string;
    fullName: string;
    daysPresent: number | null;
    totalDays: number | null;
  }[];

  return { students };
}

export default async function AttendancePage(props: PageProps<'/teacher/attendance/[classId]'>) {
  const { classId } = await props.params;
  const searchParams = await props.searchParams;

  const session = await getServerSession(authOptions);
  const teacherId = parseInt(session!.user.id);
  const className = decodeURIComponent(classId);

  const data = await getData(teacherId, className);
  if (!data) notFound();

  const { students } = data;
  const successMsg = searchParams?.success as string | undefined;
  const errorMsg   = searchParams?.error   as string | undefined;

  return (
    <div className="space-y-5">

      {/* Back + header */}
      <div>
        <Link
          href="/teacher/attendance"
          className="inline-flex items-center gap-1 text-xs font-semibold mb-3 transition-colors"
          style={{ color: '#9ca3af' }}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Attendance
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#0d1b2a' }}>Attendance</h1>
            <p className="text-sm mt-0.5" style={{ color: '#9ca3af' }}>
              {className} · {students.length} student{students.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 sm:p-6" style={{ border: '1px solid #e8eaed' }}>
        <AttendanceForm
          className={className}
          students={students}
          successMsg={successMsg}
          errorMsg={errorMsg}
        />
      </div>
    </div>
  );
}
