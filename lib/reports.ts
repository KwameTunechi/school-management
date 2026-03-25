import getDb from './db';
import { getGrade, getGradeRemark, ordinal } from './grading';

export interface SubjectScore {
  subjectName: string;
  subjectCode: string;
  classScore: number;
  examScore: number;
  total: number;
  grade: string;
  remark: string;
  teacherRemark: string | null;
  teacherName: string | null;
  teacherSignature: string | null;
}

export interface StudentReport {
  studentId: string;
  fullName: string;
  className: string;
  gender: string;
  term: number;
  year: number;
  scores: SubjectScore[];
  aggregate: number;
  position: string;
  classSize: number;
  classTeacherName: string | null;
  classTeacherSignature: string | null;
  attendance: {
    daysPresent: number;
    totalDays: number;
  } | null;
  remarks: {
    classTeacherRemark: string | null;
    headTeacherRemark: string | null;
    nextTermBegins: string | null;
  } | null;
}

export function buildReport(studentId: string): StudentReport | null {
  const db = getDb();

  const student = db.prepare(
    'SELECT * FROM students WHERE student_id = ?'
  ).get(studentId) as any;

  if (!student) return null;

  const scores = db.prepare(`
    SELECT
      sub.name  AS subject_name,
      sub.code  AS subject_code,
      sc.class_score,
      sc.exam_score,
      sc.teacher_remark,
      (SELECT u.full_name
       FROM teacher_assignments ta JOIN users u ON u.id = ta.teacher_id
       WHERE ta.subject_id = sub.id AND ta.class_name = @className
       LIMIT 1) AS teacher_name,
      (SELECT u.signature_path
       FROM teacher_assignments ta JOIN users u ON u.id = ta.teacher_id
       WHERE ta.subject_id = sub.id AND ta.class_name = @className
       LIMIT 1) AS teacher_signature
    FROM scores sc
    JOIN subjects sub ON sc.subject_id = sub.id
    WHERE sc.student_id = @studentDbId
  `).all({ className: student.class_name, studentDbId: student.id }) as any[];

  const subjectScores: SubjectScore[] = scores.map((s: any) => {
    const total = s.class_score + s.exam_score;
    const grade = getGrade(total);
    return {
      subjectName:      s.subject_name,
      subjectCode:      s.subject_code,
      classScore:       s.class_score,
      examScore:        s.exam_score,
      total,
      grade,
      remark:           getGradeRemark(grade),
      teacherRemark:    s.teacher_remark,
      teacherName:      s.teacher_name      ?? null,
      teacherSignature: s.teacher_signature ?? null,
    };
  });

  const aggregate = subjectScores.reduce((sum, s) => sum + s.total, 0);

  // Class ranking
  const classmates = db.prepare(`
    SELECT s.id, SUM(sc.class_score + sc.exam_score) AS agg
    FROM students s
    LEFT JOIN scores sc ON sc.student_id = s.id
    WHERE s.class_name = ? AND s.term = ? AND s.year = ?
    GROUP BY s.id
    ORDER BY agg DESC
  `).all(student.class_name, student.term, student.year) as any[];

  const classSize     = classmates.length;
  const positionIndex = classmates.findIndex((c: any) => c.id === student.id);
  const position      = ordinal(positionIndex + 1);

  // Class teacher (first teacher assigned to this class who has a signature, else first teacher)
  const classTeacher = db.prepare(`
    SELECT u.full_name, u.signature_path
    FROM teacher_assignments ta JOIN users u ON u.id = ta.teacher_id
    WHERE ta.class_name = ?
    ORDER BY (u.signature_path IS NOT NULL) DESC
    LIMIT 1
  `).get(student.class_name) as { full_name: string; signature_path: string | null } | undefined;

  const attendance = db.prepare(
    'SELECT days_present, total_days FROM attendance WHERE student_id = ?'
  ).get(student.id) as any;

  const remarks = db.prepare(
    'SELECT class_teacher_remark, head_teacher_remark, next_term_begins FROM remarks WHERE student_id = ?'
  ).get(student.id) as any;

  return {
    studentId:            student.student_id,
    fullName:             student.full_name,
    className:            student.class_name,
    gender:               student.gender,
    term:                 student.term,
    year:                 student.year,
    scores:               subjectScores,
    aggregate,
    position,
    classSize,
    classTeacherName:      classTeacher?.full_name      ?? null,
    classTeacherSignature: classTeacher?.signature_path ?? null,
    attendance: attendance ? {
      daysPresent: attendance.days_present,
      totalDays:   attendance.total_days,
    } : null,
    remarks: remarks ? {
      classTeacherRemark: remarks.class_teacher_remark,
      headTeacherRemark:  remarks.head_teacher_remark,
      nextTermBegins:     remarks.next_term_begins,
    } : null,
  };
}
