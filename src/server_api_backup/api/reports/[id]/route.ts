import { NextResponse } from 'next/server';
import { getReportById } from '@/lib/db';

export function generateStaticParams() {
  return [];
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const report = getReportById(id);

    if (!report) {
      return NextResponse.json({ error: 'Denuncia comunal no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ data: report });
  } catch (err: any) {
    return NextResponse.json({ error: 'Error al consultar reporte' }, { status: 500 });
  }
}
