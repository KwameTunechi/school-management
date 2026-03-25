import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';

const db = new Database(path.join(process.cwd(), 'school.db'));
db.pragma('foreign_keys = ON');

// Initialize tables (same as db.ts)
db.exec(`
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    class_name TEXT NOT NULL,
    gender TEXT NOT NULL,
    term INTEGER NOT NULL,
    year INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL
  );

  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL REFERENCES students(id),
    subject_id INTEGER NOT NULL REFERENCES subjects(id),
    class_score REAL NOT NULL CHECK(class_score >= 0 AND class_score <= 30),
    exam_score REAL NOT NULL CHECK(exam_score >= 0 AND exam_score <= 70),
    teacher_remark TEXT
  );

  CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER UNIQUE NOT NULL REFERENCES students(id),
    term INTEGER NOT NULL,
    year INTEGER NOT NULL,
    days_present INTEGER NOT NULL,
    total_days INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS remarks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER UNIQUE NOT NULL REFERENCES students(id),
    class_teacher_remark TEXT,
    head_teacher_remark TEXT,
    next_term_begins TEXT
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'teacher')),
    phone TEXT,
    signature_path TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS teacher_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    teacher_id INTEGER NOT NULL REFERENCES users(id),
    subject_id INTEGER NOT NULL REFERENCES subjects(id),
    class_name TEXT NOT NULL,
    UNIQUE(teacher_id, subject_id, class_name)
  );
`);

// Clear existing data
db.exec(`
  DELETE FROM remarks;
  DELETE FROM attendance;
  DELETE FROM scores;
  DELETE FROM students;
  DELETE FROM subjects;
`);

// Insert subjects
const insertSubject = db.prepare('INSERT INTO subjects (name, code) VALUES (?, ?)');
const subjects = [
  { name: 'English Language', code: 'ENG' },
  { name: 'Mathematics', code: 'MTH' },
  { name: 'Integrated Science', code: 'SCI' },
  { name: 'Social Studies', code: 'SOC' },
  { name: 'Religious & Moral Education', code: 'RME' },
  { name: 'Computing/ICT', code: 'ICT' },
  { name: 'French', code: 'FRE' },
];
for (const s of subjects) insertSubject.run(s.name, s.code);

const allSubjects = db.prepare('SELECT id, code FROM subjects').all() as { id: number; code: string }[];
const subjectMap = Object.fromEntries(allSubjects.map(s => [s.code, s.id]));

// Insert students
const insertStudent = db.prepare(
  'INSERT INTO students (student_id, full_name, class_name, gender, term, year) VALUES (?, ?, ?, ?, ?, ?)'
);
const students = [
  { sid: 'QG-2024-001', name: 'Abena Mensah',   cls: 'Class 6A', gender: 'Female' },
  { sid: 'QG-2024-002', name: 'Kwame Asante',   cls: 'Class 6A', gender: 'Male'   },
  { sid: 'QG-2024-003', name: 'Akosua Boateng', cls: 'Class 6A', gender: 'Female' },
  { sid: 'QG-2024-004', name: 'Yaw Darko',      cls: 'Class 6B', gender: 'Male'   },
  { sid: 'QG-2024-005', name: 'Efua Quansah',   cls: 'Class 6B', gender: 'Female' },
];
for (const s of students) insertStudent.run(s.sid, s.name, s.cls, s.gender, 1, 2024);

const allStudents = db.prepare('SELECT id, student_id FROM students').all() as { id: number; student_id: string }[];
const studentMap = Object.fromEntries(allStudents.map(s => [s.student_id, s.id]));

// Score data per student
// [ENG, MTH, SCI, SOC, RME, ICT, FRE] each: [class_score, exam_score, teacher_remark]
type ScoreEntry = [number, number, string];
const scoreData: Record<string, Record<string, ScoreEntry>> = {
  'QG-2024-001': { // Abena - strong student
    ENG: [27, 62, 'Excellent communicator'],
    MTH: [26, 61, 'Very strong in problem solving'],
    SCI: [25, 60, 'Shows great curiosity'],
    SOC: [27, 63, 'Outstanding performance'],
    RME: [28, 64, 'Morally upright student'],
    ICT: [26, 60, 'Tech-savvy and eager to learn'],
    FRE: [24, 58, 'Good pronunciation and grammar'],
  },
  'QG-2024-002': { // Kwame - above average
    ENG: [22, 52, 'Good comprehension skills'],
    MTH: [25, 60, 'Handles complex problems well'],
    SCI: [23, 55, 'Active in lab activities'],
    SOC: [21, 50, 'Good understanding of concepts'],
    RME: [22, 53, 'Participates well in class'],
    ICT: [24, 57, 'Proficient with computer tools'],
    FRE: [20, 48, 'Needs more practice in writing'],
  },
  'QG-2024-003': { // Akosua - average
    ENG: [18, 42, 'Needs to improve reading speed'],
    MTH: [19, 44, 'Shows effort, keep practicing'],
    SCI: [20, 46, 'Adequate understanding'],
    SOC: [18, 43, 'Satisfactory performance'],
    RME: [21, 49, 'Good moral conduct'],
    ICT: [17, 40, 'Needs more hands-on practice'],
    FRE: [16, 38, 'Struggling with vocabulary'],
  },
  'QG-2024-004': { // Yaw - strong student
    ENG: [26, 60, 'Excellent written expression'],
    MTH: [28, 65, 'Top performer in mathematics'],
    SCI: [27, 62, 'Outstanding analytical skills'],
    SOC: [25, 59, 'Very good knowledge of civics'],
    RME: [26, 61, 'Exemplary moral behavior'],
    ICT: [28, 64, 'Exceptional programming skills'],
    FRE: [25, 58, 'Fluent oral French'],
  },
  'QG-2024-005': { // Efua - struggling student
    ENG: [14, 30, 'Needs significant improvement'],
    MTH: [12, 28, 'Requires extra tutoring'],
    SCI: [15, 32, 'Struggles with basic concepts'],
    SOC: [13, 31, 'Below average performance'],
    RME: [16, 35, 'Adequate moral conduct'],
    ICT: [14, 30, 'Needs more computer practice'],
    FRE: [11, 25, 'Very weak in French'],
  },
};

const insertScore = db.prepare(
  'INSERT INTO scores (student_id, subject_id, class_score, exam_score, teacher_remark) VALUES (?, ?, ?, ?, ?)'
);
for (const [sid, subScores] of Object.entries(scoreData)) {
  const dbStudentId = studentMap[sid];
  for (const [code, [cs, es, remark]] of Object.entries(subScores)) {
    insertScore.run(dbStudentId, subjectMap[code], cs, es, remark);
  }
}

// Attendance (out of 60 days)
const insertAttendance = db.prepare(
  'INSERT INTO attendance (student_id, term, year, days_present, total_days) VALUES (?, ?, ?, ?, ?)'
);
const attendanceData: Record<string, number> = {
  'QG-2024-001': 58,
  'QG-2024-002': 55,
  'QG-2024-003': 52,
  'QG-2024-004': 59,
  'QG-2024-005': 47,
};
for (const [sid, present] of Object.entries(attendanceData)) {
  insertAttendance.run(studentMap[sid], 1, 2024, present, 60);
}

// Remarks
const insertRemarks = db.prepare(
  'INSERT INTO remarks (student_id, class_teacher_remark, head_teacher_remark, next_term_begins) VALUES (?, ?, ?, ?)'
);
const remarksData: Record<string, [string, string]> = {
  'QG-2024-001': [
    'Abena is an exceptional student who demonstrates dedication and leadership in class. Keep it up!',
    'An outstanding student. We are proud of her academic excellence and discipline.',
  ],
  'QG-2024-002': [
    'Kwame is a hardworking student with great potential. He should pay more attention in Social Studies.',
    'Good performance. Kwame should strive to maintain and improve his scores next term.',
  ],
  'QG-2024-003': [
    'Akosua shows good character and effort. She needs to dedicate more time to her studies.',
    'Satisfactory performance. Akosua must work harder to improve her grades.',
  ],
  'QG-2024-004': [
    'Yaw is a brilliant and disciplined student. His performance in Mathematics is commendable.',
    'Excellent student. Yaw demonstrates strong academic ability and leadership qualities.',
  ],
  'QG-2024-005': [
    'Efua needs to put in more effort. Regular attendance and extra study time are strongly recommended.',
    'Efua must improve significantly. Parents are encouraged to support her studies at home.',
  ],
};
for (const [sid, [ctRemark, htRemark]] of Object.entries(remarksData)) {
  insertRemarks.run(studentMap[sid], ctRemark, htRemark, '14th January, 2025');
}

// Users (skip if email already exists)
const userAccounts = [
  {
    email:     'admin@school.edu.gh',
    password:  'Admin1234',
    full_name: 'School Administrator',
    role:      'admin',
  },
  {
    email:     'kwame.asante@school.edu.gh',
    password:  'Teacher1234',
    full_name: 'Mr. Kwame Asante',
    role:      'teacher',
  },
];

const insertUser = db.prepare(
  'INSERT OR IGNORE INTO users (email, password_hash, full_name, role) VALUES (?, ?, ?, ?)'
);

let usersSeeded = 0;
for (const account of userAccounts) {
  const hash   = bcrypt.hashSync(account.password, 12);
  const result = insertUser.run(account.email, hash, account.full_name, account.role);
  if (result.changes > 0) usersSeeded++;
}

console.log('Database seeded successfully!');
console.log(`- ${subjects.length} subjects inserted`);
console.log(`- ${students.length} students inserted`);
console.log('- Scores, attendance, and remarks added for all students');
console.log(`- ${usersSeeded} user account(s) created (${userAccounts.length - usersSeeded} already existed)`);
db.close();
