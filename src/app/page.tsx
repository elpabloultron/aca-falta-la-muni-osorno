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
  subscribeToFirestoreReports,
} from '@/lib/storage';
import { HeaderStats } from '@/components/HUD/HeaderStats';
import { CategoryFilters } from '@/components/HUD/CategoryFilters';
import { ReportDetailModal } from '@/components/Report/ReportDetailModal';
import { CreateReportDrawer } from '@/components/Report/CreateReportDrawer';
import { ReportFeedView } from '@/components/Feed/ReportFeedView';
import { TopUnresolvedWidget } from '@/components/HUD/TopUnresolvedWidget';
import { MunicipalAnalyticsModal } from '@/components/Analytics/MunicipalAnalyticsModal';
import { InstallAppModal } from '@/components/PWA/InstallAppModal';
import { FossDownloadCenter } from '@/components/Downloads/FossDownloadCenter';
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
  const [focusedReport, setFocusedReport] = useState<Report | null>(null);
  const [successToast, setSuccessToast] = useState<{ report: Report; message: string } | null>(null);
  const [isCreatingReport, setIsCreatingReport] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [pickedCoords, setPickedCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Estados de vista y filtros
  const [viewMode, setViewMode] = useState<'pines' | 'calor' | 'feed' | 'descargas'>('pines');
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory | 'todas'>('todas');
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus | 'todos'>('todos');
  const [selectedSector, setSelectedSector] = useState<string | 'todos'>('todos');

  // Inicializar reportes sincronizados con Cloud Firestore y apoyos locales
  useEffect(() => {
    // 1. Mostrar de inmediato la caché local rápida
    const local = getStoredReports();
    setReports(local);
    setUserSupportedIds(getUserSupportedReportIds());

    // 2. Suscripción reactiva en tiempo real a la base de datos central Cloud Firestore
    const unsubscribeFirestore = subscribeToFirestoreReports((cloudReports) => {
      setReports(cloudReports);
      setUserSupportedIds(getUserSupportedReportIds());
    });

    // Detectar si la URL contiene un reporte específico (?reporte=xxx) o vista de descargas (?vista=descargas o ?descargar=1)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const repId = params.get('reporte');
      if (repId) {
        const found = local.find((r) => r.id === repId);
        if (found) setSelectedReport(found);
      }
      const vista = params.get('vista');
      if (vista === 'descargas' || vista === 'app' || params.get('descargar') === '1' || params.get('app') === '1') {
        setViewMode('descargas');
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
      unsubscribeFirestore();
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

  // Cambiar modo de vista y sincronizar con la URL
  const handleChangeViewMode = (mode: 'pines' | 'calor' | 'feed' | 'descargas') => {
    setViewMode(mode);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (mode === 'descargas') {
        url.searchParams.set('vista', 'descargas');
      } else {
        url.searchParams.delete('vista');
        url.searchParams.delete('descargar');
        url.searchParams.delete('app');
      }
      window.history.replaceState({}, '', url.toString());
    }
  };

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

  // Descartar automáticamente notificación toast de éxito tras 6 segundos
  useEffect(() => {
    if (!successToast) return;
    const timer = setTimeout(() => {
      setSuccessToast(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [successToast]);

  // Clic en el mapa para situar o crear reporte
  const handleMapClick = (coords: { lat: number; lng: number }) => {
    if (isCreatingReport) {
      setPickedCoords(coords);
    } else {
      setPickedCoords(coords);
      setIsCreatingReport(true);
    }
  };

  // Publicar nuevo reporte y enfocar inmediatamente en el mapa
  const handleCreateReportSubmit = async (reportData: any) => {
    const created = await createReportAction(reportData);
    const updated = getStoredReports();
    setReports(updated);
    setUserSupportedIds(getUserSupportedReportIds());
    setIsCreatingReport(false);
    setPickedCoords(null);

    // Restablecer filtros para garantizar que el nuevo reporte sea visible de inmediato
    setSelectedCategory('todas');
    setSelectedStatus('todos');
    setSelectedSector('todos');
    setViewMode('pines');

    // Centrar el mapa y desplegar la ventana emergente sobre el pin
    setFocusedReport(created);

    // Aviso confirmatorio amigable y no invasivo
    setSuccessToast({
      report: created,
      message: '¡Denuncia publicada con éxito en el mapa de Osorno!',
    });
  };

  return (
    <main className="relative w-screen h-[100dvh] overflow-hidden bg-[#141414] select-none font-sans">
      {/* 1. Contenedor Superior Unificado (HUD Responsive Móvil y Escritorio) */}
      {viewMode !== 'descargas' && (
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 right-2 sm:right-3 z-30 pointer-events-none flex flex-col gap-1.5 sm:gap-2 max-w-7xl mx-auto">
          <HeaderStats
            stats={stats}
            viewMode={viewMode}
            onChangeViewMode={handleChangeViewMode}
            onOpenCreate={() => {
              setPickedCoords(OSORNO_CENTER);
              setIsCreatingReport(true);
            }}
            onOpenAnalytics={() => setIsAnalyticsOpen(true)}
            onOpenInstall={() => handleChangeViewMode('descargas')}
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
      )}

      {/* 3. Área Principal: Mapa Interactivo, Muro Feed o Centro de Descargas FOSS */}
      <div className="w-full h-full z-0">
        {viewMode === 'descargas' ? (
          <FossDownloadCenter onBackToMap={() => handleChangeViewMode('pines')} />
        ) : viewMode === 'feed' ? (
          <ReportFeedView
            reports={filteredReports}
            userSupportedIds={userSupportedIds}
            onSelectReport={(rep) => setSelectedReport(rep)}
            onToggleSupport={handleToggleSupport}
            onSwitchToMap={() => handleChangeViewMode('pines')}
          />
        ) : (
          <MapView
            reports={filteredReports}
            selectedReport={selectedReport}
            focusedReport={focusedReport}
            selectedSector={selectedSector}
            onSelectReport={(rep) => setSelectedReport(rep)}
            viewMode={viewMode === 'calor' ? 'calor' : 'pines'}
            onMapClick={handleMapClick}
            pickedCoords={isCreatingReport ? pickedCoords : null}
          />
        )}
      </div>

      {/* 4. Widget Inferior Izquierdo: Top 10 Denuncias con Más Tiempo sin Solución */}
      {viewMode !== 'feed' && viewMode !== 'descargas' && (
        <TopUnresolvedWidget
          reports={reports}
          onSelectReport={(rep) => {
            setFocusedReport(rep);
            handleChangeViewMode('pines');
          }}
          selectedReportId={focusedReport?.id || selectedReport?.id}
        />
      )}

      {/* Toast confirmatorio de denuncia publicada exitosamente */}
      {successToast && (
        <div className="fixed top-20 sm:top-24 left-1/2 -translate-x-1/2 z-40 max-w-md w-[calc(100vw-2rem)] bg-[#18181A]/95 border border-[#F4CA19] text-white p-3.5 rounded-2xl shadow-2xl backdrop-blur-md animate-fadeIn flex items-center justify-between gap-3 pointer-events-auto">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#F4CA19] text-black font-black flex items-center justify-center shrink-0 text-sm">
              ✓
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-[#F4CA19] truncate leading-tight">
                {successToast.message}
              </p>
              <p className="text-[11px] text-neutral-300 truncate">
                «{successToast.report.title}» en {successToast.report.sector}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                setSelectedReport(successToast.report);
                setSuccessToast(null);
              }}
              className="bg-[#F4CA19] hover:bg-[#ffe043] text-black font-bold text-xs px-3 py-1.5 rounded-xl transition-all cursor-pointer"
            >
              Ver ficha
            </button>
            <button
              type="button"
              onClick={() => setSuccessToast(null)}
              className="text-neutral-400 hover:text-white p-1 rounded-lg text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 5. Crédito cívico discreto en la esquina inferior izquierda del mapa */}
      {viewMode !== 'feed' && viewMode !== 'descargas' && (
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
        onOpenFullDownloads={() => {
          setIsInstallModalOpen(false);
          handleChangeViewMode('descargas');
        }}
      />
    </main>
  );
}
