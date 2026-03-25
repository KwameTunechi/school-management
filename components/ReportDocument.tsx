import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';
import type { StudentReport } from '@/lib/reports';
import { SCHOOL_NAME, SCHOOL_UNIT, SCHOOL_MOTTO } from '@/lib/constants';

const NAVY = '#0d1b2a';
const GOLD = '#c9952a';
const LIGHT_GRAY = '#f5f5f5';
const MID_GRAY = '#e0e0e0';
const TEXT_GRAY = '#555555';

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    paddingTop: 30,
    paddingBottom: 30,
    paddingHorizontal: 35,
    color: '#1a1a1a',
  },

  // ── Header ──
  headerAccent: { height: 5, backgroundColor: GOLD, marginBottom: 0 },
  headerBlock: {
    backgroundColor: NAVY,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerSub: { fontSize: 7, color: GOLD, letterSpacing: 2, marginBottom: 4, textTransform: 'uppercase' },
  headerTitle: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#ffffff', marginBottom: 2 },
  headerMotto: { fontSize: 8, color: '#b0c4de', fontFamily: 'Helvetica-Oblique', marginBottom: 10 },
  headerDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', width: '60%', marginBottom: 8 },
  headerReportTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#ffffff', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 3 },
  headerTermYear: { fontSize: 8, color: '#b0c4de' },
  headerAccentBottom: { height: 3, backgroundColor: GOLD, marginBottom: 12 },

  // ── Section label ──
  sectionLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    borderBottomWidth: 1.5,
    borderBottomColor: GOLD,
    paddingBottom: 3,
    marginBottom: 6,
    marginTop: 10,
  },

  // ── Student info strip ──
  infoRow: { flexDirection: 'row', marginBottom: 10 },
  infoCell: { flex: 1, backgroundColor: '#fffbf0', padding: 7, marginRight: 2 },
  infoCellLast: { flex: 1, backgroundColor: '#fffbf0', padding: 7 },
  infoLabel: { fontSize: 6.5, color: '#b45309', fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 },
  infoValue: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#1a1a1a' },

  // ── Table ──
  tableHeader: { flexDirection: 'row', backgroundColor: NAVY, paddingVertical: 5 },
  tableHeaderCell: { color: '#ffffff', fontFamily: 'Helvetica-Bold', fontSize: 7.5, textAlign: 'center' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: MID_GRAY },
  tableRowAlt: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: MID_GRAY, backgroundColor: LIGHT_GRAY },
  tableCell: { fontSize: 8, paddingVertical: 4, paddingHorizontal: 4, textAlign: 'center', color: '#333333' },
  tableCellLeft: { fontSize: 8, paddingVertical: 4, paddingHorizontal: 6, textAlign: 'left', color: '#1a1a1a' },
  tableCellItalic: { fontSize: 7.5, paddingVertical: 4, paddingHorizontal: 4, textAlign: 'left', color: TEXT_GRAY, fontFamily: 'Helvetica-Oblique' },
  tableFooter: { flexDirection: 'row', backgroundColor: '#e8edf5', borderTopWidth: 1.5, borderTopColor: GOLD, paddingVertical: 5 },
  tableFooterLabel: { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: '#1a1a1a', textAlign: 'right', paddingRight: 6, paddingVertical: 2 },
  tableFooterValue: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: NAVY, textAlign: 'center', paddingVertical: 1 },

  // Grade chip colour mapping handled inline

  // ── Summary row ──
  summaryRow: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  summaryCard: { flex: 1, backgroundColor: NAVY, padding: 10, alignItems: 'center' },
  summaryCardGold: { flex: 1, borderWidth: 1.5, borderColor: GOLD, padding: 10, alignItems: 'center', backgroundColor: '#fdf8ee' },
  summaryCardGray: { flex: 1, borderWidth: 1, borderColor: MID_GRAY, padding: 10, alignItems: 'center', backgroundColor: LIGHT_GRAY },
  summaryLabel: { fontSize: 6.5, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  summaryValue: { fontSize: 20, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  summarySubtext: { fontSize: 7, color: TEXT_GRAY },

  // ── Attendance grid ──
  attRow: { flexDirection: 'row', marginBottom: 10 },
  attCell: { flex: 1, padding: 8, alignItems: 'center', borderRightWidth: 0.5, borderRightColor: MID_GRAY, backgroundColor: '#ffffff', borderWidth: 0.5, borderColor: MID_GRAY, marginRight: 2 },
  attCellLast: { flex: 1, padding: 8, alignItems: 'center', backgroundColor: '#ffffff', borderWidth: 0.5, borderColor: MID_GRAY },
  attLabel: { fontSize: 7, color: TEXT_GRAY, marginBottom: 3 },
  attValue: { fontSize: 14, fontFamily: 'Helvetica-Bold' },

  // ── Remarks ──
  remarksRow: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  remarkBox: { flex: 1, borderWidth: 0.5, borderColor: MID_GRAY, padding: 8 },
  remarkLabel: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: NAVY, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  remarkText: { fontSize: 8, color: '#444444', fontFamily: 'Helvetica-Oblique', lineHeight: 1.4 },

  // ── Next term ──
  nextTermBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fdf8ee', borderLeftWidth: 3, borderLeftColor: GOLD, paddingVertical: 6, paddingHorizontal: 10, marginBottom: 10 },
  nextTermText: { fontSize: 8, color: '#555' },
  nextTermValue: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: NAVY },

  // ── Signatures ──
  sigRow: { flexDirection: 'row', marginTop: 6 },
  sigCell: { flex: 1, alignItems: 'center', paddingHorizontal: 10, marginRight: 6 },
  sigCellLast: { flex: 1, alignItems: 'center', paddingHorizontal: 10 },
  sigLine: { borderBottomWidth: 1, borderBottomColor: '#aaaaaa', width: '100%', marginBottom: 4 },
  sigLabel: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#555', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 1 },
  sigSub: { fontSize: 6.5, color: '#aaa' },

  // ── Grading legend ──
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 3, marginBottom: 10 },
  legendChip: { flexDirection: 'row', paddingHorizontal: 5, paddingVertical: 2, borderWidth: 0.5 },
  legendGrade: { fontSize: 7, fontFamily: 'Helvetica-Bold', marginRight: 3 },
  legendRange: { fontSize: 7, color: TEXT_GRAY },
});

// Column widths for scores table (teacher col added)
const COL = { subject: '24%', cs: '9%', es: '9%', total: '9%', grade: '7%', remark: '11%', teacher: '16%', note: '15%' };

function gradeColors(grade: string): { bg: string; color: string; border: string } {
  if (['A1', 'B2', 'B3'].includes(grade)) return { bg: '#dcfce7', color: '#15803d', border: '#86efac' };
  if (['C4', 'C5', 'C6', 'D7', 'E8'].includes(grade)) return { bg: '#dbeafe', color: '#1d4ed8', border: '#93c5fd' };
  return { bg: '#fee2e2', color: '#dc2626', border: '#fca5a5' };
}

const GRADING_LEGEND = [
  { grade: 'A1', range: '90–100', remark: 'Excellent' },
  { grade: 'B2', range: '80–89', remark: 'Very Good' },
  { grade: 'B3', range: '70–79', remark: 'Good' },
  { grade: 'C4', range: '60–69', remark: 'Credit' },
  { grade: 'C5', range: '55–59', remark: 'Credit' },
  { grade: 'C6', range: '50–54', remark: 'Credit' },
  { grade: 'D7', range: '45–49', remark: 'Pass' },
  { grade: 'E8', range: '40–44', remark: 'Pass' },
  { grade: 'F9', range: '0–39', remark: 'Fail' },
];

export function ReportDocument({ report }: { report: StudentReport }) {
  const { attendance } = report;
  const daysAbsent = attendance ? attendance.totalDays - attendance.daysPresent : 0;
  const attendancePct = attendance
    ? Math.round((attendance.daysPresent / attendance.totalDays) * 100)
    : 0;
  const maxAggregate = report.scores.length * 100;

  return (
    <Document
      title={`Terminal Report — ${report.fullName} — Term ${report.term} ${report.year}`}
      author={SCHOOL_NAME}
    >
      <Page size="A4" style={s.page}>

        {/* ── Header ── */}
        <View style={s.headerAccent} />
        <View style={s.headerBlock}>
          <Text style={s.headerSub}>{SCHOOL_UNIT}</Text>
          <Text style={s.headerTitle}>{SCHOOL_NAME}</Text>
          <Text style={s.headerMotto}>{SCHOOL_MOTTO}</Text>
          <View style={s.headerDivider} />
          <Text style={s.headerReportTitle}>End of Term Report</Text>
          <Text style={s.headerTermYear}>
            Term {report.term}  ·  Academic Year {report.year}/{report.year + 1}
          </Text>
        </View>
        <View style={s.headerAccentBottom} />

        {/* ── Student Info ── */}
        <Text style={s.sectionLabel}>Student Information</Text>
        <View style={s.infoRow}>
          {[
            { label: 'Full Name', value: report.fullName },
            { label: 'Student ID', value: report.studentId },
            { label: 'Class', value: report.className },
            { label: 'Gender', value: report.gender },
          ].map(({ label, value }, i, arr) => (
            <View key={label} style={i === arr.length - 1 ? s.infoCellLast : s.infoCell}>
              <Text style={s.infoLabel}>{label}</Text>
              <Text style={s.infoValue}>{value}</Text>
            </View>
          ))}
        </View>

        {/* ── Scores Table ── */}
        <Text style={s.sectionLabel}>Academic Performance</Text>
        {/* Header row */}
        <View style={s.tableHeader}>
          <Text style={[s.tableHeaderCell, { width: COL.subject, textAlign: 'left', paddingLeft: 6 }]}>Subject</Text>
          <Text style={[s.tableHeaderCell, { width: COL.cs }]}>Class{'\n'}/30</Text>
          <Text style={[s.tableHeaderCell, { width: COL.es }]}>Exam{'\n'}/70</Text>
          <Text style={[s.tableHeaderCell, { width: COL.total }]}>Total{'\n'}/100</Text>
          <Text style={[s.tableHeaderCell, { width: COL.grade }]}>Grade</Text>
          <Text style={[s.tableHeaderCell, { width: COL.remark }]}>Remark</Text>
          <Text style={[s.tableHeaderCell, { width: COL.teacher, textAlign: 'left', paddingLeft: 4 }]}>Teacher</Text>
          <Text style={[s.tableHeaderCell, { width: COL.note, textAlign: 'left', paddingLeft: 4 }]}>Teacher's Note</Text>
        </View>
        {report.scores.map((sc, i) => {
          const gc = gradeColors(sc.grade);
          return (
            <View key={sc.subjectCode} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
              <View style={{ width: COL.subject, flexDirection: 'row', alignItems: 'center' }}>
                <Text style={s.tableCellLeft}>{sc.subjectName}</Text>
                <Text style={{ fontSize: 7, color: '#aaa', paddingVertical: 4 }}>({sc.subjectCode})</Text>
              </View>
              <Text style={[s.tableCell, { width: COL.cs }]}>{sc.classScore}</Text>
              <Text style={[s.tableCell, { width: COL.es }]}>{sc.examScore}</Text>
              <Text style={[s.tableCell, { width: COL.total, fontFamily: 'Helvetica-Bold' }]}>{sc.total}</Text>
              <View style={{ width: COL.grade, alignItems: 'center', justifyContent: 'center', paddingVertical: 3 }}>
                <View style={{ backgroundColor: gc.bg, borderWidth: 0.5, borderColor: gc.border, paddingHorizontal: 4, paddingVertical: 1.5, borderRadius: 2 }}>
                  <Text style={{ fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: gc.color }}>{sc.grade}</Text>
                </View>
              </View>
              <Text style={[s.tableCell, { width: COL.remark, fontSize: 7.5 }]}>{sc.remark}</Text>
              <View style={{ width: COL.teacher, paddingVertical: 3, paddingHorizontal: 4, justifyContent: 'center' }}>
                {sc.teacherSignature ? (
                  <Image
                    src={`${process.cwd()}/public/${sc.teacherSignature}`}
                    style={{ height: 14, objectFit: 'contain', marginBottom: 1 }}
                  />
                ) : null}
                <Text style={{ fontSize: 7, color: TEXT_GRAY }}>{sc.teacherName ?? '—'}</Text>
              </View>
              <Text style={[s.tableCellItalic, { width: COL.note }]}>{sc.teacherRemark ?? '—'}</Text>
            </View>
          );
        })}
        {/* Footer */}
        <View style={s.tableFooter}>
          <Text style={[s.tableFooterLabel, { width: `${parseInt(COL.subject) + parseInt(COL.cs) + parseInt(COL.es)}%` }]}>
            Aggregate Total
          </Text>
          <Text style={[s.tableFooterValue, { width: COL.total }]}>{report.aggregate}</Text>
          <Text style={[s.tableCell, { width: `${parseInt(COL.grade) + parseInt(COL.remark) + parseInt(COL.teacher) + parseInt(COL.note)}%`, fontSize: 7.5, color: TEXT_GRAY }]}>
            Out of {maxAggregate}
          </Text>
        </View>

        {/* ── Grading Legend ── */}
        <Text style={[s.sectionLabel, { marginTop: 8 }]}>Grading Scale (Ghana GES)</Text>
        <View style={s.legendRow}>
          {GRADING_LEGEND.map(({ grade, range, remark }) => {
            const gc = gradeColors(grade);
            return (
              <View key={grade} style={[s.legendChip, { backgroundColor: gc.bg, borderColor: gc.border }]}>
                <Text style={[s.legendGrade, { color: gc.color }]}>{grade}</Text>
                <Text style={s.legendRange}>{range} · {remark}</Text>
              </View>
            );
          })}
        </View>

        {/* ── Summary Row ── */}
        <Text style={s.sectionLabel}>Summary</Text>
        <View style={s.summaryRow}>
          <View style={s.summaryCard}>
            <Text style={[s.summaryLabel, { color: GOLD }]}>Aggregate Score</Text>
            <Text style={[s.summaryValue, { color: GOLD }]}>{report.aggregate}</Text>
            <Text style={[s.summarySubtext, { color: 'rgba(255,255,255,0.5)' }]}>Out of {maxAggregate}</Text>
          </View>
          <View style={s.summaryCardGold}>
            <Text style={[s.summaryLabel, { color: NAVY }]}>Position in Class</Text>
            <Text style={[s.summaryValue, { color: NAVY }]}>{report.position}</Text>
            <Text style={s.summarySubtext}>Out of {report.classSize} students</Text>
          </View>
          <View style={s.summaryCardGray}>
            <Text style={[s.summaryLabel, { color: TEXT_GRAY }]}>Attendance Rate</Text>
            <Text style={[s.summaryValue, { color: attendancePct >= 75 ? '#16a34a' : '#dc2626' }]}>
              {attendance ? `${attendancePct}%` : '—'}
            </Text>
            <Text style={s.summarySubtext}>
              {attendance ? `${attendance.daysPresent} / ${attendance.totalDays} days` : 'No data'}
            </Text>
          </View>
        </View>

        {/* ── Attendance Breakdown ── */}
        {attendance && (
          <>
            <Text style={s.sectionLabel}>Attendance Breakdown</Text>
            <View style={s.attRow}>
              {[
                { label: 'Days Present', value: String(attendance.daysPresent), color: '#16a34a' },
                { label: 'Days Absent', value: String(daysAbsent), color: '#dc2626' },
                { label: 'Total School Days', value: String(attendance.totalDays), color: '#1a1a1a' },
                { label: 'Attendance %', value: `${attendancePct}%`, color: attendancePct >= 75 ? '#16a34a' : '#dc2626' },
              ].map(({ label, value, color }, i, arr) => (
                <View key={label} style={i === arr.length - 1 ? s.attCellLast : s.attCell}>
                  <Text style={s.attLabel}>{label}</Text>
                  <Text style={[s.attValue, { color }]}>{value}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* ── Remarks ── */}
        {report.remarks && (
          <>
            <Text style={s.sectionLabel}>Remarks</Text>
            <View style={s.remarksRow}>
              <View style={s.remarkBox}>
                <Text style={s.remarkLabel}>Class Teacher's Remark</Text>
                <Text style={s.remarkText}>"{report.remarks.classTeacherRemark ?? 'No remark provided.'}"</Text>
              </View>
              <View style={s.remarkBox}>
                <Text style={s.remarkLabel}>Head Teacher's Remark</Text>
                <Text style={s.remarkText}>"{report.remarks.headTeacherRemark ?? 'No remark provided.'}"</Text>
              </View>
            </View>
          </>
        )}

        {/* ── Next Term ── */}
        {report.remarks?.nextTermBegins && (
          <View style={s.nextTermBar}>
            <Text style={s.nextTermText}>Next term begins:  </Text>
            <Text style={s.nextTermValue}>{report.remarks.nextTermBegins}</Text>
          </View>
        )}

        {/* ── Signatures ── */}
        <Text style={s.sectionLabel}>Signatures</Text>
        <View style={s.sigRow}>
          {/* Class Teacher */}
          <View style={s.sigCell}>
            <View style={{ height: 30, justifyContent: 'flex-end' }}>
              {report.classTeacherSignature ? (
                <Image
                  src={`${process.cwd()}/public/${report.classTeacherSignature}`}
                  style={{ height: 24, objectFit: 'contain' }}
                />
              ) : null}
            </View>
            <View style={s.sigLine} />
            <Text style={s.sigLabel}>Class Teacher</Text>
            {report.classTeacherName ? (
              <Text style={[s.sigSub, { color: '#555' }]}>{report.classTeacherName}</Text>
            ) : null}
            <Text style={s.sigSub}>Signature &amp; Date</Text>
          </View>
          {/* Head Teacher */}
          <View style={s.sigCell}>
            <View style={{ height: 30 }} />
            <View style={s.sigLine} />
            <Text style={s.sigLabel}>Head Teacher</Text>
            <Text style={s.sigSub}>Signature &amp; Date</Text>
          </View>
          {/* Parent */}
          <View style={s.sigCellLast}>
            <View style={{ height: 30 }} />
            <View style={s.sigLine} />
            <Text style={s.sigLabel}>Parent / Guardian</Text>
            <Text style={s.sigSub}>Signature &amp; Date</Text>
          </View>
        </View>

      </Page>
    </Document>
  );
}
