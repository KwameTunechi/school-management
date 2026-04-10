import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import getDb from '@/lib/db';
import { MarksTable } from '@/components/MarksTable';


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
    <div>
      <Link
        href="/teacher/marks"
        className="inline-flex items-center gap-1.5 text-xs font-semibold mb-5"
        style={{ color: '#9ca3af' }}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </Link>

      <div className="mb-5">
        <h1 className="text-2xl font-bold" style={{ color: '#0d1b2a' }}>{subject.name}</h1>
        <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>
          {className} · {students.length} student{students.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Scoring rules */}
      <div
        className="rounded-xl px-4 py-3 text-xs flex flex-wrap gap-x-5 gap-y-1 mb-4"
        style={{ backgroundColor: '#f7f3ec', color: '#9ca3af' }}
      >
        <span>Class score: <strong style={{ color: '#0d1b2a' }}>0–30</strong></span>
        <span>Exam score: <strong style={{ color: '#0d1b2a' }}>0–70</strong></span>
        <span>Total is auto-calculated.</span>
      </div>

      <div className="bg-white rounded-2xl p-4 sm:p-6" style={{ border: '1px solid #ebebeb' }}>
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
