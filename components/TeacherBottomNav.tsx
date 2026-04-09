'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  {
    href: '/teacher',
    label: 'Home',
    exact: true,
    icon: (active: boolean) => (
      <svg className="w-6 h-6" fill={active ? '#0d1b2a' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 1.8}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/teacher/marks',
    label: 'Marks',
    exact: false,
    icon: (active: boolean) => (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 1.8}
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    href: '/teacher/attendance',
    label: 'Attendance',
    exact: false,
    icon: (active: boolean) => (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 1.8}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    href: '/teacher/remarks',
    label: 'Remarks',
    exact: false,
    icon: (active: boolean) => (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 1.8}
          d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
      </svg>
    ),
  },
  {
    href: '/teacher/profile',
    label: 'Profile',
    exact: false,
    icon: (active: boolean) => (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 1.8}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

export function TeacherBottomNav() {
  const pathname = usePathname();

  function isActive({ href, exact }: { href: string; exact: boolean }) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 sm:hidden bg-white"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
        borderTop: '1px solid #e8eaed',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
      }}
    >
      <div className="flex px-1 py-1.5">
        {TABS.map((tab) => {
          const active = isActive(tab);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex-1 flex flex-col items-center gap-1 py-1.5 px-1 rounded-xl transition-all duration-150"
              style={{
                color: active ? '#0d1b2a' : '#9ca3af',
                backgroundColor: active ? 'rgba(13,27,42,0.06)' : 'transparent',
              }}
            >
              {tab.icon(active)}
              <span className="text-[10px] font-semibold tracking-wide">
                {tab.label}
              </span>
              {active && (
                <span
                  className="w-1 h-1 rounded-full"
                  style={{ backgroundColor: '#c9952a' }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
