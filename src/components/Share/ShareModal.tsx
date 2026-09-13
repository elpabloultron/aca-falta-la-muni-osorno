'use client';

import React, { useState } from 'react';
import { Report } from '@/types/report';
import {
  X,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Download,
  Loader2,
  Camera,
  Image as ImageIcon,
} from 'lucide-react';
import { generateInstagramStoryImage } from '@/lib/story-generator';

interface ShareModalProps {
  report: Report;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ report, onClose }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedTikTok, setCopiedTikTok] = useState(false);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [storyGeneratedUrl, setStoryGeneratedUrl] = useState<string | null>(null);

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/?reporte=${report.id}`
      : `https://acafaltalamuni-osorno.cl/?reporte=${report.id}`;

  const defaultShareText = `⚠️ Reclamo barrial en Osorno: "${report.title}" en ${report.address_reference} (${report.sector}). ¡Suma tu apoyo cívico aquí para visibilizarlo!`;

  // 1. WhatsApp
  const handleWhatsApp = () => {
    const message = `${defaultShareText}\n\n👉 Apoya aquí: ${shareUrl}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // 2. Facebook
  const handleFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      shareUrl
    )}&quote=${encodeURIComponent(defaultShareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=500');
  };

  // 3. Instagram: Generar Historia 9:16 Lista para Publicar
  const handleInstagramStory = async () => {
    try {
      setIsGeneratingStory(true);

      // Copiar de inmediato el enlace al portapapeles para el sticker de Instagram
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      }

      // Generar imagen 9:16 en Canvas
      const blob = await generateInstagramStoryImage(report);
      const file = new File([blob], `historia-muni-osorno-${report.id}.png`, {
        type: 'image/png',
      });

      const blobUrl = URL.createObjectURL(blob);
      setStoryGeneratedUrl(blobUrl);

      // Si el navegador soporta compartir archivos nativamente (móviles Android / iOS)
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: `Reclamo Osorno: ${report.title}`,
            text: defaultShareText,
          });
          setIsGeneratingStory(false);
          return;
        } catch (shareErr: any) {
          // Si el usuario cancela el diálogo nativo, mantener la descarga/previa
        }
      }

      // Descarga automática de la imagen para subida directa en Instagram
      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = `historia-osorno-${report.id}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (err: any) {
      alert('Error al generar la historia: ' + (err.message || 'Inténtalo nuevamente.'));
    } finally {
      setIsGeneratingStory(false);
    }
  };

  // 4. TikTok
  const handleTikTok = async () => {
    const tikTokCaption = `Denuncia ciudadana en Osorno: "${report.title}" en ${report.sector}. Enlace en bio: ${shareUrl} #Osorno #AcaFaltaLaMuni #Chile #NoticiasOsorno`;

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(tikTokCaption);
      setCopiedTikTok(true);
      setTimeout(() => setCopiedTikTok(false), 3500);
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Reclamo Osorno: ${report.title}`,
          text: tikTokCaption,
          url: shareUrl,
        });
        return;
      } catch (err) {
        // Fallback
      }
    }
    window.open('https://www.tiktok.com/', '_blank', 'noopener,noreferrer');
  };

  // 5. Copiar enlace simple
  const handleCopyDirectLink = async () => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#18181A] border border-white/10 w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Tirador táctil móvil */}
        <div className="w-12 h-1.5 bg-neutral-700 rounded-full mx-auto mt-3 sm:hidden" />

        {/* Cabecera */}
        <div className="p-5 pb-3 flex items-center justify-between border-b border-neutral-800">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#F4CA19] bg-[#F4CA19]/10 px-2 py-0.5 rounded border border-[#F4CA19]/20">
              DIFUSIÓN EN REDES SOCIALES
            </span>
            <h3 className="text-white font-black text-base sm:text-lg mt-1">
              Compartir este reclamo de Osorno
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana de compartir"
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Opciones de Redes Sociales */}
        <div className="p-5 space-y-2.5 overflow-y-auto">
          {/* Opción Destacada: HISTORIA DE INSTAGRAM LISTA (9:16) */}
          <div className="bg-gradient-to-br from-[#833AB4]/15 via-[#FD1D1D]/15 to-[#F77737]/15 border-2 border-pink-500/40 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center text-white shadow-lg">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-white font-extrabold text-sm block">
                    Instagram Stories (Historia 9:16 lista)
                  </span>
                  <span className="text-pink-300 text-[11px] font-semibold">
                    Genera la gráfica vertical con foto y título
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-black bg-pink-500 text-white px-2 py-0.5 rounded-full shadow-sm">
                9:16 HD
              </span>
            </div>

            <p className="text-neutral-300 text-xs leading-relaxed">
              Crea automáticamente una historia lista con la foto del bache/luminaria, datos de Osorno y espacio para pegar el <strong>Sticker de Enlace</strong>.
            </p>

            <button
              type="button"
              onClick={handleInstagramStory}
              disabled={isGeneratingStory}
              className="w-full bg-gradient-to-r from-[#DD2A7B] to-[#F58529] hover:opacity-95 active:scale-98 text-white font-black text-xs sm:text-sm py-3 px-4 rounded-xl shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isGeneratingStory ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generando historia en alta resolución...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-white" />
                  <span>Crear y abrir Historia lista</span>
                </>
              )}
            </button>

            {/* Notificación si la imagen ya fue generada */}
            {storyGeneratedUrl && (
              <div className="bg-black/50 border border-white/10 rounded-xl p-3 space-y-2 text-xs animate-fadeIn">
                <div className="flex items-center justify-between text-pink-300 font-bold text-[11px]">
                  <span>✓ Imagen 9:16 generada y enlace copiado</span>
                  <a
                    href={storyGeneratedUrl}
                    download={`historia-osorno-${report.id}.png`}
                    className="flex items-center gap-1 text-white hover:text-[#F4CA19] underline font-semibold"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar</span>
                  </a>
                </div>
                <p className="text-neutral-400 text-[11px] leading-tight">
                  En Instagram: ve a <strong>Crear Historia</strong> &gt; selecciona la imagen &gt; toca el sticker de <strong>Enlace (🔗)</strong> y pega el link que ya tienes en el portapapeles.
                </p>
              </div>
            )}
          </div>

          {/* WhatsApp (Juntas de Vecinos) */}
          <button
            type="button"
            onClick={handleWhatsApp}
            className="w-full bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 hover:border-[#25D366] p-3.5 rounded-2xl flex items-center justify-between transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#25D366] flex items-center justify-center text-white shadow-md">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.53 7.34C9.36 7.34 9.09 7.4 8.87 7.65C8.65 7.89 8.02 8.48 8.02 9.69C8.02 10.9 8.9 12.07 9.02 12.23C9.15 12.39 10.76 14.88 13.23 15.95C13.82 16.2 14.28 16.36 14.64 16.47C15.23 16.66 15.77 16.63 16.2 16.57C16.68 16.5 17.68 15.96 17.89 15.38C18.1 14.8 18.1 14.3 18.04 14.2C17.98 14.1 17.82 14.04 17.57 13.91C17.33 13.79 16.12 13.2 15.89 13.11C15.66 13.03 15.5 12.99 15.33 13.24C15.17 13.49 14.69 14.04 14.54 14.2C14.4 14.37 14.25 14.39 14.01 14.27C13.77 14.15 12.98 13.89 12.05 13.06C11.32 12.41 10.83 11.61 10.69 11.36C10.55 11.12 10.67 10.99 10.79 10.87C10.9 10.76 11.04 10.58 11.16 10.43C11.28 10.28 11.33 10.17 11.41 10.01C11.49 9.85 11.45 9.71 11.39 9.59C11.33 9.47 10.83 8.24 10.62 7.74C10.42 7.24 10.22 7.31 10.06 7.31C9.91 7.3 9.73 7.34 9.53 7.34Z" />
                </svg>
              </div>
              <div className="text-left">
                <span className="text-white font-bold text-sm block group-hover:text-[#25D366] transition-colors">
                  WhatsApp (Juntas de Vecinos)
                </span>
                <span className="text-neutral-400 text-xs">
                  Compartir mensaje y enlace en grupos de WhatsApp
                </span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-neutral-500 group-hover:text-[#25D366] transition-colors shrink-0" />
          </button>

          {/* Facebook */}
          <button
            type="button"
            onClick={handleFacebook}
            className="w-full bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 hover:border-[#1877F2] p-3.5 rounded-2xl flex items-center justify-between transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1877F2] flex items-center justify-center text-white shadow-md">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </div>
              <div className="text-left">
                <span className="text-white font-bold text-sm block group-hover:text-[#1877F2] transition-colors">
                  Facebook (Comunidad y Grupos)
                </span>
                <span className="text-neutral-400 text-xs">
                  Publicar en grupos vecinales de Osorno
                </span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-neutral-500 group-hover:text-[#1877F2] transition-colors shrink-0" />
          </button>

          {/* TikTok */}
          <button
            type="button"
            onClick={handleTikTok}
            className="w-full bg-neutral-900 hover:bg-neutral-800 border border-white/10 hover:border-[#00f2fe]/40 p-3.5 rounded-2xl flex items-center justify-between transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-black border border-white/20 flex items-center justify-center text-white shadow-md">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                </svg>
              </div>
              <div className="text-left">
                <span className="text-white font-bold text-sm block group-hover:text-[#00f2fe] transition-colors">
                  TikTok
                </span>
                <span className="text-neutral-400 text-xs">
                  Copiar descripción con etiquetas para video o historia
                </span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-neutral-500 group-hover:text-[#00f2fe] transition-colors shrink-0" />
          </button>
        </div>

        {/* Copiado de Enlace Directo */}
        <div className="p-5 pt-2 bg-[#141414] border-t border-neutral-800 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-neutral-300 select-all focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCopyDirectLink}
              className="bg-[#F4CA19] hover:bg-[#ffe14d] text-black font-extrabold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md shrink-0"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>

          {copiedTikTok && (
            <p className="text-[#00f2fe] text-[11px] font-semibold flex items-center gap-1 animate-fadeIn">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              ¡Texto y etiquetas copiados para tu video de TikTok!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
