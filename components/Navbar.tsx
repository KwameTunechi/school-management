'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

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

  const initials = fullName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <header
      className="text-white"
      style={{
        background: 'linear-gradient(135deg, #0d1b2a 0%, #132236 100%)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.06)',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">

          {/* Logo + name */}
          <Link href={role === 'teacher' ? '/teacher' : '/admin'} className="flex items-center gap-2.5 shrink-0">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'rgba(201,149,42,0.2)', border: '1px solid rgba(201,149,42,0.3)' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="#c9952a" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <span className="font-bold text-sm text-white">KGMBS</span>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-0.5">
            {items.map((item) => {
              const active = isActive(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all"
                  style={{
                    backgroundColor: active ? 'rgba(201,149,42,0.15)' : 'transparent',
                    color: active ? '#c9952a' : 'rgba(255,255,255,0.65)',
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User area */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: '#c9952a', color: '#0d1b2a' }}
              >
                {initials}
              </div>
              <div className="text-xs">
                <p className="font-semibold text-white leading-tight">{fullName}</p>
                <p className="capitalize leading-tight" style={{ color: 'rgba(201,149,42,0.7)' }}>{role}</p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
              style={{ border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)' }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Out
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden flex gap-0.5 pb-2 overflow-x-auto">
          {items.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all"
                style={{
                  backgroundColor: active ? 'rgba(201,149,42,0.15)' : 'transparent',
                  color: active ? '#c9952a' : 'rgba(255,255,255,0.65)',
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
