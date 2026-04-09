'use client';

import { useTransition } from 'react';
import { saveAttendance } from '@/app/teacher/actions';

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
        <div className="mb-4 flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm border" style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', color: '#16a34a' }}>
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="mb-4 flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm border" style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca', color: '#dc2626' }}>
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {errorMsg}
        </div>
      )}

      {/* Term / Year */}
      <div className="flex flex-wrap gap-4 mb-5 pb-5" style={{ borderBottom: '1px solid #f3f4f6' }}>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#6b7280' }}>Term</label>
          <select
            name="term"
            defaultValue={DEFAULT_TERM}
            className="rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#c9952a]/20"
            style={{ border: '1px solid #e8eaed' }}
          >
            <option value={1}>Term 1</option>
            <option value={2}>Term 2</option>
            <option value={3}>Term 3</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#6b7280' }}>Year</label>
          <input
            type="number"
            name="year"
            defaultValue={CURRENT_YEAR}
            min={2020} max={2099}
            className="w-24 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#c9952a]/20"
            style={{ border: '1px solid #e8eaed' }}
          />
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block rounded-xl overflow-hidden mb-5" style={{ border: '1px solid #e8eaed' }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs" style={{ backgroundColor: '#f7f8fa', borderBottom: '1px solid #e8eaed' }}>
              <th className="text-left px-4 py-3 font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Student</th>
              <th className="text-center px-3 py-3 font-semibold uppercase tracking-wider w-32" style={{ color: '#9ca3af' }}>Days Present</th>
              <th className="text-center px-3 py-3 font-semibold uppercase tracking-wider w-32" style={{ color: '#9ca3af' }}>Total Days</th>
              <th className="text-center px-3 py-3 font-semibold uppercase tracking-wider w-24" style={{ color: '#9ca3af' }}>%</th>
            </tr>
          </thead>
          <tbody>
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
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60 transition-all active:scale-95"
          style={{ backgroundColor: '#0d1b2a', boxShadow: '0 2px 8px rgba(13,27,42,0.2)' }}
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
  const pct = s.daysPresent !== null && s.totalDays !== null && s.totalDays > 0
    ? Math.round((s.daysPresent / s.totalDays) * 100)
    : null;

  return (
    <tr
      className="transition-colors hover:bg-gray-50"
      style={{ borderTop: i === 0 ? 'none' : '1px solid #f3f4f6' }}
    >
      <td className="px-4 py-3">
        <input type="hidden" name={`studentDbId_${i}`} value={s.dbId} />
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
            style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}
          >
            {s.fullName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-sm" style={{ color: '#0d1b2a' }}>{s.fullName}</p>
            <p className="text-xs font-mono" style={{ color: '#9ca3af' }}>{s.studentId}</p>
          </div>
        </div>
      </td>
      <td className="px-3 py-2 text-center">
        <input
          type="number"
          name={`daysPresent_${i}`}
          defaultValue={s.daysPresent ?? ''}
          min={0} max={365}
          className="w-20 text-center rounded-lg px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#c9952a]/20"
          style={{ border: '1px solid #e8eaed' }}
        />
      </td>
      <td className="px-3 py-2 text-center">
        <input
          type="number"
          name={`totalDays_${i}`}
          defaultValue={s.totalDays ?? ''}
          min={1} max={365}
          className="w-20 text-center rounded-lg px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#c9952a]/20"
          style={{ border: '1px solid #e8eaed' }}
        />
      </td>
      <td className="px-3 py-2 text-center">
        {pct !== null ? (
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-lg"
            style={{
              backgroundColor: pct >= 80 ? '#f0fdf4' : pct >= 60 ? '#fefce8' : '#fef2f2',
              color: pct >= 80 ? '#16a34a' : pct >= 60 ? '#ca8a04' : '#dc2626',
            }}
          >
            {pct}%
          </span>
        ) : <span style={{ color: '#d1d5db' }}>—</span>}
      </td>
    </tr>
  );
}

function AttendanceMobileCard({ student: s, index: i }: { student: Student; index: number }) {
  return (
    <div className="bg-white rounded-2xl p-4 space-y-3" style={{ border: '1px solid #e8eaed' }}>
      <input type="hidden" name={`studentDbId_${i}`} value={s.dbId} />
      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
          style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}
        >
          {s.fullName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-sm" style={{ color: '#0d1b2a' }}>{s.fullName}</p>
          <p className="text-xs font-mono" style={{ color: '#9ca3af' }}>{s.studentId}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold uppercase tracking-widest mb-1.5 block" style={{ color: '#6b7280' }}>Days Present</label>
          <input
            type="number"
            name={`daysPresent_${i}`}
            defaultValue={s.daysPresent ?? ''}
            min={0} max={365}
            className="w-full rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#c9952a]/20"
            style={{ border: '1px solid #e8eaed' }}
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-widest mb-1.5 block" style={{ color: '#6b7280' }}>Total Days</label>
          <input
            type="number"
            name={`totalDays_${i}`}
            defaultValue={s.totalDays ?? ''}
            min={1} max={365}
            className="w-full rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#c9952a]/20"
            style={{ border: '1px solid #e8eaed' }}
          />
        </div>
      </div>
    </div>
  );
}
