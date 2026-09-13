import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';

export async function POST(request: Request) {
  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const contentType = request.headers.get('content-type') || '';
    let buffer: Buffer | null = null;
    let extension = 'webp';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = (formData.get('file') || formData.get('image')) as File | null;

      if (!file) {
        return NextResponse.json({ error: 'No se envió ningún archivo.' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      buffer = Buffer.from(bytes);

      if (file.type === 'image/jpeg' || file.name.endsWith('.jpg') || file.name.endsWith('.jpeg')) {
        extension = 'jpg';
      } else if (file.type === 'image/png' || file.name.endsWith('.png')) {
        extension = 'png';
      } else {
        extension = 'webp';
      }
    } else if (contentType.includes('application/json')) {
      const body = await request.json();
      const base64Data: string = body.image || body.data;

      if (!base64Data) {
        return NextResponse.json({ error: 'No se envió ninguna imagen base64.' }, { status: 400 });
      }

      // Limpiar prefijo data:image/...;base64,
      const matches = base64Data.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      if (matches) {
        const mimeType = matches[1].toLowerCase();
        extension = mimeType === 'jpeg' ? 'jpg' : mimeType;
        buffer = Buffer.from(matches[2], 'base64');
      } else {
        buffer = Buffer.from(base64Data, 'base64');
      }
    } else {
      return NextResponse.json(
        { error: 'Tipo de contenido no soportado. Usa multipart/form-data o application/json.' },
        { status: 415 }
      );
    }

    if (!buffer || buffer.length === 0) {
      return NextResponse.json({ error: 'El archivo de imagen está vacío.' }, { status: 400 });
    }

    // Límite de 5 MB
    if (buffer.length > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'La imagen excede el límite máximo de 5 MB.' }, { status: 413 });
    }

    const uniqueName = `evidencia_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${extension}`;
    const filePath = path.join(uploadDir, uniqueName);
    fs.writeFileSync(filePath, buffer);

    const relativeUrl = `/uploads/${uniqueName}`;

    return NextResponse.json({
      success: true,
      url: relativeUrl,
      filename: uniqueName,
      size: buffer.length,
    });
  } catch (error: any) {
    console.error('Error al subir imagen en /api/upload:', error);
    return NextResponse.json(
      { error: 'Error interno al procesar y guardar la imagen en disco.' },
      { status: 500 }
    );
  }
}
