'use client';

import { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';

interface Props {
  fullName: string;
  email: string;
  children: React.ReactNode;
}

export function AdminShell({ fullName, email, children }: Props) {
  const [open, setOpen] = useState(false);

  const initials = fullName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#f7f8fa' }}>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      <AdminSidebar
        fullName={fullName}
        email={email}
        isOpen={open}
        onClose={() => setOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky header */}
        <header
          className="sticky top-0 z-30 px-4 sm:px-6 py-3.5 flex items-center justify-between"
          style={{
            backgroundColor: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid #e8eaed',
          }}
        >
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setOpen(true)}
            className="lg:hidden p-2 -ml-1 rounded-xl transition-colors"
            style={{ color: '#6b7280' }}
            aria-label="Open menu"
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f3f4f6'; e.currentTarget.style.color = '#0d1b2a'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#6b7280'; }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Spacer on desktop */}
          <div className="hidden lg:block" />

          {/* Right: user identity */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold" style={{ color: '#0d1b2a' }}>{fullName}</p>
              <p className="text-xs" style={{ color: '#9ca3af' }}>Administrator</p>
            </div>
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
              style={{ backgroundColor: '#0d1b2a', color: '#c9952a' }}
            >
              {initials}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 max-w-screen-xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
