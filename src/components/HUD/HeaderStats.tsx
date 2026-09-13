'use client';

import React from 'react';
import { StatsSummary } from '@/types/report';
import { APP_VERSION } from '@/config/osorno';
import { Plus, Flame, MapPin, ListFilter, AlertCircle, CheckCircle2, BarChart3, Smartphone } from 'lucide-react';

interface HeaderStatsProps {
  stats: StatsSummary;
  viewMode: 'pines' | 'calor' | 'feed';
  onChangeViewMode: (mode: 'pines' | 'calor' | 'feed') => void;
  onOpenCreate: () => void;
  onOpenAnalytics: () => void;
  onOpenInstall?: () => void;
}

export const HeaderStats: React.FC<HeaderStatsProps> = ({
  stats,
  viewMode,
  onChangeViewMode,
  onOpenCreate,
  onOpenAnalytics,
  onOpenInstall,
}) => {
  return (
    <header className="pointer-events-none flex flex-col md:flex-row items-stretch md:items-center justify-between gap-1.5 sm:gap-2.5">
      {/* Barra Principal de Marca y Métricas */}
      <div className="pointer-events-auto bg-[#18181A]/95 backdrop-blur-md border border-white/10 rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 shadow-2xl flex items-center justify-between gap-2.5 sm:gap-4 flex-1">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#F4CA19] flex items-center justify-center text-black font-black text-base sm:text-lg shadow-lg shrink-0">
            !
          </div>
          <div className="min-w-0 truncate">
            <h1 className="text-white font-black tracking-tight text-xs sm:text-sm md:text-base leading-none flex items-center gap-1.5">
              <span className="truncate">ACÁ FALTA LA MUNI</span>
              <span className="text-[9px] sm:text-[10px] bg-[#F4CA19]/15 text-[#F4CA19] font-bold px-1.5 py-0.5 rounded border border-[#F4CA19]/30 shrink-0">
                OSORNO
              </span>
              <span className="text-[9px] sm:text-[10px] font-mono bg-white/10 text-neutral-300 font-semibold px-1.5 py-0.5 rounded border border-white/10 shrink-0">
                {APP_VERSION}
              </span>
            </h1>
            <p className="text-neutral-400 text-[10px] sm:text-[11px] font-medium truncate mt-0.5">
              Fiscalización comunitaria en tiempo real
            </p>
          </div>
        </div>

        {/* Métricas rápidas: en móvil muestra badge compacto; en tablet/PC muestra detalle completo */}
        <div className="flex items-center gap-2 sm:gap-3 border-l border-neutral-800 pl-2.5 sm:pl-4 text-xs shrink-0">
          <div className="flex items-center gap-1 text-neutral-300">
            <AlertCircle className="w-3.5 h-3.5 text-[#F4CA19]" />
            <span className="hidden sm:inline"><strong className="text-white font-bold">{stats.totalActive}</strong> activos</span>
            <span className="sm:hidden font-black text-white text-xs">{stats.totalActive}</span>
          </div>
          <div className="flex items-center gap-1 text-neutral-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline"><strong className="text-emerald-400 font-bold">{stats.resolutionRatePercent} %</strong> resueltos</span>
            <span className="sm:hidden font-bold text-emerald-400 text-xs">{stats.resolutionRatePercent}%</span>
          </div>

          {/* Botón "+ Reportar" directo en la barra superior en pantallas pequeñas */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={onOpenCreate}
              className="bg-[#F4CA19] hover:bg-[#ffe14d] active:scale-95 text-black font-black text-xs px-2.5 py-1.5 rounded-xl shadow-lg transition-all flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Reportar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Controles secundarios: Auditoría, selector de vista y botón de reporte en escritorio */}
      <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 justify-between md:justify-end">
        {/* Botón de Auditoría Cívica Municipal */}
        <button
          type="button"
          onClick={onOpenAnalytics}
          className="bg-[#141414]/92 hover:bg-[#1C1C1E] active:scale-95 text-neutral-200 hover:text-[#F4CA19] font-bold text-xs px-2.5 sm:px-3 py-2 rounded-xl shadow-xl transition-all flex items-center gap-1.5 border border-white/10 shrink-0 cursor-pointer"
          title="Ver auditoría comunitaria y comportamiento municipal en Osorno"
        >
          <BarChart3 className="w-3.5 h-3.5 text-[#F4CA19]" />
          <span className="text-[11px] sm:text-xs">Auditoría</span>
          <span className="hidden sm:inline text-[11px] sm:text-xs">Municipal</span>
        </button>

        {/* Botón Descargar / Instalar App */}
        {onOpenInstall && (
          <button
            type="button"
            onClick={onOpenInstall}
            className="bg-[#141414]/92 hover:bg-[#1C1C1E] active:scale-95 text-neutral-200 hover:text-[#F4CA19] font-bold text-xs px-2.5 sm:px-3 py-2 rounded-xl shadow-xl transition-all flex items-center gap-1.5 border border-white/10 shrink-0 cursor-pointer"
            title="Descargar o instalar App en tu teléfono Android o iPhone"
          >
            <Smartphone className="w-3.5 h-3.5 text-[#F4CA19]" />
            <span className="text-[11px] sm:text-xs font-bold">App</span>
          </button>
        )}

        {/* Selector de modo de visualización */}
        <div className="bg-[#141414]/92 backdrop-blur-md border border-white/10 rounded-xl p-0.5 sm:p-1 shadow-xl flex items-center gap-0.5 sm:gap-1">
          <button
            type="button"
            onClick={() => onChangeViewMode('pines')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              viewMode === 'pines'
                ? 'bg-neutral-800 text-[#F4CA19] shadow-inner'
                : 'text-neutral-400 hover:text-white'
            }`}
            title="Ver marcadores individuales"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span className="text-[11px] sm:text-xs">Pines</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeViewMode('calor')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              viewMode === 'calor'
                ? 'bg-neutral-800 text-[#F4CA19] shadow-inner'
                : 'text-neutral-400 hover:text-white'
            }`}
            title="Ver mapa de calor de densidad"
          >
            <Flame className="w-3.5 h-3.5" />
            <span className="text-[11px] sm:text-xs">Calor</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeViewMode('feed')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              viewMode === 'feed'
                ? 'bg-neutral-800 text-[#F4CA19] shadow-inner'
                : 'text-neutral-400 hover:text-white'
            }`}
            title="Ver muro cronológico de reclamos"
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span className="text-[11px] sm:text-xs">Muro</span>
          </button>
        </div>

        {/* Botón Principal de Reportar (visible en desktop) */}
        <div className="hidden md:block">
          <button
            type="button"
            onClick={onOpenCreate}
            className="bg-[#F4CA19] hover:bg-[#ffe14d] active:scale-95 text-black font-extrabold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xl transition-all flex items-center gap-1.5 border border-black/20 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Reportar</span>
          </button>
        </div>
      </div>
    </header>
  );
};
