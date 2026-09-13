'use client';

import React, { useState, useEffect } from 'react';
import { MunicipalBehaviorStats } from '@/types/report';
import {
  X,
  TrendingUp,
  BarChart3,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Copy,
  Building2,
  Compass,
} from 'lucide-react';
import { CATEGORIAS_REPORTE } from '@/config/osorno';
import { calculateMunicipalBehaviorStats, getStoredReports } from '@/lib/storage';

interface MunicipalAnalyticsModalProps {
  onClose: () => void;
}

export const MunicipalAnalyticsModal: React.FC<MunicipalAnalyticsModalProps> = ({ onClose }) => {
  const [stats, setStats] = useState<MunicipalBehaviorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const reports = getStoredReports();
      const calculated = calculateMunicipalBehaviorStats(reports);
      setStats(calculated);
    } catch (err) {
      console.error('Error calculando analítica municipal:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const formatNumberCL = (num: number) => {
    return num.toString().replace('.', ',');
  };

  const handleCopySummary = () => {
    if (!stats) return;
    const text = `📊 INFORME DE AUDITORÍA CÍVICA Y COMPORTAMIENTO MUNICIPAL — OSORNO\n` +
      `Plataforma comunitaria «Acá Falta la Muni — Osorno»\n\n` +
      `• Total de reclamos registrados: ${stats.totalReports}\n` +
      `• Tasa comunal de resolución: ${stats.overallResolutionRate} %\n` +
      `• Demora promedio de resolución: ${formatNumberCL(stats.avgDaysToResolveCommunal)} días\n` +
      `• Días promedio de abandono activo: ${formatNumberCL(stats.avgDaysUnresolvedCommunal)} días\n\n` +
      `DISPARIDAD TERRITORIAL:\n` +
      `• Radio Urbano: ${stats.urbanStats.total} denuncias — Demora promedio resolución: ${formatNumberCL(stats.urbanStats.avgDaysToResolve)} días\n` +
      `• Sectores Rurales: ${stats.ruralStats.total} denuncias — Demora promedio resolución: ${formatNumberCL(stats.ruralStats.avgDaysToResolve)} días\n\n` +
      `CASO RÉCORD SIN SOLUCIÓN:\n` +
      (stats.top10Unresolved[0]
        ? `• ${stats.top10Unresolved[0].title} (${stats.top10Unresolved[0].sector}): ${stats.top10Unresolved[0].days_unresolved} días sin respuesta municipal.\n`
        : 'Sin casos críticos registrados.\n') +
      `\nGenerado con datos abiertos vecinales de Osorno.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#18181A] border border-white/10 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Cabecera del Modal */}
        <div className="p-5 pb-4 border-b border-neutral-800 flex items-center justify-between gap-3 bg-[#141414]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F4CA19]/20 border border-[#F4CA19]/40 text-[#F4CA19] flex items-center justify-center shadow-lg">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-white font-extrabold text-base sm:text-lg flex items-center gap-2">
                Auditoría del Comportamiento Municipal
                <span className="text-[10px] font-bold bg-[#F4CA19] text-black px-2 py-0.5 rounded-full">
                  Osorno
                </span>
              </h2>
              <p className="text-neutral-400 text-xs mt-0.5">
                Métricas de fiscalización vecinal, tiempos de respuesta y disparidad territorial urbano vs. rural
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal de auditoría"
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cuerpo del Informe */}
        <div className="p-5 overflow-y-auto space-y-6">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-neutral-400">
              <div className="w-8 h-8 rounded-full border-2 border-[#F4CA19] border-t-transparent animate-spin" />
              <span className="text-xs font-semibold">Calculando indicadores comunales de Osorno...</span>
            </div>
          ) : !stats ? (
            <div className="py-12 text-center text-neutral-400 text-xs">
              No fue posible calcular las estadísticas de comportamiento municipal.
            </div>
          ) : (
            <>
              {/* 1. Cuadrícula de Indicadores Globales */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-neutral-900/90 border border-white/5 p-3.5 rounded-2xl">
                  <span className="text-neutral-400 text-[11px] font-bold block uppercase tracking-wider">
                    Total Denuncias
                  </span>
                  <span className="text-white text-2xl font-black mt-1 block">
                    {stats.totalReports}
                  </span>
                  <span className="text-[10px] text-neutral-500 block mt-0.5">
                    {stats.activeReports} activas • {stats.resolvedReports} resueltas
                  </span>
                </div>

                <div className="bg-neutral-900/90 border border-white/5 p-3.5 rounded-2xl">
                  <span className="text-neutral-400 text-[11px] font-bold block uppercase tracking-wider">
                    Tasa de Resolución
                  </span>
                  <span className="text-emerald-400 text-2xl font-black mt-1 block">
                    {stats.overallResolutionRate} %
                  </span>
                  <span className="text-[10px] text-neutral-500 block mt-0.5">
                    Efectividad municipal
                  </span>
                </div>

                <div className="bg-neutral-900/90 border border-white/5 p-3.5 rounded-2xl">
                  <span className="text-neutral-400 text-[11px] font-bold block uppercase tracking-wider">
                    Demora Reparación
                  </span>
                  <span className="text-[#F4CA19] text-2xl font-black mt-1 block">
                    {formatNumberCL(stats.avgDaysToResolveCommunal)}
                  </span>
                  <span className="text-[10px] text-neutral-500 block mt-0.5">
                    Días promedio comunal
                  </span>
                </div>

                <div className="bg-neutral-900/90 border border-white/5 p-3.5 rounded-2xl">
                  <span className="text-neutral-400 text-[11px] font-bold block uppercase tracking-wider">
                    Espera Activa
                  </span>
                  <span className="text-rose-400 text-2xl font-black mt-1 block">
                    {formatNumberCL(stats.avgDaysUnresolvedCommunal)}
                  </span>
                  <span className="text-[10px] text-neutral-500 block mt-0.5">
                    Días promedio de abandono
                  </span>
                </div>
              </div>

              {/* 2. Estudio de Disparidad Territorial: Urbano vs. Rural */}
              <div className="bg-neutral-900/80 border border-white/10 rounded-2xl p-4 sm:p-5">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h3 className="text-white font-extrabold text-sm flex items-center gap-2">
                    <Compass className="w-4 h-4 text-[#F4CA19]" />
                    Disparidad Territorial: Radio Urbano vs. Sectores Rurales
                  </h3>
                  <span className="text-[10px] font-bold text-neutral-400 bg-black/40 px-2 py-0.5 rounded-md border border-white/5">
                    Comuna de Osorno (951 km²)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Tarjeta Radio Urbano */}
                  <div className="bg-[#141414] border border-blue-500/20 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-blue-400 font-bold text-xs flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5" />
                        Radio Urbano (Centro, Rahue, Francke...)
                      </span>
                      <span className="text-xs text-neutral-400 font-semibold">
                        {stats.urbanStats.total} denuncias
                      </span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between text-neutral-300">
                        <span>Demora promedio en reparar:</span>
                        <strong className="text-white font-black">
                          {formatNumberCL(stats.urbanStats.avgDaysToResolve)} días
                        </strong>
                      </div>
                      <div className="flex justify-between text-neutral-300">
                        <span>Días promedio de espera activa:</span>
                        <strong className="text-amber-400 font-black">
                          {formatNumberCL(stats.urbanStats.avgDaysUnresolved)} días
                        </strong>
                      </div>
                      <div className="flex justify-between text-neutral-300">
                        <span>Porcentaje de solución:</span>
                        <strong className="text-emerald-400 font-black">
                          {stats.urbanStats.total > 0
                            ? Math.round((stats.urbanStats.resolved / stats.urbanStats.total) * 100)
                            : 0}{' '}
                          %
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Tarjeta Sectores Rurales */}
                  <div className="bg-[#141414] border border-emerald-500/20 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-emerald-400 font-bold text-xs flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5" />
                        Sectores Rurales (Cancura, Pichil, Tacamó...)
                      </span>
                      <span className="text-xs text-neutral-400 font-semibold">
                        {stats.ruralStats.total} denuncias
                      </span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between text-neutral-300">
                        <span>Demora promedio en reparar:</span>
                        <strong className="text-white font-black">
                          {formatNumberCL(stats.ruralStats.avgDaysToResolve)} días
                        </strong>
                      </div>
                      <div className="flex justify-between text-neutral-300">
                        <span>Días promedio de espera activa:</span>
                        <strong className="text-rose-400 font-black">
                          {formatNumberCL(stats.ruralStats.avgDaysUnresolved)} días
                        </strong>
                      </div>
                      <div className="flex justify-between text-neutral-300">
                        <span>Porcentaje de solución:</span>
                        <strong className="text-emerald-400 font-black">
                          {stats.ruralStats.total > 0
                            ? Math.round((stats.ruralStats.resolved / stats.ruralStats.total) * 100)
                            : 0}{' '}
                          %
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-neutral-400 mt-3 leading-relaxed border-t border-white/5 pt-3">
                  💡 <strong className="text-neutral-200">Hallazgo cívico:</strong> Los sectores rurales de Osorno presentan un promedio de espera de{' '}
                  <strong className="text-[#F4CA19]">{formatNumberCL(stats.ruralStats.avgDaysUnresolved)} días</strong> sin respuesta municipal, frente a los{' '}
                  <strong className="text-white">{formatNumberCL(stats.urbanStats.avgDaysUnresolved)} días</strong> del radio urbano, evidenciando una brecha en la periodicidad de mantención de caminos y luminarias rurales.
                </p>
              </div>

              {/* 3. Tiempos de Respuesta por Categoría */}
              <div className="bg-neutral-900/80 border border-white/10 rounded-2xl p-4 sm:p-5">
                <h3 className="text-white font-extrabold text-sm mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#F4CA19]" />
                  Desempeño Municipal por Categoría Problemática
                </h3>

                <div className="space-y-2.5">
                  {stats.categories
                    .filter((c) => c.total > 0)
                    .sort((a, b) => b.avgDaysUnresolved - a.avgDaysUnresolved)
                    .map((cat) => {
                      const catConfig = CATEGORIAS_REPORTE[cat.category];
                      return (
                        <div
                          key={cat.category}
                          className="bg-[#141414] p-3 rounded-xl flex items-center justify-between gap-3 border border-white/5 text-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className="w-3 h-3 rounded-full shrink-0"
                              style={{ backgroundColor: catConfig?.color || '#F4CA19' }}
                            />
                            <span className="text-neutral-200 font-bold truncate">
                              {cat.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 shrink-0 text-[11px]">
                            <span className="text-neutral-400">
                              <strong className="text-white">{cat.total}</strong> reportes
                            </span>
                            <span className="text-rose-400 font-bold">
                              ⏱ {formatNumberCL(cat.avgDaysUnresolved)} d sin solución
                            </span>
                            <span className="text-emerald-400 font-semibold hidden sm:inline">
                              ✓ {cat.resolved} resueltos
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* 4. Sectores Más Afectados por Retrasos */}
              <div className="bg-neutral-900/80 border border-white/10 rounded-2xl p-4 sm:p-5">
                <h3 className="text-white font-extrabold text-sm mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#F4CA19]" />
                  Ranking de Sectores con Mayor Demora Acumulada
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {stats.topCriticalSectors.slice(0, 8).map((sec, i) => (
                    <div
                      key={sec.sector}
                      className="bg-[#141414] p-2.5 rounded-xl border border-white/5 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-neutral-500 font-black text-[10px]">#{i + 1}</span>
                        <span className="text-white font-bold">{sec.sector}</span>
                        {sec.isRural && (
                          <span className="text-[9px] font-bold bg-emerald-950 text-emerald-400 px-1 rounded">
                            Rural
                          </span>
                        )}
                      </div>
                      <span className="text-amber-400 font-extrabold text-[11px]">
                        {formatNumberCL(sec.avgDaysUnresolved)} días prom.
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Barra de Acciones Inferior */}
        <div className="p-4 bg-[#141414] border-t border-neutral-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopySummary}
            disabled={!stats}
            className="px-4 py-2.5 rounded-xl bg-[#F4CA19] hover:bg-[#E5BC12] text-black font-extrabold text-xs flex items-center gap-2 transition-transform active:scale-95 cursor-pointer shadow-md"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? '¡Informe copiado al portapapeles! ✓' : 'Copiar informe para Junta de Vecinos o Concejo'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
