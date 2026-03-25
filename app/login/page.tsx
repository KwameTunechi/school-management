'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { SCHOOL_NAME, SCHOOL_UNIT, SCHOOL_MOTTO } from '@/lib/constants';

const NAVY = '#0d1b2a';
const GOLD = '#c9952a';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const form  = e.currentTarget;
    const email    = (form.elements.namedItem('email')    as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError('Invalid email or password.');
    } else {
      router.push('/dashboard');
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: NAVY }}>

      {/* Top gold accent */}
      <div className="h-1" style={{ backgroundColor: GOLD }} />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">

          {/* Logo / school name */}
          <div className="text-center mb-8">
            <p
              className="text-xs tracking-[0.3em] uppercase font-medium mb-2"
              style={{ color: GOLD }}
            >
              {SCHOOL_UNIT}
            </p>
            <h1 className="text-xl font-bold text-white tracking-wide leading-tight">
              {SCHOOL_NAME}
            </h1>
            <p className="text-blue-300 text-sm italic mt-1">{SCHOOL_MOTTO}</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
            {/* Card header */}
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">Staff Sign In</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Sign in to access the report management system
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

              {/* Error banner */}
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@school.edu.gh"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:border-transparent transition-colors"
                  style={{ '--tw-ring-color': GOLD } as React.CSSProperties}
                  onFocus={e => (e.currentTarget.style.boxShadow = `0 0 0 2px ${GOLD}44`)}
                  onBlur={e  => (e.currentTarget.style.boxShadow = '')}
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400
                    focus:outline-none transition-colors"
                  onFocus={e => (e.currentTarget.style.boxShadow = `0 0 0 2px ${GOLD}44`)}
                  onBlur={e  => (e.currentTarget.style.boxShadow = '')}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity
                  disabled:opacity-60 disabled:cursor-not-allowed mt-1"
                style={{ backgroundColor: NAVY }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in…
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>

            </form>

            {/* Card footer */}
            <div
              className="px-6 py-3 text-center text-xs text-gray-400 border-t border-gray-100"
            >
              For account issues, contact your system administrator.
            </div>
          </div>

        </div>
      </div>

      {/* Bottom gold accent */}
      <div className="h-1" style={{ backgroundColor: GOLD }} />

    </div>
  );
}
