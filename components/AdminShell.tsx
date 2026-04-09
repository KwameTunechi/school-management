'use client';

import { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';

const NAVY = '#0d1b2a';
const GOLD  = '#c9952a';

interface Props {
  fullName: string;
  email: string;
  children: React.ReactNode;
}

export function AdminShell({ fullName, email, children }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
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
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setOpen(true)}
            className="lg:hidden p-2 -ml-1 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Open menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Spacer on desktop */}
          <div className="hidden lg:block" />

          {/* User badge */}
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden sm:inline text-sm text-gray-500">
              Signed in as{' '}
              <span className="font-semibold text-gray-800">{fullName}</span>
            </span>
            <span
              className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide"
              style={{ backgroundColor: NAVY, color: GOLD }}
            >
              Admin
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
