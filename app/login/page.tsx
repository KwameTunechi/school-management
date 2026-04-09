'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { SCHOOL_NAME, SCHOOL_UNIT, SCHOOL_MOTTO } from '@/lib/constants';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const form     = e.currentTarget;
    const email    = (form.elements.namedItem('email')    as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    const result = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);

    if (result?.error) {
      setError('Invalid email or password. Please try again.');
    } else {
      router.push('/dashboard');
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Left brand panel (desktop only) ── */}
      <div
        className="hidden lg:flex lg:w-[45%] xl:w-[40%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0d1b2a 0%, #132236 100%)' }}
      >
        {/* Decorative circles */}
        <div
          className="absolute -top-24 -left-24 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #c9952a 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-32 -right-20 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #c9952a 0%, transparent 70%)' }}
        />

        {/* School identity */}
        <div className="relative z-10">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-8"
            style={{ backgroundColor: 'rgba(201,149,42,0.15)', border: '1px solid rgba(201,149,42,0.3)' }}
          >
            <svg className="w-7 h-7" fill="none" stroke="#c9952a" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>

          <p className="text-xs tracking-[0.25em] uppercase font-semibold mb-3" style={{ color: '#c9952a' }}>
            {SCHOOL_UNIT}
          </p>
          <h1 className="text-3xl font-bold text-white leading-snug mb-4">
            {SCHOOL_NAME}
          </h1>
          <p className="text-base italic" style={{ color: 'rgba(255,255,255,0.45)' }}>
            &ldquo;{SCHOOL_MOTTO}&rdquo;
          </p>
        </div>

        {/* Feature bullets */}
        <div className="relative z-10 space-y-4">
          {[
            'Terminal report generation & PDF export',
            'Marks, attendance & remarks management',
            'Teacher and student administration',
          ].map((text) => (
            <div key={text} className="flex items-start gap-3">
              <div
                className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'rgba(201,149,42,0.2)' }}
              >
                <svg className="w-3 h-3" fill="#c9952a" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{text}</p>
            </div>
          ))}
        </div>

        {/* Bottom credit */}
        <p className="relative z-10 text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
          KGMBS Report Management System
        </p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col" style={{ backgroundColor: '#f7f8fa' }}>
        {/* Mobile header */}
        <div
          className="lg:hidden px-6 pt-8 pb-6 text-center"
          style={{ background: 'linear-gradient(160deg, #0d1b2a 0%, #132236 100%)' }}
        >
          <p className="text-xs tracking-[0.25em] uppercase font-semibold mb-1" style={{ color: '#c9952a' }}>
            {SCHOOL_UNIT}
          </p>
          <h1 className="text-lg font-bold text-white leading-snug">{SCHOOL_NAME}</h1>
        </div>

        {/* Form centered */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-[420px]">

            <div className="mb-8">
              <h2 className="text-2xl font-bold" style={{ color: '#0d1b2a' }}>Welcome back</h2>
              <p className="text-sm mt-1" style={{ color: '#6b7280' }}>
                Sign in to your staff account to continue.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#6b7280' }}>
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@school.edu.gh"
                  className="w-full px-4 py-3 rounded-xl border text-sm text-gray-900 placeholder-gray-400 bg-white
                    outline-none transition-all duration-150"
                  style={{ borderColor: '#e8eaed' }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#c9952a'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,149,42,0.15)'; }}
                  onBlur={e  => { e.currentTarget.style.borderColor = '#e8eaed'; e.currentTarget.style.boxShadow = ''; }}
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#6b7280' }}>
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border text-sm text-gray-900 placeholder-gray-400 bg-white
                    outline-none transition-all duration-150"
                  style={{ borderColor: '#e8eaed' }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#c9952a'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,149,42,0.15)'; }}
                  onBlur={e  => { e.currentTarget.style.borderColor = '#e8eaed'; e.currentTarget.style.boxShadow = ''; }}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-150
                  disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
                style={{ backgroundColor: '#0d1b2a', boxShadow: '0 2px 8px rgba(13,27,42,0.25)' }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in…
                  </span>
                ) : 'Sign In'}
              </button>

            </form>

            <p className="mt-8 text-center text-xs" style={{ color: '#9ca3af' }}>
              Having trouble? Contact your system administrator.
            </p>

          </div>
        </div>
      </div>

    </div>
  );
}
