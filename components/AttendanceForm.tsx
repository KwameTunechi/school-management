'use client';

import { useTransition } from 'react';
import { saveAttendance } from '@/app/teacher/actions';

const NAVY = '#0d1b2a';
const GOLD = '#c9952a';

interface Student {
  dbId: number;
  studentId: string;
  fullName: string;
  daysPresent: number | null;
  totalDays: number | null;
}

interface Props {
  className: string;
  students: Student[];
  successMsg?: string;
  errorMsg?: string;
}

const CURRENT_YEAR  = new Date().getFullYear();
const CURRENT_MONTH = new Date().getMonth() + 1;
const DEFAULT_TERM  = CURRENT_MONTH <= 4 ? 2 : CURRENT_MONTH <= 8 ? 3 : 1;

export function AttendanceForm({ className, students, successMsg, errorMsg }: Props) {
  const [isPending, startTransition] = useTransition();
  const boundAction = saveAttendance.bind(null, className);

  return (
    <form action={(fd) => startTransition(() => { boundAction(fd); })}>
      <input type="hidden" name="studentCount" value={students.length} />

      {successMsg && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
          {errorMsg}
        </div>
      )}

      {/* Term / Year */}
      <div className="flex flex-wrap gap-4 mb-5 pb-5 border-b border-gray-100">
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Term</label>
          <select
            name="term"
            defaultValue={DEFAULT_TERM}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2"
          >
            <option value={1}>Term 1</option>
            <option value={2}>Term 2</option>
            <option value={3}>Term 3</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Year</label>
          <input
            type="number"
            name="year"
            defaultValue={CURRENT_YEAR}
            min={2020} max={2099}
            className="w-24 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2"
          />
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block rounded-xl border border-gray-200 overflow-hidden mb-5">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-white text-xs" style={{ backgroundColor: NAVY }}>
              <th className="text-left px-4 py-3 font-medium">Student</th>
              <th className="text-center px-3 py-3 font-medium w-32">Days Present</th>
              <th className="text-center px-3 py-3 font-medium w-32">Total Days</th>
              <th className="text-center px-3 py-3 font-medium w-24">%</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100" id="attendance-tbody">
            {students.map((s, i) => (
              <AttendanceRow key={s.dbId} student={s} index={i} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3 mb-5">
        {students.map((s, i) => (
          <AttendanceMobileCard key={s.dbId} student={s} index={i} />
        ))}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60 transition-opacity"
          style={{ backgroundColor: NAVY }}
        >
          {isPending ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Saving…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Save Attendance
            </>
          )}
        </button>
      </div>
    </form>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function AttendanceRow({ student: s, index: i }: { student: Student; index: number }) {
  return (
    <tr className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
      <td className="px-4 py-2.5">
        <input type="hidden" name={`studentDbId_${i}`} value={s.dbId} />
        <p className="font-medium text-gray-900">{s.fullName}</p>
        <p className="text-xs text-gray-400">{s.studentId}</p>
      </td>
      <td className="px-3 py-2 text-center">
        <input
          type="number"
          name={`daysPresent_${i}`}
          defaultValue={s.daysPresent ?? ''}
          min={0} max={365}
          className="w-20 text-center border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2"
        />
      </td>
      <td className="px-3 py-2 text-center">
        <input
          type="number"
          name={`totalDays_${i}`}
          defaultValue={s.totalDays ?? ''}
          min={1} max={365}
          className="w-20 text-center border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2"
        />
      </td>
      <td className="px-3 py-2 text-center text-sm font-mono text-gray-600">
        {s.daysPresent !== null && s.totalDays !== null && s.totalDays > 0
          ? `${Math.round((s.daysPresent / s.totalDays) * 100)}%`
          : '—'}
      </td>
    </tr>
  );
}

function AttendanceMobileCard({ student: s, index: i }: { student: Student; index: number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
      <input type="hidden" name={`studentDbId_${i}`} value={s.dbId} />
      <div>
        <p className="font-medium text-gray-900 text-sm">{s.fullName}</p>
        <p className="text-xs text-gray-400">{s.studentId}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Days Present</label>
          <input
            type="number"
            name={`daysPresent_${i}`}
            defaultValue={s.daysPresent ?? ''}
            min={0} max={365}
            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Total Days</label>
          <input
            type="number"
            name={`totalDays_${i}`}
            defaultValue={s.totalDays ?? ''}
            min={1} max={365}
            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2"
          />
        </div>
      </div>
    </div>
  );
}
