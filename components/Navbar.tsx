'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { SCHOOL_NAME } from '@/lib/constants';

const NAVY = '#0d1b2a';
const GOLD = '#c9952a';

interface NavItem { href: string; label: string; exact?: boolean }

const TEACHER_NAV: NavItem[] = [
  { href: '/teacher',            label: 'Home',       exact: true },
  { href: '/teacher/marks',      label: 'Marks'                   },
  { href: '/teacher/attendance', label: 'Attendance'              },
  { href: '/teacher/profile',    label: 'Profile'                 },
];

const ADMIN_NAV: NavItem[] = [
  { href: '/admin',              label: 'Dashboard',  exact: true },
  { href: '/admin/teachers',     label: 'Teachers'                },
  { href: '/admin/students',     label: 'Students'                },
  { href: '/admin/assignments',  label: 'Assignments'             },
];

interface Props {
  role: 'admin' | 'teacher';
  fullName: string;
  email: string;
}

export function Navbar({ role, fullName, email }: Props) {
  const pathname = usePathname();
  const items    = role === 'teacher' ? TEACHER_NAV : ADMIN_NAV;

  function isActive({ href, exact }: NavItem) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <header style={{ backgroundColor: NAVY }} className="text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">

          {/* School name */}
          <Link href={role === 'teacher' ? '/teacher' : '/admin'} className="flex items-center gap-3 shrink-0">
            <span className="font-bold text-sm hidden sm:block">{SCHOOL_NAME}</span>
            <span className="font-bold text-sm sm:hidden">KGMBS</span>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                style={{
                  backgroundColor: isActive(item) ? GOLD + '28' : 'transparent',
                  color: isActive(item) ? GOLD : 'rgba(255,255,255,0.75)',
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User area */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: GOLD, color: NAVY }}
              >
                {fullName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
              </div>
              <div className="text-xs">
                <p className="font-semibold text-white leading-tight">{fullName}</p>
                <p className="capitalize leading-tight" style={{ color: GOLD + 'cc' }}>{role}</p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden flex gap-1 pb-2 overflow-x-auto">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors"
              style={{
                backgroundColor: isActive(item) ? GOLD + '28' : 'transparent',
                color: isActive(item) ? GOLD : 'rgba(255,255,255,0.7)',
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
