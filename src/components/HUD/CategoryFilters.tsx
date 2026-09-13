'use client';

import React from 'react';
import { CATEGORIAS_REPORTE, SECTORES_OSORNO, SECTORES_URBANOS, SECTORES_RURALES } from '@/config/osorno';
import { Report, ReportCategory, ReportStatus } from '@/types/report';
import { CategoryIcon } from '../CategoryIcon';

interface CategoryFiltersProps {
  reports: Report[];
  selectedCategory: ReportCategory | 'todas';
  onSelectCategory: (cat: ReportCategory | 'todas') => void;
  selectedStatus: ReportStatus | 'todos';
  onSelectStatus: (status: ReportStatus | 'todos') => void;
  selectedSector: string | 'todos';
  onSelectSector: (sector: string | 'todos') => void;
}

export const CategoryFilters: React.FC<CategoryFiltersProps> = ({
  reports,
  selectedCategory,
  onSelectCategory,
  selectedStatus,
  onSelectStatus,
  selectedSector,
  onSelectSector,
}) => {
  // Contar reportes por categoría
  const countByCategory = (cat: ReportCategory | 'todas') => {
    if (cat === 'todas') return reports.length;
    return reports.filter((r) => r.category === cat).length;
  };

  return (
    <div className="pointer-events-none flex flex-col gap-1.5 w-full">
      {/* Barra de Filtros de Categoría Deslizable Horizontal */}
      <div className="pointer-events-auto flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none no-scrollbar touch-pan-x">
        {/* Chip "Todas" */}
        <button
          type="button"
          onClick={() => onSelectCategory('todas')}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 backdrop-blur-md border shadow-lg ${
            selectedCategory === 'todas'
              ? 'bg-[#F4CA19] text-black border-[#F4CA19] shadow-yellow-500/20'
              : 'bg-[#141414]/85 text-neutral-300 border-white/10 hover:border-white/30'
          }`}
        >
          <span>Todas</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
            selectedCategory === 'todas' ? 'bg-black/20 text-black' : 'bg-neutral-800 text-neutral-400'
          }`}>
            {countByCategory('todas')}
          </span>
        </button>

        {/* Chips de Categorías Específicas */}
        {(Object.keys(CATEGORIAS_REPORTE) as ReportCategory[]).map((catKey) => {
          const cat = CATEGORIAS_REPORTE[catKey];
          const isSelected = selectedCategory === catKey;
          const count = countByCategory(catKey);

          return (
            <button
              key={catKey}
              type="button"
              onClick={() => onSelectCategory(catKey)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 backdrop-blur-md border shadow-lg ${
                isSelected
                  ? 'bg-neutral-800 text-white border-[#F4CA19] shadow-md ring-1 ring-[#F4CA19]'
                  : 'bg-[#141414]/85 text-neutral-300 border-white/10 hover:border-white/30'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              <span className="truncate max-w-[130px]">{cat.name.split(' ')[0]}</span>
              {count > 0 && (
                <span className="text-[10px] px-1.5 rounded-full bg-neutral-800 text-neutral-400 font-semibold">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Filtros secundarios: Estados y Sectores */}
      <div className="pointer-events-auto flex items-center gap-2 overflow-x-auto py-0.5">
        {/* Selector de Estado */}
        <div className="bg-[#141414]/85 backdrop-blur-md border border-white/10 rounded-xl px-2 py-1 flex items-center gap-1 text-[11px] font-semibold text-neutral-300 shrink-0">
          <span className="text-neutral-500 font-bold px-1">Estado:</span>
          {(['todos', 'pendiente', 'en_revision', 'resuelto'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => onSelectStatus(st)}
              className={`px-2 py-0.5 rounded-md capitalize transition-colors ${
                selectedStatus === st
                  ? 'bg-[#F4CA19] text-black font-bold'
                  : 'hover:text-white'
              }`}
            >
              {st === 'todos' ? 'Todos' : st === 'en_revision' ? 'En revisión' : st}
            </button>
          ))}
        </div>

        {/* Selector de Sector de Osorno (Urbano y Rural) */}
        <div className="bg-[#141414]/85 backdrop-blur-md border border-white/10 rounded-xl px-2.5 py-1 flex items-center gap-1.5 text-[11px] text-neutral-300 shrink-0">
          <span className="text-neutral-500 font-bold">Sector:</span>
          <select
            value={selectedSector}
            onChange={(e) => onSelectSector(e.target.value)}
            aria-label="Filtrar por sector de Osorno"
            className="bg-transparent text-white font-semibold text-[11px] focus:outline-none cursor-pointer"
          >
            <option value="todos" className="bg-[#141414] text-white">Toda la comuna (951 km²)</option>
            <optgroup label="— Radio Urbano —" className="bg-[#1C1C1E] text-[#F4CA19] font-bold">
              {SECTORES_URBANOS.map((sec) => (
                <option key={sec} value={sec} className="bg-[#141414] text-white font-normal">
                  {sec}
                </option>
              ))}
            </optgroup>
            <optgroup label="— Sectores Rurales —" className="bg-[#1C1C1E] text-emerald-400 font-bold">
              {SECTORES_RURALES.map((sec) => (
                <option key={sec} value={sec} className="bg-[#141414] text-white font-normal">
                  {sec} (Rural)
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>
    </div>
  );
};
