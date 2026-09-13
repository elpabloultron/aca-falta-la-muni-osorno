'use client';

import React, { useState } from 'react';
import { Report } from '@/types/report';
import { CATEGORIAS_REPORTE, APP_VERSION } from '@/config/osorno';
import {
  ThumbsUp,
  MapPin,
  Calendar,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowUpDown,
  Search,
} from 'lucide-react';
import { CategoryIcon } from '../CategoryIcon';
import { ShareModal } from '../Share/ShareModal';
import { calculateDaysElapsed } from '@/lib/geo-utils';

interface ReportFeedViewProps {
  reports: Report[];
  userSupportedIds: Set<string>;
  onSelectReport: (report: Report) => void;
  onToggleSupport: (reportId: string) => void;
  onSwitchToMap: () => void;
}

export const ReportFeedView: React.FC<ReportFeedViewProps> = ({
  reports,
  userSupportedIds,
  onSelectReport,
  onToggleSupport,
  onSwitchToMap,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'recientes' | 'apoyados' | 'tiempo_espera'>('tiempo_espera');
  const [sharingReport, setSharingReport] = useState<Report | null>(null);

  // Filtrar y ordenar reportes
  const filteredReports = reports
    .filter((r) => {
      const term = searchTerm.toLowerCase();
      return (
        r.title.toLowerCase().includes(term) ||
        r.description.toLowerCase().includes(term) ||
        r.sector.toLowerCase().includes(term) ||
        r.address_reference.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'apoyados') {
        return b.support_count - a.support_count;
      }
      if (sortBy === 'tiempo_espera') {
        const daysA = a.days_unresolved ?? calculateDaysElapsed(a.created_at);
        const daysB = b.days_unresolved ?? calculateDaysElapsed(b.created_at);
        return daysB - daysA;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  return (
    <div className="w-full h-full bg-[#121214] pt-24 pb-12 px-3 sm:px-6 overflow-y-auto">
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Barra de Búsqueda y Ordenamiento */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-[#18181A] border border-white/10 p-3 rounded-2xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por calle, sector o palabra clave..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#F4CA19]"
            />
          </div>

          <div className="flex items-center gap-2 justify-end">
            <div className="flex items-center gap-1 text-xs text-neutral-300">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#F4CA19]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Ordenar reportes"
                className="bg-neutral-900 border border-neutral-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="tiempo_espera">Más tiempo sin solución</option>
                <option value="recientes">Más recientes</option>
                <option value="apoyados">Más apoyados</option>
              </select>
            </div>

            <button
              type="button"
              onClick={onSwitchToMap}
              className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-3 py-1.5 rounded-xl text-xs font-semibold border border-white/5 transition-colors cursor-pointer"
            >
              Volver al mapa
            </button>
          </div>
        </div>

        {/* Lista de Tarjetas del Muro */}
        {filteredReports.length === 0 ? (
          <div className="text-center py-16 bg-[#18181A] border border-white/5 rounded-3xl p-8">
            <p className="text-neutral-400 text-sm">No se encontraron reportes con los filtros seleccionados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5">
            {filteredReports.map((rep) => {
              const catInfo = CATEGORIAS_REPORTE[rep.category];
              const isSupported = userSupportedIds.has(rep.id);
              const formattedDate = new Date(rep.created_at).toLocaleDateString('es-CL', {
                day: 'numeric',
                month: 'short',
              });

              return (
                <div
                  key={rep.id}
                  className="bg-[#18181A] border border-white/10 hover:border-white/20 transition-all rounded-2xl p-4.5 sm:p-5 shadow-xl flex flex-col sm:flex-row gap-4"
                >
                  {/* Fotografía en miniatura si existe */}
                  {rep.image_url && (
                    <div
                      onClick={() => onSelectReport(rep)}
                      className="w-full sm:w-36 h-36 rounded-xl overflow-hidden bg-black shrink-0 border border-neutral-800 cursor-pointer"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={rep.image_url}
                        alt={rep.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  )}

                  {/* Contenido de la Tarjeta */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border flex items-center gap-1"
                            style={{
                              color: catInfo.color,
                              borderColor: `${catInfo.color}35`,
                              backgroundColor: `${catInfo.color}15`,
                            }}
                          >
                            <CategoryIcon category={rep.category} className="w-3 h-3" />
                            {catInfo.name}
                          </span>
                          <span className="text-neutral-500 text-xs">•</span>
                          <span className="text-neutral-400 text-xs font-medium flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#F4CA19]" />
                            {rep.sector}
                            {rep.is_rural && (
                              <span className="text-[9px] font-bold bg-emerald-950/80 text-emerald-400 px-1 py-0.2 rounded border border-emerald-500/30">
                                Rural
                              </span>
                            )}
                          </span>
                        </div>

                        {/* Estado y Tiempo Transcurrido */}
                        {rep.status === 'resuelto' ? (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Solucionado {rep.days_to_resolve ? `en ${rep.days_to_resolve}d` : ''}
                          </span>
                        ) : (
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded border flex items-center gap-1 ${
                              (rep.days_unresolved ?? calculateDaysElapsed(rep.created_at)) >= 60
                                ? 'text-rose-300 bg-rose-950/80 border-rose-500/50'
                                : (rep.days_unresolved ?? calculateDaysElapsed(rep.created_at)) >= 30
                                ? 'text-amber-300 bg-amber-950/80 border-amber-500/50'
                                : 'text-neutral-300 bg-neutral-900 border-neutral-700'
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            {rep.days_unresolved ?? calculateDaysElapsed(rep.created_at)}d sin solución
                          </span>
                        )}
                      </div>

                      <h3
                        onClick={() => onSelectReport(rep)}
                        className="text-white font-extrabold text-base hover:text-[#F4CA19] transition-colors cursor-pointer leading-snug"
                      >
                        {rep.title}
                      </h3>

                      <p className="text-neutral-400 text-xs mt-1 line-clamp-2 leading-relaxed">
                        {rep.description}
                      </p>

                      <p className="text-neutral-500 text-[11px] mt-1.5">
                        Ref: {rep.address_reference} • {formattedDate}
                      </p>
                    </div>

                    {/* Barra de apoyo y acciones */}
                    <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-neutral-800/80">
                      <button
                        type="button"
                        onClick={() => onToggleSupport(rep.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          isSupported
                            ? 'bg-[#F4CA19] text-black shadow-md'
                            : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                        }`}
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${isSupported ? 'fill-black' : ''}`} />
                        <span>{isSupported ? 'Apoyado' : 'Apoyar'}</span>
                        <span className="text-[11px] font-black">({rep.support_count})</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSharingReport(rep)}
                          className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                          title="Compartir reclamo en WhatsApp, Instagram, Facebook y TikTok"
                        >
                          <Share2 className="w-3.5 h-3.5 text-[#F4CA19]" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onSelectReport(rep)}
                          className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Ver detalle
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pie de página discreto con créditos y contacto */}
        <footer className="mt-8 pt-6 pb-12 border-t border-white/5 text-center text-[11px] text-neutral-500 space-y-1">
          <p className="text-neutral-400">
            «Acá Falta la Muni — Osorno» · Iniciativa ciudadana independiente
          </p>
          <p className="flex items-center justify-center gap-1.5 flex-wrap">
            <span className="font-mono text-[10px] bg-white/5 text-neutral-400 px-1.5 py-0.5 rounded border border-white/10 font-medium">
              {APP_VERSION}
            </span>
            <span>·</span>
            <span>Autor: <strong className="text-neutral-300 font-medium">Pablo Benavides Jorquera</strong></span>
            <span>·</span>
            <span>
              Contacto:{' '}
              <a
                href="mailto:acafaltalamuniosorno@gmail.com"
                className="text-neutral-400 hover:text-[#F4CA19] hover:underline transition-colors"
              >
                acafaltalamuniosorno@gmail.com
              </a>
            </span>
          </p>
        </footer>

        {/* Modal de Compartir en Redes Sociales */}
        {sharingReport && (
          <ShareModal
            report={sharingReport}
            onClose={() => setSharingReport(null)}
          />
        )}
      </div>
    </div>
  );
};
