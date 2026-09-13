'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Report, ReportCategory, ReportStatus, StatsSummary } from '@/types/report';
import {
  calculateStatsSummary,
  fetchReportsFromApi,
  createReportAction,
  toggleSupportAction,
  resolveReportAction,
  getStoredReports,
  getUserSupportedReportIds,
} from '@/lib/storage';
import { HeaderStats } from '@/components/HUD/HeaderStats';
import { CategoryFilters } from '@/components/HUD/CategoryFilters';
import { ReportDetailModal } from '@/components/Report/ReportDetailModal';
import { CreateReportDrawer } from '@/components/Report/CreateReportDrawer';
import { ReportFeedView } from '@/components/Feed/ReportFeedView';
import { TopUnresolvedWidget } from '@/components/HUD/TopUnresolvedWidget';
import { MunicipalAnalyticsModal } from '@/components/Analytics/MunicipalAnalyticsModal';
import { InstallAppModal } from '@/components/PWA/InstallAppModal';
import { OSORNO_CENTER, APP_VERSION } from '@/config/osorno';
import { MapPin } from 'lucide-react';

// Carga dinámica de Leaflet para aislar ejecución del lado del cliente
const MapView = dynamic(
  () => import('@/components/Map/MapView').then((m) => m.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-[#141414] text-neutral-400 text-xs">
        <div className="flex flex-col items-center gap-2.5">
          <div className="w-9 h-9 rounded-full border-2 border-[#F4CA19] border-t-transparent animate-spin" />
          <span className="font-semibold text-neutral-300">Cargando cartografía comunal de Osorno...</span>
        </div>
      </div>
    ),
  }
);

export default function HomePage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [userSupportedIds, setUserSupportedIds] = useState<Set<string>>(new Set());
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isCreatingReport, setIsCreatingReport] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [pickedCoords, setPickedCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Estados de vista y filtros
  const [viewMode, setViewMode] = useState<'pines' | 'calor' | 'feed'>('pines');
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory | 'todas'>('todas');
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus | 'todos'>('todos');
  const [selectedSector, setSelectedSector] = useState<string | 'todos'>('todos');

  // Inicializar reportes sincronizados con SQLite y apoyos locales
  useEffect(() => {
    // 1. Mostrar de inmediato la caché local rápida
    const local = getStoredReports();
    setReports(local);
    setUserSupportedIds(getUserSupportedReportIds());

    // 2. Sincronizar en segundo plano con la base de datos relacional SQLite
    fetchReportsFromApi().then((serverData) => {
      if (serverData && serverData.length > 0) {
        setReports(serverData);
      }
    });

    // Detectar si la URL contiene un reporte específico (?reporte=xxx) o invitación (?descargar=1)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const repId = params.get('reporte');
      if (repId) {
        const found = local.find((r) => r.id === repId);
        if (found) setSelectedReport(found);
      }
      if (params.get('descargar') === '1' || params.get('app') === '1') {
        setIsInstallModalOpen(true);
      } else {
        // En móviles, invitar a instalar en la primera visita con un ligero retraso no invasivo
        const dismissed = localStorage.getItem('osorno_install_prompt_dismissed_v1');
        const isMobile = /iphone|ipad|ipod|android/i.test(navigator.userAgent);
        if (!dismissed && isMobile) {
          const timer = setTimeout(() => {
            setIsInstallModalOpen(true);
          }, 1800);
          return () => clearTimeout(timer);
        }
      }
    }

    const handleReportsChanged = (e: any) => {
      if (e.detail) {
        setReports(e.detail);
      } else {
        setReports(getStoredReports());
      }
      setUserSupportedIds(getUserSupportedReportIds());
    };

    window.addEventListener('osorno-reports-changed', handleReportsChanged);
    return () => {
      window.removeEventListener('osorno-reports-changed', handleReportsChanged);
    };
  }, []);

  // Filtrado de reportes para el mapa y feed
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (selectedCategory !== 'todas' && r.category !== selectedCategory) return false;
      if (selectedStatus !== 'todos' && r.status !== selectedStatus) return false;
      if (selectedSector !== 'todos' && r.sector !== selectedSector) return false;
      return true;
    });
  }, [reports, selectedCategory, selectedStatus, selectedSector]);

  // Métricas agregadas
  const stats: StatsSummary = useMemo(() => {
    return calculateStatsSummary(reports);
  }, [reports]);

  // Apoyar o quitar apoyo (+1) con persistencia en SQLite
  const handleToggleSupport = async (reportId: string) => {
    const { newCount } = await toggleSupportAction(reportId);
    setUserSupportedIds(getUserSupportedReportIds());
    setReports(getStoredReports());

    if (selectedReport && selectedReport.id === reportId) {
      setSelectedReport({
        ...selectedReport,
        support_count: newCount,
      });
    }
  };

  // Marcar como resuelto en base de datos SQLite
  const handleResolveReport = async (reportId: string, resolvedImageUrl?: string) => {
    await resolveReportAction(reportId, resolvedImageUrl);
    setReports(getStoredReports());
    if (selectedReport && selectedReport.id === reportId) {
      setSelectedReport({
        ...selectedReport,
        status: 'resuelto',
        resolved_image_url: resolvedImageUrl || selectedReport.resolved_image_url,
      });
    }
  };

  // Clic en el mapa para situar o crear reporte
  const handleMapClick = (coords: { lat: number; lng: number }) => {
    if (isCreatingReport) {
      setPickedCoords(coords);
    } else {
      setPickedCoords(coords);
      setIsCreatingReport(true);
    }
  };

  // Publicar nuevo reporte en SQLite
  const handleCreateReportSubmit = async (reportData: any) => {
    const created = await createReportAction(reportData);
    setReports(getStoredReports());
    setUserSupportedIds(getUserSupportedReportIds());
    setIsCreatingReport(false);
    setPickedCoords(null);
    setSelectedReport(created);
  };

  return (
    <main className="relative w-screen h-[100dvh] overflow-hidden bg-[#141414] select-none font-sans">
      {/* 1. Contenedor Superior Unificado (HUD Responsive Móvil y Escritorio) */}
      <div className="absolute top-2 sm:top-3 left-2 sm:left-3 right-2 sm:right-3 z-30 pointer-events-none flex flex-col gap-1.5 sm:gap-2 max-w-7xl mx-auto">
        <HeaderStats
          stats={stats}
          viewMode={viewMode}
          onChangeViewMode={(mode) => setViewMode(mode)}
          onOpenCreate={() => {
            setPickedCoords(OSORNO_CENTER);
            setIsCreatingReport(true);
          }}
          onOpenAnalytics={() => setIsAnalyticsOpen(true)}
          onOpenInstall={() => setIsInstallModalOpen(true)}
        />

        {/* 2. Filtros de Categorías, Estados y Sectores (Urbano y Rural) */}
        {viewMode !== 'feed' && (
          <CategoryFilters
            reports={reports}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            selectedStatus={selectedStatus}
            onSelectStatus={setSelectedStatus}
            selectedSector={selectedSector}
            onSelectSector={setSelectedSector}
          />
        )}
      </div>

      {/* 3. Área Principal: Mapa Interactivo o Muro Feed */}
      <div className="w-full h-full z-0">
        {viewMode === 'feed' ? (
          <ReportFeedView
            reports={filteredReports}
            userSupportedIds={userSupportedIds}
            onSelectReport={(rep) => setSelectedReport(rep)}
            onToggleSupport={handleToggleSupport}
            onSwitchToMap={() => setViewMode('pines')}
          />
        ) : (
          <MapView
            reports={filteredReports}
            selectedReport={selectedReport}
            selectedSector={selectedSector}
            onSelectReport={(rep) => setSelectedReport(rep)}
            viewMode={viewMode === 'calor' ? 'calor' : 'pines'}
            onMapClick={handleMapClick}
            pickedCoords={isCreatingReport ? pickedCoords : null}
          />
        )}
      </div>

      {/* Mensaje de Estado Inicial Limpio cuando no hay denuncias registradas */}
      {reports.length === 0 && viewMode !== 'feed' && !isCreatingReport && !selectedReport && (
        <div className="pointer-events-none fixed inset-0 flex items-center justify-center p-4 z-20">
          <div className="pointer-events-auto bg-[#141414]/92 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-center max-w-sm shadow-2xl animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-[#F4CA19]/20 text-[#F4CA19] flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-6 h-6" />
            </div>
            <h2 className="text-white font-black text-sm mb-1.5">El mapa de Osorno está listo</h2>
            <p className="text-neutral-400 text-xs mb-4 leading-relaxed">
              No hay denuncias de prueba registradas. Sé la primera persona en fiscalizar un problema en tu barrio o sector rural.
            </p>
            <button
              type="button"
              onClick={() => setIsCreatingReport(true)}
              className="w-full bg-[#F4CA19] hover:bg-[#ffe043] text-black font-black text-xs py-2.5 px-4 rounded-xl shadow-lg transition-all cursor-pointer"
            >
              + Crear la primera denuncia
            </button>
          </div>
        </div>
      )}

      {/* 4. Widget Inferior Izquierdo: Top 10 Denuncias con Más Tiempo sin Solución */}
      {viewMode !== 'feed' && (
        <TopUnresolvedWidget
          reports={reports}
          onSelectReport={(rep) => setSelectedReport(rep)}
          selectedReportId={selectedReport?.id}
        />
      )}

      {/* 5. Crédito cívico discreto en la esquina inferior izquierda del mapa */}
      {viewMode !== 'feed' && (
        <aside
          aria-label="Créditos y contacto del autor"
          className="fixed bottom-2 left-3 z-20 pointer-events-auto flex items-center gap-1.5 text-[10px] text-neutral-400/80 hover:text-neutral-200 bg-[#141414]/75 hover:bg-[#141414]/95 backdrop-blur-xs px-2.5 py-1 rounded-md border border-white/5 transition-all shadow-sm"
        >
          <span className="font-mono text-[9px] bg-white/10 text-neutral-300 font-semibold px-1.5 py-0.5 rounded border border-white/10">
            {APP_VERSION}
          </span>
          <span>Por <strong className="text-neutral-300 font-medium">Pablo Benavides Jorquera</strong></span>
          <span className="text-neutral-600">·</span>
          <a
            href="mailto:acafaltalamuniosorno@gmail.com"
            className="text-neutral-400 hover:text-[#F4CA19] hover:underline transition-colors"
            title="Contacto por correo electrónico"
          >
            acafaltalamuniosorno@gmail.com
          </a>
        </aside>
      )}

      {/* 6. Modal de Auditoría y Comportamiento Municipal */}
      {isAnalyticsOpen && (
        <MunicipalAnalyticsModal onClose={() => setIsAnalyticsOpen(false)} />
      )}

      {/* 6. Modal / Drawer de Ficha Detallada */}
      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          isSupportedByUser={userSupportedIds.has(selectedReport.id)}
          onClose={() => {
            setSelectedReport(null);
            if (typeof window !== 'undefined') {
              const url = new URL(window.location.href);
              url.searchParams.delete('reporte');
              window.history.replaceState({}, '', url.toString());
            }
          }}
          onToggleSupport={handleToggleSupport}
          onResolveReport={handleResolveReport}
        />
      )}

      {/* 7. Cajón de Creación de Nuevo Reporte */}
      {isCreatingReport && (
        <CreateReportDrawer
          initialCoords={pickedCoords}
          existingReports={reports}
          onClose={() => {
            setIsCreatingReport(false);
            setPickedCoords(null);
          }}
          onSubmitReport={handleCreateReportSubmit}
          onSelectExistingReport={(existing) => {
            setSelectedReport(existing);
            setIsCreatingReport(false);
          }}
        />
      )}

      {/* 8. Modal de Instalación y Descarga de la App (Android e iOS) */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => {
          setIsInstallModalOpen(false);
          if (typeof window !== 'undefined') {
            localStorage.setItem('osorno_install_prompt_dismissed_v1', 'true');
          }
        }}
      />
    </main>
  );
}
