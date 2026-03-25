import Link from 'next/link';
import getDb from '@/lib/db';

const NAVY = '#0d1b2a';
const GOLD  = '#c9952a';

interface Stats {
  totalStudents: number;
  totalTeachers: number;
  totalSubjects: number;
  totalClasses:  number;
}

function getStats(): Stats {
  const db = getDb();
  const totalStudents = (db.prepare('SELECT COUNT(*) as n FROM students').get() as { n: number }).n;
  const totalTeachers = (db.prepare("SELECT COUNT(*) as n FROM users WHERE role = 'teacher'").get() as { n: number }).n;
  const totalSubjects = (db.prepare('SELECT COUNT(*) as n FROM subjects').get() as { n: number }).n;
  const totalClasses  = (db.prepare('SELECT COUNT(DISTINCT class_name) as n FROM students').get() as { n: number }).n;
  return { totalStudents, totalTeachers, totalSubjects, totalClasses };
}

interface RecentStudent {
  student_id: string;
  full_name: string;
  class_name: string;
}

function getRecentStudents(): RecentStudent[] {
  const db = getDb();
  return db.prepare('SELECT student_id, full_name, class_name FROM students ORDER BY id DESC LIMIT 5').all() as RecentStudent[];
}

const SUMMARY_CARDS = (s: Stats) => [
  {
    label: 'Total Students',
    value: s.totalStudents,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    href: '/admin/students',
    bg: '#eff6ff',
    accent: '#3b82f6',
  },
  {
    label: 'Total Teachers',
    value: s.totalTeachers,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    href: '/admin/teachers',
    bg: '#f0fdf4',
    accent: '#16a34a',
  },
  {
    label: 'Subjects Offered',
    value: s.totalSubjects,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    href: '/admin/assignments',
    bg: '#fff7ed',
    accent: '#ea580c',
  },
  {
    label: 'Total Classes',
    value: s.totalClasses,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    href: '/admin/classes',
    bg: '#fdf4ff',
    accent: '#9333ea',
  },
];

const QUICK_LINKS = [
  { href: '/',           label: 'View Student Reports',    desc: 'Browse and download terminal reports' },
  { href: '/admin/teachers',    label: 'Manage Teachers',         desc: 'Add or edit teacher accounts'         },
  { href: '/admin/assignments', label: 'Assign Subjects',         desc: 'Map teachers to classes and subjects' },
  { href: '/admin/students',    label: 'Manage Students',         desc: 'Add, edit, or remove student records' },
];

export default function AdminDashboard() {
  const stats          = getStats();
  const recentStudents = getRecentStudents();
  const cards          = SUMMARY_CARDS(stats);

  return (
    <div className="space-y-6">

      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of Korle Gonno Methodist Basic &apos;B&apos; School</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon, href, bg, accent }) => (
          <Link
            key={label}
            href={href}
            className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: bg, color: accent }}
              >
                {icon}
              </div>
              <svg
                className="w-4 h-4 text-gray-300 group-hover:text-gray-400 transition-colors mt-1"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </Link>
        ))}
      </div>

      {/* Bottom two-col grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent students */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Recent Students</h2>
            <Link href="/admin/students" className="text-xs font-medium hover:underline" style={{ color: NAVY }}>
              View all →
            </Link>
          </div>
          <ul className="divide-y divide-gray-50">
            {recentStudents.map((s) => (
              <li key={s.student_id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-900">{s.full_name}</p>
                  <p className="text-xs text-gray-400 font-mono">{s.student_id}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">{s.class_name}</span>
                  <Link
                    href={`/reports/${s.student_id}`}
                    className="text-xs font-medium hover:underline"
                    style={{ color: NAVY }}
                  >
                    Report →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick links */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Quick Actions</h2>
          </div>
          <ul className="divide-y divide-gray-50">
            {QUICK_LINKS.map(({ href, label, desc }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors group"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800 group-hover:text-gray-900">{label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                  </div>
                  <svg
                    className="w-4 h-4 shrink-0 text-gray-300 group-hover:text-gray-500 transition-colors"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}
