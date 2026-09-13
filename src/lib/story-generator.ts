import { Report } from '@/types/report';
import { CATEGORIAS_REPORTE } from '@/config/osorno';

/**
 * Generador nativo en Canvas de Gráfica para Historia de Instagram (1080 x 1920 px, 9:16).
 * Cero dependencias externas. Genera una imagen lista para publicar en Instagram Stories.
 */
export async function generateInstagramStoryImage(report: Report): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('No se pudo inicializar el lienzo Canvas.'));
      return;
    }

    const catInfo = CATEGORIAS_REPORTE[report.category] || {
      name: 'Problema Urbano',
      color: '#F4CA19',
    };

    // 1. Fondo degradado táctico oscuro (#101012 a #1A1A1E)
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 1920);
    bgGrad.addColorStop(0, '#0D0D0E');
    bgGrad.addColorStop(0.5, '#141417');
    bgGrad.addColorStop(1, '#1A1A1E');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1080, 1920);

    // Patrón sutil de puntos urbanos en el fondo
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    for (let x = 30; x < 1080; x += 60) {
      for (let y = 30; y < 1920; y += 60) {
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 2. Cabecera de la Marca
    // Insignia amarilla superior
    ctx.fillStyle = '#F4CA19';
    roundRect(ctx, 80, 100, 920, 120, 24);
    ctx.fill();

    ctx.fillStyle = '#000000';
    ctx.font = '900 48px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('! ACÁ FALTA LA MUNI', 540, 150);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 24px system-ui, -apple-system, sans-serif';
    ctx.fillText('COMUNA DE OSORNO • FISCALIZACIÓN CIUDADANA', 540, 260);

    // 3. Placa de Categoría y Estado
    const catName = catInfo.name.toUpperCase();
    ctx.font = '800 28px system-ui, -apple-system, sans-serif';
    const catMetrics = ctx.measureText(catName);
    const catBadgeWidth = catMetrics.width + 60;

    ctx.fillStyle = `${catInfo.color}25`;
    roundRect(ctx, 80, 310, catBadgeWidth, 60, 16);
    ctx.fill();
    ctx.strokeStyle = catInfo.color;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = catInfo.color;
    ctx.textAlign = 'left';
    ctx.fillText(catName, 110, 348);

    // Estado
    const statusText = report.status === 'resuelto' ? '✓ RESUELTO' : '⚠️ RECLAMO ACTIVO';
    const statusColor = report.status === 'resuelto' ? '#34D399' : '#EF4444';
    ctx.fillStyle = statusColor;
    ctx.textAlign = 'right';
    ctx.fillText(statusText, 1000, 348);

    // Función para dibujar el resto del contenido una vez cargada la foto (o de inmediato)
    const drawContent = (imgElement?: HTMLImageElement) => {
      let currentY = 410;

      // 4. Área de Fotografía de Evidencia
      if (imgElement) {
        const photoWidth = 920;
        const photoHeight = 620;

        ctx.save();
        roundRect(ctx, 80, currentY, photoWidth, photoHeight, 28);
        ctx.clip();

        // Dibujar imagen centrada y recortada (object-fit: cover)
        const imgRatio = imgElement.width / imgElement.height;
        const targetRatio = photoWidth / photoHeight;
        let sWidth = imgElement.width;
        let sHeight = imgElement.height;
        let sx = 0;
        let sy = 0;

        if (imgRatio > targetRatio) {
          sWidth = imgElement.height * targetRatio;
          sx = (imgElement.width - sWidth) / 2;
        } else {
          sHeight = imgElement.width / targetRatio;
          sy = (imgElement.height - sHeight) / 2;
        }

        ctx.drawImage(imgElement, sx, sy, sWidth, sHeight, 80, currentY, photoWidth, photoHeight);
        ctx.restore();

        // Borde elegante sobre la imagen
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 4;
        roundRect(ctx, 80, currentY, photoWidth, photoHeight, 28);
        ctx.stroke();

        currentY += photoHeight + 50;
      } else {
        // Si no hay foto, tarjeta visual con ícono grande
        const boxHeight = 360;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
        roundRect(ctx, 80, currentY, 920, boxHeight, 28);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.font = '80px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('📍', 540, currentY + 160);

        ctx.fillStyle = '#9CA3AF';
        ctx.font = '700 30px system-ui, sans-serif';
        ctx.fillText('REPORTE GEOESPACIAL DE LA COMUNIDAD', 540, currentY + 260);

        currentY += boxHeight + 50;
      }

      // 5. Título del Problema (con ajuste de líneas multilínea)
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 52px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';

      const titleLines = wrapText(ctx, report.title, 920);
      for (const line of titleLines.slice(0, 3)) {
        ctx.fillText(line, 80, currentY);
        currentY += 68;
      }

      currentY += 15;

      // 6. Ubicación (Sector y Dirección en Osorno)
      ctx.fillStyle = '#F4CA19';
      ctx.font = '800 34px system-ui, sans-serif';
      ctx.fillText(`📍 Sector ${report.sector}`, 80, currentY);
      currentY += 46;

      ctx.fillStyle = '#D1D5DB';
      ctx.font = '600 30px system-ui, sans-serif';
      ctx.fillText(report.address_reference, 80, currentY);
      currentY += 60;

      // 7. Contador de Apoyo Comunitario
      ctx.fillStyle = 'rgba(244, 202, 25, 0.12)';
      roundRect(ctx, 80, currentY, 920, 90, 20);
      ctx.fill();
      ctx.strokeStyle = 'rgba(244, 202, 25, 0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#F4CA19';
      ctx.font = '800 32px system-ui, sans-serif';
      ctx.textBaseline = 'middle';
      ctx.fillText(`👍 ${report.support_count} VECINAS Y VECINOS YA APOYARON ESTE CASO`, 110, currentY + 45);

      currentY += 130;

      // 8. Espacio simulado para el Sticker de Enlace de Instagram
      ctx.setLineDash([12, 10]);
      ctx.strokeStyle = '#F4CA19';
      ctx.lineWidth = 3;
      ctx.fillStyle = 'rgba(244, 202, 25, 0.06)';
      roundRect(ctx, 140, 1540, 800, 170, 30);
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]); // Restablecer línea sólida

      ctx.textAlign = 'center';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 32px system-ui, sans-serif';
      ctx.fillText('🔗 PEGA AQUÍ EL STICKER DE ENLACE', 540, 1595);

      ctx.fillStyle = '#F4CA19';
      ctx.font = '700 24px system-ui, sans-serif';
      ctx.fillText('acafaltalamuni-osorno.cl', 540, 1645);

      ctx.fillStyle = '#9CA3AF';
      ctx.font = '600 20px system-ui, sans-serif';
      ctx.fillText('Toca el sticker para sumarte con un +1 en el mapa', 540, 1685);

      // Pie inferior de la historia
      ctx.fillStyle = '#6B7280';
      ctx.font = '700 22px system-ui, sans-serif';
      ctx.fillText('ACÁ FALTA LA MUNI • PLATAFORMA VECINAL INDEPENDIENTE DE OSORNO', 540, 1840);

      // Convertir Canvas a Blob PNG
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('No se pudo generar la imagen para la historia.'));
        }
      }, 'image/png');
    };

    // Si el reporte tiene foto, cargarla primero
    if (report.image_url) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => drawContent(img);
      img.onerror = () => drawContent(); // Dibujar sin foto en caso de error
      img.src = report.image_url;
    } else {
      drawContent();
    }
  });
}

/**
 * Función auxiliar para dibujar rectángulos con esquinas redondeadas
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * Ajuste automático de saltos de línea para textos largos
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = ctx.measureText(testLine).width;

    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}
