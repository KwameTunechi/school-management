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
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/teacher" className="hover:text-gray-900 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">Attendance — {className}</span>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Attendance</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {className} &nbsp;·&nbsp; {students.length} student{students.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/teacher" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
          ← Back
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
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
