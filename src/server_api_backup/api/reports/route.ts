import { NextResponse } from 'next/server';
import { getAllReports, createReport } from '@/lib/db';
import { isWithinOsornoBounds } from '@/lib/geo-utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const status = searchParams.get('status') || undefined;
    const sector = searchParams.get('sector') || undefined;
    const isRuralParam = searchParams.get('is_rural');
    const isRural = isRuralParam !== null ? isRuralParam === 'true' : undefined;

    const results = getAllReports({
      category,
      status,
      sector,
      isRural,
    });

    return NextResponse.json({
      data: results,
      total: results.length,
    });
  } catch (error: any) {
    console.error('Error en GET /api/reports:', error);
    return NextResponse.json(
      { error: 'Error al consultar denuncias comunales de Osorno' },
      { status: 500 }
    );
  }
}

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hora
const MAX_REQUESTS_PER_WINDOW = 5;
const ipRequestHistory = new Map<string, number[]>();

function isRateLimited(clientIdentifier: string): boolean {
  const now = Date.now();
  const timestamps = (ipRequestHistory.get(clientIdentifier) || []).filter(
    (ts) => now - ts < RATE_LIMIT_WINDOW_MS
  );

  if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  timestamps.push(now);
  ipRequestHistory.set(clientIdentifier, timestamps);
  return false;
}

export async function POST(request: Request) {
  try {
    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'unknown-ip';

    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        {
          error:
            'Has alcanzado el límite preventivo de 5 denuncias por hora desde esta conexión. Por favor aguarda unos minutos para registrar nuevos reclamos.',
        },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Verificación honeypot anti-spam
    if (body.hp_field) {
      return NextResponse.json({ error: 'Spam detectado' }, { status: 400 });
    }

    if (!body.title || !body.description || !body.category) {
      return NextResponse.json(
        { error: 'Título, descripción y categoría son requeridos.' },
        { status: 400 }
      );
    }

    if (body.latitude && body.longitude) {
      if (!isWithinOsornoBounds(body.latitude, body.longitude)) {
        return NextResponse.json(
          { error: 'Las coordenadas están fuera de la comuna de Osorno.' },
          { status: 400 }
        );
      }
    }

    const createdReport = createReport({
      title: body.title,
      description: body.description,
      category: body.category,
      sector: body.sector || 'Centro',
      is_rural: Boolean(body.is_rural),
      address_reference: body.address_reference || 'Comuna de Osorno',
      latitude: body.latitude,
      longitude: body.longitude,
      image_url: body.image_url,
      author_name: body.is_anonymous
        ? 'Vecino de Osorno (Anónimo)'
        : body.author_name?.trim() || 'Vecino de Osorno',
      is_anonymous: Boolean(body.is_anonymous),
    });

    return NextResponse.json({ data: createdReport }, { status: 201 });
  } catch (err: any) {
    console.error('Error en POST /api/reports:', err);
    return NextResponse.json({ error: 'Error al procesar el reporte en base de datos' }, { status: 500 });
  }
}
