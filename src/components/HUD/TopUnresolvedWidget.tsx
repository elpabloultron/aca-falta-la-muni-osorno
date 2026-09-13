'use client';

import React, { useState, useMemo } from 'react';
import { Report } from '@/types/report';
import { calculateDaysElapsed, formatElapsedDays } from '@/lib/geo-utils';
import { CATEGORIAS_REPORTE } from '@/config/osorno';
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  MapPin,
  Flame,
  ThumbsUp,
} from 'lucide-react';
import { CategoryIcon } from '../CategoryIcon';

interface TopUnresolvedWidgetProps {
  reports: Report[];
  onSelectReport: (report: Report) => void;
  selectedReportId?: string;
}

export const TopUnresolvedWidget: React.FC<TopUnresolvedWidgetProps> = ({
  reports,
  onSelectReport,
  selectedReportId,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Filtrar pendientes o en revisión y ordenar por mayor tiempo sin solución
  const top10Unresolved = useMemo(() => {
    return reports
      .filter((r) => r.status !== 'resuelto')
      .map((r) => ({
        ...r,
        days: r.days_unresolved ?? calculateDaysElapsed(r.created_at),
      }))
      .sort((a, b) => b.days - a.days)
      .slice(0, 10);
  }, [reports]);

  if (top10Unresolved.length === 0) return null;

  const worstCase = top10Unresolved[0];

  return (
    <aside
      aria-label="Ranking de denuncias con más tiempo sin solución en Osorno"
      className="fixed bottom-9 left-3 sm:bottom-9 sm:left-3 z-30 max-w-sm sm:max-w-md w-[calc(100vw-2rem)] select-none pointer-events-auto"
    >
      <div className="bg-[#18181A]/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300">
        {/* Cabecera / Pestaña del Widget */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between gap-3 bg-[#141414]/90 hover:bg-[#1C1C1E] transition-colors cursor-pointer text-left"
          aria-expanded={isExpanded}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-rose-400 animate-pulse" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <span className="text-white text-xs font-black tracking-wide uppercase">
                  Top 10 Casos sin Solución
                </span>
                <span className="bg-rose-500/20 text-rose-400 border border-rose-500/40 px-1.5 py-0.2 rounded text-[10px] font-black">
                  Récord: {worstCase.days} días
                </span>
              </div>
              <p className="text-neutral-400 text-[11px] truncate mt-0.5">
                {isExpanded
                  ? 'Reclamos con mayor demora municipal en Osorno'
                  : `1° lugar: ${worstCase.sector} — ${worstCase.title}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-neutral-400 hover:text-white shrink-0">
            <span className="text-[10px] font-bold hidden sm:inline text-[#F4CA19]">
              {isExpanded ? 'Ocultar' : 'Ver listado'}
            </span>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-[#F4CA19]" />
            ) : (
              <ChevronUp className="w-4 h-4 text-[#F4CA19]" />
            )}
          </div>
        </button>

        {/* Lista Desplegable con los 10 casos */}
        {isExpanded && (
          <div className="max-h-80 sm:max-h-96 overflow-y-auto divide-y divide-white/5 p-2 space-y-1">
            {top10Unresolved.map((rep, idx) => {
              const isSelected = selectedReportId === rep.id;
              const catInfo = CATEGORIAS_REPORTE[rep.category];
              const isRural = rep.is_rural;

              // Color según nivel de gravedad temporal
              const isCritical = rep.days >= 60;
              const isHigh = rep.days >= 30 && rep.days < 60;

              return (
                <div
                  key={rep.id}
                  onClick={() => onSelectReport(rep)}
                  className={`p-2.5 rounded-xl cursor-pointer transition-all flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-[#F4CA19]/15 border border-[#F4CA19]/50 shadow-md'
                      : 'hover:bg-neutral-800/60 border border-transparent'
                  }`}
                >
                  {/* Posición en el Ranking */}
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs shrink-0 mt-0.5 ${
                      idx === 0
                        ? 'bg-rose-500 text-white shadow-md shadow-rose-900/40'
                        : idx === 1
                        ? 'bg-amber-500 text-black'
                        : idx === 2
                        ? 'bg-amber-600/80 text-white'
                        : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    #{idx + 1}
                  </div>

                  {/* Contenido del Reclamo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 truncate">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: catInfo?.color || '#F4CA19' }}
                        />
                        <span className="text-white font-bold text-xs truncate">
                          {rep.title}
                        </span>
                      </div>

                      {/* Contador de Días Sin Solución */}
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md shrink-0 flex items-center gap-1 ${
                          isCritical
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                            : isHigh
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                            : 'bg-neutral-800 text-neutral-300'
                        }`}
                      >
                        <Clock className="w-3 h-3 text-current" />
                        {rep.days} días
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-1 text-[11px] text-neutral-400">
                      <div className="flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-[#F4CA19] shrink-0" />
                        <span className="font-semibold text-neutral-300 truncate">
                          {rep.sector}
                        </span>
                        {isRural && (
                          <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold px-1 rounded">
                            Rural
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-neutral-400 flex items-center gap-0.5">
                          <ThumbsUp className="w-3 h-3 text-[#F4CA19]" />
                          {rep.support_count}
                        </span>
                        <span className="text-[#F4CA19] font-bold text-[11px] flex items-center gap-0.5 hover:underline">
                          Ver en mapa →
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};
