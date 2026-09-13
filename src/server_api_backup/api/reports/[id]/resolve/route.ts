import { NextResponse } from 'next/server';
import { resolveReport } from '@/lib/db';

export function generateStaticParams() {
  return [];
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const resolvedImageUrl = body.resolved_image_url || undefined;

    const updated = resolveReport(id, resolvedImageUrl);
    if (!updated) {
      return NextResponse.json({ error: 'Denuncia no encontrada para resolución' }, { status: 404 });
    }

    return NextResponse.json({ data: updated });
  } catch (err: any) {
    console.error('Error en POST /api/reports/[id]/resolve:', err);
    return NextResponse.json({ error: 'Error al marcar reporte como resuelto' }, { status: 500 });
  }
}
