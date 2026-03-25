import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import getDb from '@/lib/db';
import { MarksTable } from '@/components/MarksTable';

const NAVY = '#0d1b2a';
const GOLD = '#c9952a';

interface Student {
  dbId: number;
  studentId: string;
  fullName: string;
  classScore: number | null;
  examScore: number | null;
  teacherRemark: string | null;
}

async function getData(teacherId: number, classId: string, subjectId: number) {
  const db = getDb();

  // Verify assignment
  const assignment = db
    .prepare('SELECT id FROM teacher_assignments WHERE teacher_id = ? AND class_name = ? AND subject_id = ?')
    .get(teacherId, classId, subjectId);
  if (!assignment) return null;

  const subject = db
    .prepare('SELECT id, name, code FROM subjects WHERE id = ?')
    .get(subjectId) as { id: number; name: string; code: string } | undefined;
  if (!subject) return null;

  const students = db.prepare(`
    SELECT
      s.id        AS dbId,
      s.student_id AS studentId,
      s.full_name  AS fullName,
      sc.class_score   AS classScore,
      sc.exam_score    AS examScore,
      sc.teacher_remark AS teacherRemark
    FROM students s
    LEFT JOIN scores sc ON sc.student_id = s.id AND sc.subject_id = ?
    WHERE s.class_name = ?
    ORDER BY s.full_name
  `).all(subjectId, classId) as Student[];

  return { subject, students };
}

export default async function MarksPage(props: PageProps<'/teacher/marks/[classId]/[subjectId]'>) {
  const { classId, subjectId: subjectIdStr } = await props.params;
  const searchParams = await props.searchParams;

  const session = await getServerSession(authOptions);
  const teacherId = parseInt(session!.user.id);
  const subjectId = parseInt(subjectIdStr);
  const className = decodeURIComponent(classId);

  const data = await getData(teacherId, className, subjectId);
  if (!data) notFound();

  const { subject, students } = data;
  const successMsg = searchParams?.success as string | undefined;
  const errorMsg   = searchParams?.error   as string | undefined;

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/teacher" className="hover:text-gray-900 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">
          {className} — {subject.name}
        </span>
      </div>

      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Enter Marks</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            <span
              className="inline-block font-mono text-xs font-semibold px-2 py-0.5 rounded mr-2"
              style={{ backgroundColor: GOLD + '1a', color: NAVY }}
            >
              {subject.code}
            </span>
            {subject.name} &nbsp;·&nbsp; {className} &nbsp;·&nbsp; {students.length} student{students.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/teacher"
          className="text-sm text-gray-500 hover:text-gray-900 transition-colors whitespace-nowrap"
        >
          ← Back
        </Link>
      </div>

      {/* Scoring rules */}
      <div
        className="rounded-xl px-4 py-3 text-xs text-gray-600 flex flex-wrap gap-x-6 gap-y-1"
        style={{ backgroundColor: GOLD + '14', borderLeft: `3px solid ${GOLD}` }}
      >
        <span><strong>Class Score:</strong> 0 – 30</span>
        <span><strong>Exam Score:</strong> 0 – 70</span>
        <span><strong>Total:</strong> 0 – 100 (auto-calculated)</span>
        <span>Leave both blank to skip a student.</span>
      </div>

      {/* Marks table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <MarksTable
          subjectId={subjectId}
          className={className}
          students={students}
          successMsg={successMsg}
          errorMsg={errorMsg}
        />
      </div>
    </div>
  );
}
