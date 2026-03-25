'use client';

import { useRef, useState, useTransition } from 'react';
import { saveMarks } from '@/app/teacher/actions';

const NAVY = '#0d1b2a';
const GOLD = '#c9952a';

interface Student {
  dbId: number;
  studentId: string;
  fullName: string;
  classScore: number | null;
  examScore: number | null;
  teacherRemark: string | null;
}

interface Props {
  subjectId: number;
  className: string;
  students: Student[];
  successMsg?: string;
  errorMsg?: string;
}

export function MarksTable({ subjectId, className, students, successMsg, errorMsg }: Props) {
  const [totals, setTotals] = useState<Record<number, number>>(() => {
    const init: Record<number, number> = {};
    for (const s of students) {
      if (s.classScore !== null && s.examScore !== null) {
        init[s.dbId] = s.classScore + s.examScore;
      }
    }
    return init;
  });

  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleScoreChange(dbId: number, field: 'class' | 'exam', value: string) {
    const form = formRef.current;
    if (!form) return;
    const idx = students.findIndex((s) => s.dbId === dbId);
    const classVal = parseFloat(
      field === 'class' ? value : (form.elements.namedItem(`classScore_${idx}`) as HTMLInputElement)?.value ?? ''
    );
    const examVal = parseFloat(
      field === 'exam' ? value : (form.elements.namedItem(`examScore_${idx}`) as HTMLInputElement)?.value ?? ''
    );
    setTotals((prev) => ({
      ...prev,
      [dbId]: isNaN(classVal) || isNaN(examVal) ? NaN : classVal + examVal,
    }));
  }

  function gradeFromTotal(total: number): string {
    if (isNaN(total)) return '—';
    if (total >= 90) return 'A1';
    if (total >= 80) return 'B2';
    if (total >= 70) return 'B3';
    if (total >= 60) return 'C4';
    if (total >= 55) return 'C5';
    if (total >= 50) return 'C6';
    if (total >= 45) return 'D7';
    if (total >= 40) return 'E8';
    return 'F9';
  }

  function gradeColor(grade: string) {
    if (['A1', 'B2', 'B3'].includes(grade)) return 'text-green-700 bg-green-50 border-green-200';
    if (['C4', 'C5', 'C6', 'D7', 'E8'].includes(grade)) return 'text-blue-700 bg-blue-50 border-blue-200';
    if (grade === 'F9') return 'text-red-700 bg-red-50 border-red-200';
    return 'text-gray-500';
  }

  const boundAction = saveMarks.bind(null, subjectId, className);

  return (
    <form
      ref={formRef}
      action={(fd) => startTransition(() => { boundAction(fd); })}
    >
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

      {/* Desktop table */}
      <div className="hidden sm:block rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-white text-xs" style={{ backgroundColor: NAVY }}>
              <th className="text-left px-4 py-3 font-medium">Student</th>
              <th className="text-center px-3 py-3 font-medium w-28">Class Score<br /><span className="font-normal opacity-60">/30</span></th>
              <th className="text-center px-3 py-3 font-medium w-28">Exam Score<br /><span className="font-normal opacity-60">/70</span></th>
              <th className="text-center px-3 py-3 font-medium w-20">Total</th>
              <th className="text-center px-3 py-3 font-medium w-16">Grade</th>
              <th className="text-left px-4 py-3 font-medium">Remark (optional)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students.map((s, i) => {
              const total = totals[s.dbId];
              const grade = gradeFromTotal(total);
              return (
                <tr key={s.dbId} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-2.5">
                    <input type="hidden" name={`studentDbId_${i}`} value={s.dbId} />
                    <p className="font-medium text-gray-900">{s.fullName}</p>
                    <p className="text-xs text-gray-400">{s.studentId}</p>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <input
                      type="number"
                      name={`classScore_${i}`}
                      defaultValue={s.classScore ?? ''}
                      min={0} max={30} step={0.5}
                      onChange={(e) => handleScoreChange(s.dbId, 'class', e.target.value)}
                      className="w-20 text-center border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-transparent"
                      style={{ '--tw-ring-color': GOLD } as React.CSSProperties}
                    />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <input
                      type="number"
                      name={`examScore_${i}`}
                      defaultValue={s.examScore ?? ''}
                      min={0} max={70} step={0.5}
                      onChange={(e) => handleScoreChange(s.dbId, 'exam', e.target.value)}
                      className="w-20 text-center border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2"
                    />
                  </td>
                  <td className="px-3 py-2 text-center font-mono font-semibold text-gray-900">
                    {isNaN(total) || total === undefined ? '—' : total}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {grade !== '—' && (
                      <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded border ${gradeColor(grade)}`}>
                        {grade}
                      </span>
                    )}
                    {grade === '—' && <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      name={`remark_${i}`}
                      defaultValue={s.teacherRemark ?? ''}
                      placeholder="Optional note…"
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {students.map((s, i) => {
          const total = totals[s.dbId];
          const grade = gradeFromTotal(total);
          return (
            <div key={s.dbId} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
              <input type="hidden" name={`studentDbId_${i}`} value={s.dbId} />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{s.fullName}</p>
                  <p className="text-xs text-gray-400">{s.studentId}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Total</p>
                  <p className="font-mono font-bold text-gray-900">
                    {isNaN(total) || total === undefined ? '—' : total}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Class Score /30</label>
                  <input
                    type="number"
                    name={`classScore_${i}`}
                    defaultValue={s.classScore ?? ''}
                    min={0} max={30} step={0.5}
                    onChange={(e) => handleScoreChange(s.dbId, 'class', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Exam Score /70</label>
                  <input
                    type="number"
                    name={`examScore_${i}`}
                    defaultValue={s.examScore ?? ''}
                    min={0} max={70} step={0.5}
                    onChange={(e) => handleScoreChange(s.dbId, 'exam', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2"
                  />
                </div>
              </div>
              {grade !== '—' && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Grade:</span>
                  <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded border ${gradeColor(grade)}`}>
                    {grade}
                  </span>
                </div>
              )}
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Remark (optional)</label>
                <input
                  type="text"
                  name={`remark_${i}`}
                  defaultValue={s.teacherRemark ?? ''}
                  placeholder="Optional note…"
                  className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2"
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex justify-end">
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
              Save Marks
            </>
          )}
        </button>
      </div>
    </form>
  );
}
