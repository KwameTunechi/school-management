import Link from 'next/link';
import getDb from '@/lib/db';

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
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    href: '/admin/students',
    gradient: 'linear-gradient(135deg, #1a56db 0%, #3b82f6 100%)',
    iconBg: 'rgba(255,255,255,0.2)',
  },
  {
    label: 'Total Teachers',
    value: s.totalTeachers,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    href: '/admin/teachers',
    gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    iconBg: 'rgba(255,255,255,0.2)',
  },
  {
    label: 'Subjects Offered',
    value: s.totalSubjects,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    href: '/admin/subjects',
    gradient: 'linear-gradient(135deg, #c9952a 0%, #e8b84b 100%)',
    iconBg: 'rgba(255,255,255,0.2)',
  },
  {
    label: 'Total Classes',
    value: s.totalClasses,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    href: '/admin/classes',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
    iconBg: 'rgba(255,255,255,0.2)',
  },
];

const QUICK_LINKS = [
  { href: '/admin/reports',     label: 'Browse Reports',          desc: 'View and download terminal reports'   },
  { href: '/admin/teachers',    label: 'Manage Teachers',         desc: 'Add or edit teacher accounts'         },
  { href: '/admin/assignments', label: 'View Assignments',        desc: 'See all teacher–subject–class links'  },
  { href: '/admin/students',    label: 'Manage Students',         desc: 'Add, edit, or remove student records' },
  { href: '/admin/subjects',    label: 'Manage Subjects',         desc: 'Add or edit subjects offered'         },
  { href: '/admin/remarks',     label: 'Enter Remarks',           desc: 'Set head teacher remarks & next term' },
];

export default function AdminDashboard() {
  const stats          = getStats();
  const recentStudents = getRecentStudents();
  const cards          = SUMMARY_CARDS(stats);

  return (
    <div className="space-y-6">

      {/* Page heading */}
      <div
        className="rounded-2xl px-6 py-5 flex items-center justify-between"
        style={{ background: 'linear-gradient(135deg, #0d1b2a 0%, #132236 100%)' }}
      >
        <div>
          <p className="text-xs tracking-widest uppercase font-semibold mb-1" style={{ color: '#c9952a' }}>
            Overview
          </p>
          <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Korle Gonno Methodist Basic &apos;B&apos; School
          </p>
        </div>
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: 'rgba(201,149,42,0.15)', border: '1px solid rgba(201,149,42,0.25)' }}
        >
          <svg className="w-6 h-6" fill="none" stroke="#c9952a" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon, href, gradient, iconBg }) => (
          <Link
            key={label}
            href={href}
            className="relative rounded-2xl p-5 overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg group"
            style={{ background: gradient }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center mb-4 text-white"
              style={{ backgroundColor: iconBg }}
            >
              {icon}
            </div>
            <p className="text-3xl font-bold text-white">{value}</p>
            <p className="text-sm mt-1 text-white/75">{label}</p>
            {/* Decorative circle */}
            <div
              className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full"
              style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
            />
            <div
              className="absolute -right-2 top-2 w-10 h-10 rounded-full"
              style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
            />
          </Link>
        ))}
      </div>

      {/* Bottom two-col grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent students */}
        <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#e8eaed' }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #f3f4f6' }}>
            <div>
              <h2 className="font-semibold" style={{ color: '#0d1b2a' }}>Recent Students</h2>
              <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>Latest additions to the system</p>
            </div>
            <Link
              href="/admin/students"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
              style={{ color: '#0d1b2a', backgroundColor: '#f7f8fa' }}
            >
              View all →
            </Link>
          </div>
          <ul>
            {recentStudents.map((s, i) => (
              <li
                key={s.student_id}
                className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-gray-50"
                style={{ borderTop: i === 0 ? 'none' : '1px solid #f9fafb' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ backgroundColor: '#f0f4ff', color: '#3b82f6' }}
                  >
                    {s.full_name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#0d1b2a' }}>{s.full_name}</p>
                    <p className="text-xs font-mono" style={{ color: '#9ca3af' }}>{s.student_id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-medium px-2.5 py-0.5 rounded-lg"
                    style={{ backgroundColor: '#f7f8fa', color: '#6b7280' }}
                  >
                    {s.class_name}
                  </span>
                  <Link
                    href={`/reports/${s.student_id}`}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors"
                    style={{ color: '#0d1b2a', backgroundColor: '#f7f8fa' }}
                  >
                    Report
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick links */}
        <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#e8eaed' }}>
          <div className="px-5 py-4" style={{ borderBottom: '1px solid #f3f4f6' }}>
            <h2 className="font-semibold" style={{ color: '#0d1b2a' }}>Quick Actions</h2>
            <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>Jump to common tasks</p>
          </div>
          <ul>
            {QUICK_LINKS.map(({ href, label, desc }, i) => (
              <li key={href} style={{ borderTop: i === 0 ? 'none' : '1px solid #f9fafb' }}>
                <Link
                  href={href}
                  className="flex items-center justify-between px-5 py-3.5 transition-colors group hover:bg-gray-50"
                >
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#0d1b2a' }}>{label}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>{desc}</p>
                  </div>
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors group-hover:bg-gray-200"
                    style={{ backgroundColor: '#f3f4f6' }}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="#6b7280" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}
