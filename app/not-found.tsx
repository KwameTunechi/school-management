import Link from 'next/link';
import { SCHOOL_NAME } from '@/lib/constants';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-[#0d1b2a] text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
          <h1 className="text-xl sm:text-2xl font-bold tracking-wide">{SCHOOL_NAME}</h1>
          <p className="text-blue-200 text-sm mt-1">Terminal Report Management System</p>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          {/* Big 404 */}
          <div className="mb-6">
            <span
              className="text-[7rem] sm:text-[9rem] font-bold leading-none select-none"
              style={{ color: '#c9952a', opacity: 0.25 }}
            >
              404
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-[#0d1b2a] mb-3">
            Page Not Found
          </h2>
          <p className="text-gray-500 mb-2">
            The student record or page you are looking for does not exist.
          </p>
          <p className="text-sm text-gray-400 mb-8">
            It may have been removed or the student ID may be incorrect.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
              style={{ backgroundColor: '#0d1b2a' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
