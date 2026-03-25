import Link from 'next/link';
import { notFound } from 'next/navigation';
import { buildReport } from '@/lib/reports';
import { PrintButton } from '@/components/PrintButton';
import { SCHOOL_NAME, SCHOOL_UNIT, SCHOOL_MOTTO } from '@/lib/constants';

const NAVY = '#0d1b2a';
const GOLD = '#c9952a';

const GRADING_LEGEND = [
  { grade: 'A1', range: '90–100', remark: 'Excellent',  chip: 'bg-green-100 text-green-800 border-green-200' },
  { grade: 'B2', range: '80–89',  remark: 'Very Good',  chip: 'bg-green-100 text-green-800 border-green-200' },
  { grade: 'B3', range: '70–79',  remark: 'Good',       chip: 'bg-green-100 text-green-800 border-green-200' },
  { grade: 'C4', range: '60–69',  remark: 'Credit',     chip: 'bg-blue-100  text-blue-800  border-blue-200'  },
  { grade: 'C5', range: '55–59',  remark: 'Credit',     chip: 'bg-blue-100  text-blue-800  border-blue-200'  },
  { grade: 'C6', range: '50–54',  remark: 'Credit',     chip: 'bg-blue-100  text-blue-800  border-blue-200'  },
  { grade: 'D7', range: '45–49',  remark: 'Pass',       chip: 'bg-blue-100  text-blue-800  border-blue-200'  },
  { grade: 'E8', range: '40–44',  remark: 'Pass',       chip: 'bg-blue-100  text-blue-800  border-blue-200'  },
  { grade: 'F9', range: '0–39',   remark: 'Fail',       chip: 'bg-red-100   text-red-800   border-red-200'   },
];

function gradeChipClass(grade: string): string {
  if (['A1', 'B2', 'B3'].includes(grade))
    return 'bg-green-100 text-green-800 border border-green-200';
  if (['C4', 'C5', 'C6', 'D7', 'E8'].includes(grade))
    return 'bg-blue-100 text-blue-800 border border-blue-200';
  return 'bg-red-100 text-red-800 border border-red-200';
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-xs font-bold uppercase tracking-widest mb-3 pb-1 border-b-2"
      style={{ color: NAVY, borderColor: GOLD }}
    >
      {children}
    </h2>
  );
}

export default async function ReportPage(props: PageProps<'/reports/[studentId]'>) {
  const { studentId } = await props.params;
  const report = buildReport(studentId);

  if (!report) notFound();

  const { attendance } = report;
  const daysAbsent   = attendance ? attendance.totalDays - attendance.daysPresent : null;
  const attendancePct = attendance
    ? Math.round((attendance.daysPresent / attendance.totalDays) * 100)
    : null;
  const maxAggregate = report.scores.length * 100;

  return (
    <div className="min-h-screen bg-gray-100 py-6 sm:py-8 px-3 sm:px-4">
      <div className="max-w-4xl mx-auto">

        {/* ── Nav bar ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5 print:hidden">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </Link>
          <div className="flex items-center gap-2">
            <PrintButton />
            <Link
              href={`/reports/${studentId}/pdf`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
              style={{ backgroundColor: NAVY }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
              <span className="hidden sm:inline">Download PDF</span>
              <span className="sm:hidden">PDF</span>
            </Link>
          </div>
        </div>

        {/* ── Report card ── */}
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">

          {/* Top gold bar */}
          <div className="h-2" style={{ backgroundColor: GOLD }} />

          {/* ── HEADER ── */}
          <div
            className="px-6 sm:px-8 py-6 text-white text-center relative"
            style={{ backgroundColor: NAVY }}
          >
            <div className="absolute top-3 left-3 w-8 sm:w-10 h-8 sm:h-10 border-t-2 border-l-2 rounded-tl" style={{ borderColor: GOLD }} />
            <div className="absolute top-3 right-3 w-8 sm:w-10 h-8 sm:h-10 border-t-2 border-r-2 rounded-tr" style={{ borderColor: GOLD }} />
            <div className="absolute bottom-3 left-3 w-8 sm:w-10 h-8 sm:h-10 border-b-2 border-l-2 rounded-bl" style={{ borderColor: GOLD }} />
            <div className="absolute bottom-3 right-3 w-8 sm:w-10 h-8 sm:h-10 border-b-2 border-r-2 rounded-br" style={{ borderColor: GOLD }} />

            <p className="text-xs tracking-[0.25em] sm:tracking-[0.3em] uppercase font-medium mb-1" style={{ color: GOLD }}>
              {SCHOOL_UNIT}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-wide">{SCHOOL_NAME}</h1>
            <p className="text-sm italic mt-1 text-blue-200">{SCHOOL_MOTTO}</p>
            <div className="mt-4 pt-4 border-t border-white/20">
              <p className="text-base sm:text-lg font-semibold tracking-wider uppercase">End of Term Report</p>
              <p className="text-sm mt-1 text-blue-200">
                Term {report.term} &nbsp;·&nbsp; Academic Year {report.year}/{report.year + 1}
              </p>
            </div>
          </div>

          <div className="h-1" style={{ backgroundColor: GOLD }} />

          <div className="px-4 sm:px-8 py-5 sm:py-6 space-y-6">

            {/* ── STUDENT INFO ── */}
            <div
              className="grid grid-cols-2 sm:grid-cols-4 gap-px rounded-lg overflow-hidden border"
              style={{ borderColor: GOLD + '66' }}
            >
              {[
                { label: 'Full Name',   value: report.fullName   },
                { label: 'Student ID',  value: report.studentId  },
                { label: 'Class',       value: report.className  },
                { label: 'Gender',      value: report.gender     },
              ].map(({ label, value }) => (
                <div key={label} className="bg-amber-50 px-3 sm:px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">{label}</p>
                  <p className="font-semibold text-gray-900 mt-0.5 text-sm sm:text-base">{value}</p>
                </div>
              ))}
            </div>

            {/* ── SCORES TABLE ── */}
            <div>
              <SectionLabel>Academic Performance</SectionLabel>
              {/* Desktop table */}
              <div className="hidden sm:block rounded-lg overflow-hidden border border-gray-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ backgroundColor: NAVY }} className="text-white">
                      <th className="text-left px-4 py-2.5 font-medium">Subject</th>
                      <th className="text-center px-3 py-2.5 font-medium">Class Score<br /><span className="text-xs font-normal opacity-70">/30</span></th>
                      <th className="text-center px-3 py-2.5 font-medium">Exam Score<br /><span className="text-xs font-normal opacity-70">/70</span></th>
                      <th className="text-center px-3 py-2.5 font-medium">Total<br /><span className="text-xs font-normal opacity-70">/100</span></th>
                      <th className="text-center px-3 py-2.5 font-medium">Grade</th>
                      <th className="text-center px-3 py-2.5 font-medium">Remark</th>
                      <th className="text-left px-4 py-2.5 font-medium">Teacher</th>
                      <th className="text-left px-4 py-2.5 font-medium">Teacher's Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {report.scores.map((sc, i) => (
                      <tr key={sc.subjectCode} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-2.5">
                          <span className="font-medium text-gray-900">{sc.subjectName}</span>
                          <span className="ml-2 text-xs text-gray-400">({sc.subjectCode})</span>
                        </td>
                        <td className="text-center px-3 py-2.5 font-mono text-gray-700">{sc.classScore}</td>
                        <td className="text-center px-3 py-2.5 font-mono text-gray-700">{sc.examScore}</td>
                        <td className="text-center px-3 py-2.5 font-mono font-semibold text-gray-900">{sc.total}</td>
                        <td className="text-center px-3 py-2.5">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold border ${gradeChipClass(sc.grade)}`}>
                            {sc.grade}
                          </span>
                        </td>
                        <td className="text-center px-3 py-2.5 text-xs text-gray-600">{sc.remark}</td>
                        <td className="px-4 py-2.5 text-xs text-gray-600">
                          {sc.teacherName ? (
                            <div className="flex flex-col items-start gap-1">
                              {sc.teacherSignature && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={`/${sc.teacherSignature}`} alt="sig" className="h-6 object-contain" />
                              )}
                              <span>{sc.teacherName}</span>
                            </div>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-2.5 text-xs text-gray-500 italic">{sc.teacherRemark ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ backgroundColor: NAVY + '18', borderTop: `2px solid ${GOLD}` }}>
                      <td colSpan={3} className="px-4 py-2.5 font-bold text-gray-800 text-right">Aggregate Total</td>
                      <td className="text-center px-3 py-2.5 font-bold font-mono text-lg" style={{ color: NAVY }}>{report.aggregate}</td>
                      <td colSpan={4} className="px-4 py-2.5 text-xs text-gray-500">Out of {maxAggregate}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Mobile score cards */}
              <div className="sm:hidden space-y-2">
                {report.scores.map((sc) => (
                  <div key={sc.subjectCode} className="rounded-lg border border-gray-200 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-medium text-gray-900 text-sm">{sc.subjectName}</span>
                        <span className="ml-1.5 text-xs text-gray-400">({sc.subjectCode})</span>
                      </div>
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold border ${gradeChipClass(sc.grade)}`}>
                        {sc.grade}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs mb-1.5">
                      <div className="bg-gray-50 rounded p-1.5">
                        <p className="text-gray-400">Class /30</p>
                        <p className="font-mono font-semibold text-gray-800">{sc.classScore}</p>
                      </div>
                      <div className="bg-gray-50 rounded p-1.5">
                        <p className="text-gray-400">Exam /70</p>
                        <p className="font-mono font-semibold text-gray-800">{sc.examScore}</p>
                      </div>
                      <div className="bg-gray-50 rounded p-1.5">
                        <p className="text-gray-400">Total /100</p>
                        <p className="font-mono font-bold" style={{ color: NAVY }}>{sc.total}</p>
                      </div>
                    </div>
                    {sc.teacherRemark && (
                      <p className="text-xs text-gray-400 italic">{sc.teacherRemark}</p>
                    )}
                  </div>
                ))}
                <div className="rounded-lg p-3 font-semibold flex justify-between items-center" style={{ backgroundColor: NAVY + '12', borderTop: `2px solid ${GOLD}` }}>
                  <span className="text-sm text-gray-700">Aggregate Total</span>
                  <span className="font-mono font-bold text-lg" style={{ color: NAVY }}>{report.aggregate} <span className="text-xs font-normal text-gray-400">/ {maxAggregate}</span></span>
                </div>
              </div>
            </div>

            {/* ── GRADING LEGEND ── */}
            <div>
              <SectionLabel>Grading Scale (Ghana GES)</SectionLabel>
              <div className="flex flex-wrap gap-1.5">
                {GRADING_LEGEND.map(({ grade, range, remark, chip }) => (
                  <div key={grade} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs ${chip}`}>
                    <span className="font-bold">{grade}</span>
                    <span className="opacity-70">{range}</span>
                    <span className="hidden sm:inline opacity-60">· {remark}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── SUMMARY CARDS ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="rounded-xl p-5 text-white text-center" style={{ backgroundColor: NAVY }}>
                <p className="text-xs font-semibold uppercase tracking-widest opacity-70 mb-2">Aggregate Score</p>
                <p className="text-4xl font-bold" style={{ color: GOLD }}>{report.aggregate}</p>
                <p className="text-xs mt-2 opacity-60">Out of {maxAggregate}</p>
              </div>
              <div className="rounded-xl p-5 text-center border-2" style={{ borderColor: GOLD, backgroundColor: GOLD + '12' }}>
                <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: NAVY }}>Position in Class</p>
                <p className="text-4xl font-bold" style={{ color: NAVY }}>{report.position}</p>
                <p className="text-xs mt-2 text-gray-500">Out of {report.classSize} student{report.classSize !== 1 ? 's' : ''}</p>
              </div>
              <div className="rounded-xl p-5 text-center border border-gray-200 bg-gray-50">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">Attendance Rate</p>
                <p
                  className="text-4xl font-bold"
                  style={{ color: attendancePct !== null && attendancePct >= 75 ? '#16a34a' : '#dc2626' }}
                >
                  {attendancePct !== null ? `${attendancePct}%` : '—'}
                </p>
                <p className="text-xs mt-2 text-gray-500">
                  {attendance ? `${attendance.daysPresent} / ${attendance.totalDays} days` : 'No data'}
                </p>
              </div>
            </div>

            {/* ── ATTENDANCE BREAKDOWN ── */}
            {attendance && (
              <div>
                <SectionLabel>Attendance Summary</SectionLabel>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-px rounded-lg overflow-hidden border border-gray-200">
                  {[
                    { label: 'Days Present',     value: attendance.daysPresent,         color: 'text-green-700' },
                    { label: 'Days Absent',       value: daysAbsent!,                    color: 'text-red-600'   },
                    { label: 'Total School Days', value: attendance.totalDays,           color: 'text-gray-800'  },
                    { label: 'Attendance %',      value: `${attendancePct}%`,            color: attendancePct! >= 75 ? 'text-green-700' : 'text-red-600' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-white px-4 py-3 text-center">
                      <p className="text-xs text-gray-500 font-medium">{label}</p>
                      <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── REMARKS ── */}
            {report.remarks && (
              <div>
                <SectionLabel>Remarks</SectionLabel>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-lg border border-gray-200 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: NAVY }}>
                      Class Teacher's Remark
                    </p>
                    <p className="text-sm text-gray-700 italic leading-relaxed">
                      "{report.remarks.classTeacherRemark ?? 'No remark provided.'}"
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: NAVY }}>
                      Head Teacher's Remark
                    </p>
                    <p className="text-sm text-gray-700 italic leading-relaxed">
                      "{report.remarks.headTeacherRemark ?? 'No remark provided.'}"
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ── NEXT TERM BEGINS ── */}
            {report.remarks?.nextTermBegins && (
              <div
                className="rounded-lg px-4 sm:px-5 py-3 flex items-center gap-3"
                style={{ backgroundColor: GOLD + '22', borderLeft: `4px solid ${GOLD}` }}
              >
                <svg className="w-5 h-5 shrink-0" style={{ color: GOLD }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm font-medium text-gray-800">
                  Next term begins:{' '}
                  <span className="font-bold" style={{ color: NAVY }}>{report.remarks.nextTermBegins}</span>
                </p>
              </div>
            )}

            {/* ── SIGNATURES ── */}
            <div>
              <SectionLabel>Signatures</SectionLabel>
              <div className="grid grid-cols-3 gap-4 sm:gap-6">
                {/* Class Teacher */}
                <div className="text-center">
                  <div className="h-10 sm:h-12 flex items-end justify-center mb-1">
                    {report.classTeacherSignature ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={`/${report.classTeacherSignature}`} alt="Class teacher signature" className="max-h-10 object-contain" />
                    ) : (
                      <div className="w-full border-b-2 border-gray-400 border-dashed mx-2 sm:mx-4" />
                    )}
                  </div>
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Class Teacher</p>
                  {report.classTeacherName && (
                    <p className="text-xs text-gray-500 mt-0.5">{report.classTeacherName}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">Signature &amp; Date</p>
                </div>
                {/* Head Teacher */}
                <div className="text-center">
                  <div className="h-10 sm:h-12 border-b-2 border-gray-400 border-dashed mx-2 sm:mx-4 mb-2" />
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Head Teacher</p>
                  <p className="text-xs text-gray-400 mt-0.5">Signature &amp; Date</p>
                </div>
                {/* Parent */}
                <div className="text-center">
                  <div className="h-10 sm:h-12 border-b-2 border-gray-400 border-dashed mx-2 sm:mx-4 mb-2" />
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Parent / Guardian</p>
                  <p className="text-xs text-gray-400 mt-0.5">Signature &amp; Date</p>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom gold bar */}
          <div className="h-2" style={{ backgroundColor: GOLD }} />
        </div>

        {/* Bottom nav */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-5 print:hidden">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <PrintButton />
            <Link
              href={`/reports/${studentId}/pdf`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
              style={{ backgroundColor: NAVY }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
              Download PDF
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
