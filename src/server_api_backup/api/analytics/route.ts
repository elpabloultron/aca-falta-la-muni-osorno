import { NextResponse } from 'next/server';
import { getMunicipalBehaviorStats } from '@/lib/db';

export async function GET() {
  try {
    const stats = getMunicipalBehaviorStats();
    return NextResponse.json({ data: stats });
  } catch (err: any) {
    console.error('Error en GET /api/analytics:', err);
    return NextResponse.json(
      { error: 'Error al calcular analítica de comportamiento municipal' },
      { status: 500 }
    );
  }
}
