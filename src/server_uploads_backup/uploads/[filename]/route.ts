import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';

export function generateStaticParams() {
  return [];
}

type RouteContext = {
  params: Promise<{ filename: string }> | { filename: string };
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const resolvedParams = await context.params;
    const filename = resolvedParams.filename;

    if (!filename) {
      return new NextResponse('Nombre de archivo inválido', { status: 400 });
    }

    // Sanitización contra path traversal
    const safeFilename = path.basename(filename);
    const filePath = path.join(process.cwd(), 'public', 'uploads', safeFilename);

    if (!fs.existsSync(filePath)) {
      return new NextResponse('Archivo no encontrado', { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const ext = path.extname(safeFilename).toLowerCase();
    const mimeType =
      ext === '.webp'
        ? 'image/webp'
        : ext === '.png'
        ? 'image/png'
        : ext === '.svg'
        ? 'image/svg+xml'
        : 'image/jpeg';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err) {
    console.error('Error sirviendo archivo de subida:', err);
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
}
