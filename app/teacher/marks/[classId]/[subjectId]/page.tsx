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
    <div className="space-y-5">

      {/* Back link */}
      <div>
        <Link
          href="/teacher/marks"
          className="inline-flex items-center gap-1 text-xs font-semibold mb-3 transition-colors"
          style={{ color: '#9ca3af' }}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Marks
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#0d1b2a' }}>Enter Marks</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span
                className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg"
                style={{ backgroundColor: 'rgba(201,149,42,0.1)', color: '#0d1b2a' }}
              >
                {subject.code}
              </span>
              <span className="text-sm" style={{ color: '#9ca3af' }}>
                {subject.name} · {className} · {students.length} student{students.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Scoring rules info banner */}
      <div
        className="rounded-xl px-4 py-3 text-xs flex flex-wrap gap-x-6 gap-y-1"
        style={{ backgroundColor: 'rgba(201,149,42,0.08)', borderLeft: '3px solid #c9952a', color: '#6b7280' }}
      >
        <span><strong style={{ color: '#0d1b2a' }}>Class Score:</strong> 0 – 30</span>
        <span><strong style={{ color: '#0d1b2a' }}>Exam Score:</strong> 0 – 70</span>
        <span><strong style={{ color: '#0d1b2a' }}>Total:</strong> auto-calculated</span>
        <span>Leave both blank to skip a student.</span>
      </div>

      {/* Marks table */}
      <div className="bg-white rounded-2xl p-4 sm:p-6" style={{ border: '1px solid #e8eaed' }}>
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
