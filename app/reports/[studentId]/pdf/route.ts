import { renderToBuffer } from '@react-pdf/renderer';
import { notFound } from 'next/navigation';
import { buildReport } from '@/lib/reports';
import { ReportDocument } from '@/components/ReportDocument';

export async function GET(_req: Request, ctx: RouteContext<'/reports/[studentId]/pdf'>) {
  const { studentId } = await ctx.params;
  const report = buildReport(studentId);

  if (!report) notFound();

  const nodeBuffer = await renderToBuffer(ReportDocument({ report }));
  const buffer = nodeBuffer.buffer.slice(
    nodeBuffer.byteOffset,
    nodeBuffer.byteOffset + nodeBuffer.byteLength
  ) as ArrayBuffer;

  const filename = `report_${studentId}_Term${report.term}_${report.year}.pdf`;

  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.byteLength.toString(),
    },
  });
}
