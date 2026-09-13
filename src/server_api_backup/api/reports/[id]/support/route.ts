import { NextResponse } from 'next/server';
import { toggleSupport } from '@/lib/db';

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
    const deviceId = body.deviceId || 'anonymous-device';

    const result = toggleSupport(id, deviceId);
    return NextResponse.json({ data: result });
  } catch (err: any) {
    console.error('Error en POST /api/reports/[id]/support:', err);
    return NextResponse.json({ error: 'Error al registrar apoyo cívico' }, { status: 500 });
  }
}
