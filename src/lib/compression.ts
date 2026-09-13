/**
 * Compresión de imágenes de lado cliente utilizando la API Canvas nativa (Filosofía Ponytail).
 * Cero dependencias externas en el bundle. Reduce fotos móviles de 5 MB a WebP de ~200-400 KB.
 */
export async function compressImage(
  file: File,
  maxDimension = 1280,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Si no es imagen, rechazar de inmediato
    if (!file.type.startsWith('image/')) {
      reject(new Error('El archivo seleccionado no es una imagen válida.'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const img = new Image();

      img.onload = () => {
        let { width, height } = img;

        // Calcular escalamiento proporcional si excede dimensión máxima
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Si el contexto falla, degradar al DataURL original
          resolve(readerEvent.target?.result as string);
          return;
        }

        // Dibujar con suavizado
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Preferir formato WebP moderno, con respaldo a JPEG
        const webpData = canvas.toDataURL('image/webp', quality);
        if (webpData && webpData.startsWith('data:image/webp')) {
          resolve(webpData);
        } else {
          resolve(canvas.toDataURL('image/jpeg', quality));
        }
      };

      img.onerror = () => reject(new Error('Error al decodificar la imagen en el navegador.'));
      img.src = readerEvent.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Error al leer el archivo de la imagen.'));
    reader.readAsDataURL(file);
  });
}

export async function uploadImageToServer(base64Data: string): Promise<string> {
  return base64Data;
}
