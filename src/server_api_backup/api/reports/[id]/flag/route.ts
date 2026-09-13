import { NextResponse } from 'next/server';
import { flagReport, getReportById } from '@/lib/db';

export function generateStaticParams() {
  return [];
}

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const resolvedParams = await context.params;
    const reportId = resolvedParams.id;

    if (!reportId) {
      return NextResponse.json({ error: 'ID de reporte no especificado.' }, { status: 400 });
    }

    const report = getReportById(reportId);
    if (!report) {
      return NextResponse.json({ error: 'Reporte no encontrado en Osorno.' }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'unknown-ip';
    const userAgent = request.headers.get('user-agent') || 'generic-client';

    const deviceId = body.device_id || `dev_${Buffer.from(clientIp + userAgent).toString('hex').slice(0, 16)}`;
    const reason = body.reason?.trim() || 'Contenido inadecuado, falso o spam';

    const result = flagReport(reportId, deviceId, reason);

    return NextResponse.json({
      success: true,
      flagged: result.flagged,
      flags_count: result.flagsCount,
      is_hidden: result.isHidden,
      message: result.flagged
        ? 'Denuncia recibida correctamente. Gracias por proteger a la comunidad.'
        : 'Ya habías reportado esta publicación previamente desde tu dispositivo.',
    });
  } catch (error: any) {
    console.error('Error en POST /api/reports/[id]/flag:', error);
    return NextResponse.json(
      { error: 'Error interno al procesar la moderación de la publicación.' },
      { status: 500 }
    );
  }
}
