'use client';

import React, { useState } from 'react';
import { Report } from '@/types/report';
import { CATEGORIAS_REPORTE } from '@/config/osorno';
import {
  X,
  MapPin,
  Calendar,
  ThumbsUp,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Camera,
  Copy,
  ExternalLink,
  FileText,
  Flag,
  ShieldAlert,
} from 'lucide-react';
import { CategoryIcon } from '../CategoryIcon';
import { compressImage, uploadImageToServer } from '@/lib/compression';
import { ShareModal } from '../Share/ShareModal';
import { OficioFormalModal } from './OficioFormalModal';
import { getDeviceId, flagReportAction } from '@/lib/storage';
import { calculateDaysElapsed, formatElapsedDays, formatResolvedDays } from '@/lib/geo-utils';

interface ReportDetailModalProps {
  report: Report;
  isSupportedByUser: boolean;
  onClose: () => void;
  onToggleSupport: (reportId: string) => void;
  onResolveReport: (reportId: string, resolvedImageUrl?: string) => void;
}

export const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  report,
  isSupportedByUser,
  onClose,
  onToggleSupport,
  onResolveReport,
}) => {
  const [copied, setCopied] = useState(false);
  const [showResolveForm, setShowResolveForm] = useState(false);
  const [resolveImage, setResolveImage] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isOficioModalOpen, setIsOficioModalOpen] = useState(false);

  // Moderación comunitaria
  const [isFlagModalOpen, setIsFlagModalOpen] = useState(false);
  const [flagReason, setFlagReason] = useState('Contenido falso o inventado');
  const [isFlagging, setIsFlagging] = useState(false);
  const [flagMessage, setFlagMessage] = useState<string | null>(null);
  const [flagsCount, setFlagsCount] = useState<number>(report.flags_count || 0);

  const catInfo = CATEGORIAS_REPORTE[report.category];
  const isResolved = report.status === 'resuelto';
  const daysUnresolved = report.days_unresolved ?? calculateDaysElapsed(report.created_at);
  const daysToResolve = report.days_to_resolve ?? (isResolved ? calculateDaysElapsed(report.created_at, report.resolved_at) : undefined);

  // Formato de fecha en español chileno (con minúscula en el mes según RAE)
  const formattedDate = new Date(report.created_at).toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const shareText = `⚠️ Reclamo en Osorno: "${report.title}" en ${report.address_reference} (${report.sector}). ¡Apóyalo aquí para exigir una solución a la Municipalidad!`;
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/?reporte=${report.id}` : '';

  const handleShareWhatsApp = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      shareText + ' ' + shareUrl
    )}`;
    window.open(waUrl, '_blank');
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleResolveImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      const compressed = await compressImage(file, 1200, 0.82);
      const serverUrl = await uploadImageToServer(compressed);
      setResolveImage(serverUrl);
    } catch (err) {
      alert('No se pudo procesar la fotografía. Intenta con otra imagen.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleConfirmResolve = () => {
    onResolveReport(report.id, resolveImage || undefined);
    setShowResolveForm(false);
  };

  const handleFlagSubmit = async () => {
    setIsFlagging(true);
    try {
      const data = await flagReportAction(report.id, flagReason);
      if (data.success) {
        setFlagMessage(data.message);
        if (data.flagsCount !== undefined) {
          setFlagsCount(data.flagsCount);
        }
        setTimeout(() => {
          setIsFlagModalOpen(false);
          setFlagMessage(null);
          if (data.isHidden) {
            alert('Esta publicación ha acumulado múltiples denuncias y ha sido ocultada temporalmente del mapa.');
            onClose();
          }
        }, 1800);
      } else {
        alert('Error al reportar la publicación.');
      }
    } catch (err) {
      alert('No se pudo procesar la moderación de la publicación.');
    } finally {
      setIsFlagging(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      {/* Contenedor del Drawer en móvil / Modal en escritorio */}
      <div className="bg-[#18181A] border border-white/10 w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Tirador táctil móvil (drag-handle) */}
        <div className="w-12 h-1.5 bg-neutral-700 rounded-full mx-auto mt-3 sm:hidden" />

        {/* Cabecera de la ficha */}
        <div className="p-5 pb-3 flex items-start justify-between gap-3 border-b border-neutral-800/80">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md"
              style={{ backgroundColor: catInfo.color }}
            >
              <CategoryIcon category={report.category} className="w-5 h-5" />
            </div>
            <div>
              <span
                className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border inline-block"
                style={{
                  color: catInfo.color,
                  borderColor: `${catInfo.color}40`,
                  backgroundColor: `${catInfo.color}15`,
                }}
              >
                {catInfo.name}
              </span>
              <div className="flex items-center gap-1.5 text-neutral-400 text-xs mt-1">
                <MapPin className="w-3.5 h-3.5 text-[#F4CA19]" />
                <span className="font-semibold text-neutral-200">{report.sector}</span>
                {report.is_rural && (
                  <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold px-1.5 py-0.2 rounded">
                    Sector Rural
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ficha de reporte"
            className="w-8 h-8 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cuerpo con Scroll */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Título, Contador Temporal y Estado */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {isResolved ? (
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Solucionado tras {daysToResolve ?? 0} días de espera comunitaria
                </span>
              ) : (
                <span
                  className={`flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-lg border ${
                    daysUnresolved >= 60
                      ? 'text-rose-300 bg-rose-950/80 border-rose-500/50'
                      : daysUnresolved >= 30
                      ? 'text-amber-300 bg-amber-950/80 border-amber-500/50'
                      : 'text-neutral-300 bg-neutral-900 border-neutral-700'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-current animate-pulse" />
                  ⏱ {daysUnresolved} días sin solución municipal
                </span>
              )}

              {report.status === 'en_revision' && (
                <span className="text-[10px] font-bold text-amber-400 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded-md">
                  En revisión ciudadana
                </span>
              )}
            </div>

            <h2 className="text-white font-extrabold text-lg sm:text-xl leading-snug">
              {report.title}
            </h2>

            <p className="text-neutral-400 text-xs mt-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-neutral-500" />
              Denunciado el {formattedDate} por{' '}
              <strong className="text-neutral-300 font-semibold">{report.author_name}</strong>
            </p>
          </div>

          {/* Fotografía de evidencia si existe */}
          {report.image_url && (
            <div className="rounded-2xl overflow-hidden border border-neutral-800 bg-black max-h-64 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={report.image_url}
                alt={report.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Descripción del problema */}
          <div className="bg-neutral-900/70 border border-white/5 rounded-2xl p-4">
            <h3 className="text-neutral-400 text-xs font-bold uppercase tracking-wider mb-1">
              Detalle de la problemática
            </h3>
            <p className="text-neutral-200 text-sm leading-relaxed whitespace-pre-line">
              {report.description}
            </p>
            <div className="mt-3 pt-3 border-t border-neutral-800 flex items-center gap-1.5 text-xs text-neutral-400">
              <strong className="text-neutral-300">Ubicación referencial:</strong>
              <span>{report.address_reference}</span>
            </div>
          </div>

          {/* Fotografía de resolución si fue marcado como resuelto */}
          {report.status === 'resuelto' && report.resolved_image_url && (
            <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Evidencia de reparación comunitaria o municipal</span>
              </div>
              <div className="rounded-xl overflow-hidden border border-emerald-900/50 max-h-48">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={report.resolved_image_url}
                  alt="Evidencia de solución"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Formulario desplegable para marcar como resuelto */}
          {showResolveForm && report.status !== 'resuelto' && (
            <div className="bg-neutral-900 border border-[#F4CA19]/30 rounded-2xl p-4 space-y-3 animate-fadeIn">
              <h4 className="text-white text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#F4CA19]" />
                Confirmar solución del problema en Osorno
              </h4>
              <p className="text-neutral-400 text-xs">
                ¿La municipalidad o los vecinos ya repararon este bache o luminaria? Puedes adjuntar una foto como comprobante de la solución.
              </p>

              <div>
                <label className="flex items-center justify-center gap-2 border-2 border-dashed border-neutral-700 hover:border-[#F4CA19] rounded-xl p-3 text-xs text-neutral-300 cursor-pointer transition-colors">
                  <Camera className="w-4 h-4 text-[#F4CA19]" />
                  <span>{resolveImage ? 'Foto de solución cargada ✓' : 'Subir foto del arreglo (opcional)'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleResolveImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleConfirmResolve}
                  disabled={isCompressing}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  {isCompressing ? 'Procesando...' : 'Confirmar como Resuelto'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowResolveForm(false)}
                  className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Botón Destacado: Generar Oficio Formal para Municipalidad / CGR */}
          <div className="bg-gradient-to-r from-amber-500/10 via-[#F4CA19]/15 to-amber-500/10 border border-[#F4CA19]/30 rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#F4CA19] text-black flex items-center justify-center shrink-0 shadow-md">
                <FileText className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <h4 className="text-white text-xs font-black">
                  ¿La Muni aún no soluciona este reclamo?
                </h4>
                <p className="text-neutral-400 text-[11px] leading-tight mt-0.5">
                  Genera un Oficio Vecinal con citas a la Ley N° 18.695 y Ley N° 19.880 para exigir intervención formal a la DOM o a la CGR.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOficioModalOpen(true)}
              className="w-full sm:w-auto bg-[#F4CA19] hover:bg-[#ffe14d] text-black font-extrabold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-md active:scale-95"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Generar Oficio Formal</span>
            </button>
          </div>

          {/* Enlace discreto de moderación comunitaria */}
          <div className="pt-2 flex items-center justify-between text-[11px] text-neutral-500 border-t border-neutral-800/60">
            <span>ID Reclamo: {report.id}</span>
            <button
              type="button"
              onClick={() => setIsFlagModalOpen(true)}
              className="text-neutral-500 hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Flag className="w-3 h-3" />
              <span>Denunciar publicación inapropiada {flagsCount > 0 && `(${flagsCount})`}</span>
            </button>
          </div>
        </div>

        {/* Barra de Acciones Cívicas Inferior */}
        <div className="p-4 bg-[#141414] border-t border-neutral-800/80 flex items-center gap-2.5">
          {/* Botón de Apoyo Cívico (+1) */}
          <button
            type="button"
            onClick={() => onToggleSupport(report.id)}
            className={`flex-1 py-3 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-lg ${
              isSupportedByUser
                ? 'bg-[#F4CA19] text-black shadow-yellow-500/20'
                : 'bg-neutral-800 hover:bg-neutral-700 text-white border border-white/10'
            }`}
          >
            <ThumbsUp className={`w-4 h-4 ${isSupportedByUser ? 'fill-black' : ''}`} />
            <span>{isSupportedByUser ? '¡Apoyaste este reclamo!' : 'A mí también me afecta'}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
              isSupportedByUser ? 'bg-black text-[#F4CA19]' : 'bg-neutral-900 text-neutral-300'
            }`}>
              {report.support_count}
            </span>
          </button>

          {/* Botón de Compartir en Redes Sociales */}
          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="px-3.5 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white border border-white/10 flex items-center justify-center gap-1.5 shadow-lg transition-all active:scale-95 cursor-pointer shrink-0 text-xs font-bold"
            title="Compartir en WhatsApp, Instagram, Facebook y TikTok"
          >
            <Share2 className="w-4 h-4 text-[#F4CA19]" />
            <span className="hidden sm:inline">Compartir</span>
          </button>

          {/* Botón para abrir formulario de marcar como resuelto */}
          {report.status !== 'resuelto' && !showResolveForm && (
            <button
              type="button"
              onClick={() => setShowResolveForm(true)}
              className="w-11 h-11 rounded-xl bg-neutral-800 hover:bg-emerald-950/60 hover:text-emerald-400 text-neutral-400 border border-white/10 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="Marcar como resuelto"
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Notificación flotante de copiado */}
        {copied && (
          <div className="bg-[#F4CA19] text-black text-center py-1 text-xs font-bold">
            ¡Enlace copiado al portapapeles!
          </div>
        )}

        {/* Modal de Compartir en Redes Sociales */}
        {isShareModalOpen && (
          <ShareModal report={report} onClose={() => setIsShareModalOpen(false)} />
        )}

        {/* Modal de Oficio Cívico Formal Imprimible */}
        {isOficioModalOpen && (
          <OficioFormalModal report={report} onClose={() => setIsOficioModalOpen(false)} />
        )}

        {/* Modal de Denuncia de Moderación */}
        {isFlagModalOpen && (
          <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-[#1C1C1E] border border-neutral-700 w-full max-w-sm rounded-2xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Denunciar publicación</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFlagModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-neutral-300 text-xs">
                Selecciona el motivo por el cual consideras que este reporte debe ser revisado o retirado:
              </p>

              <div className="space-y-2 text-xs text-neutral-200">
                {[
                  'Contenido falso o inventado',
                  'Lenguaje ofensivo o denostación',
                  'Ubicación o fotografía errónea',
                  'Spam o publicidad comercial',
                ].map((reason) => (
                  <label
                    key={reason}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                      flagReason === reason
                        ? 'bg-rose-950/40 border-rose-500/50 text-white'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="flagReason"
                      value={reason}
                      checked={flagReason === reason}
                      onChange={(e) => setFlagReason(e.target.value)}
                      className="text-rose-500 focus:ring-0"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>

              {flagMessage && (
                <p className="text-xs text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-500/30 p-2.5 rounded-xl text-center">
                  {flagMessage}
                </p>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleFlagSubmit}
                  disabled={isFlagging}
                  className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  {isFlagging ? 'Enviando...' : 'Confirmar denuncia'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsFlagModalOpen(false)}
                  className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
