import { Report, ReportCategory, StatsSummary, MunicipalBehaviorStats, CategoryStat, SectorStat } from '@/types/report';
import { CATEGORIAS_REPORTE } from '@/config/osorno';
import { calculateDaysElapsed, isSectorRural } from './geo-utils';

const FLAGS_KEY = 'aca_falta_la_muni_osorno_user_flags_v2';

const STORAGE_KEY = 'aca_falta_la_muni_osorno_reports_live_v1';
const SUPPORTS_KEY = 'aca_falta_la_muni_osorno_user_supports_v2';
const DEVICE_ID_KEY = 'aca_falta_la_muni_osorno_device_id';

const now = Date.now();
const dayMs = 24 * 60 * 60 * 1000;

export const INITIAL_REPORTS_SEED: Report[] = [];


export function getDeviceId(): string {
  if (typeof window === 'undefined') return 'server-device';
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = 'dev_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

export function getUserSupportedReportIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(SUPPORTS_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

export function saveUserSupportedReportIds(supported: Set<string>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SUPPORTS_KEY, JSON.stringify(Array.from(supported)));
  } catch (err) {
    console.error('Error guardando apoyos locales:', err);
  }
}

export function getStoredReports(): Report[] {
  if (typeof window === 'undefined') return INITIAL_REPORTS_SEED;
  try {
    // Limpieza automática de claves previas con datos de simulación
    localStorage.removeItem('aca_falta_la_muni_osorno_reports_v1');
    localStorage.removeItem('aca_falta_la_muni_osorno_reports_v2');

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_REPORTS_SEED));
      return INITIAL_REPORTS_SEED;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_REPORTS_SEED;
  }
}

export function saveStoredReports(reports: Report[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
    window.dispatchEvent(new CustomEvent('osorno-reports-changed', { detail: reports }));
  } catch (err) {
    console.error('Error persistiendo reportes en localStorage:', err);
  }
}

export async function fetchReportsFromApi(): Promise<Report[]> {
  return getStoredReports();
}

/**
 * Crea nuevo reporte y actualiza estado local
 */
export async function createReportAction(
  data: Omit<Report, 'id' | 'created_at' | 'updated_at' | 'support_count' | 'status' | 'days_unresolved' | 'days_to_resolve'>
): Promise<Report> {
  const newReport: Report = {
    ...data,
    id: 'rep_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: 'pendiente',
    support_count: 1,
    days_unresolved: 0,
    is_rural: data.is_rural ?? isSectorRural(data.sector),
  };

  const updatedReports = [newReport, ...getStoredReports()];
  saveStoredReports(updatedReports);

  const userSupports = getUserSupportedReportIds();
  userSupports.add(newReport.id);
  saveUserSupportedReportIds(userSupports);

  return newReport;
}

/**
 * Alterna apoyo cívico (+1)
 */
export async function toggleSupportAction(
  reportId: string
): Promise<{ supported: boolean; newCount: number }> {
  const userSupports = getUserSupportedReportIds();
  const wasSupported = userSupports.has(reportId);

  let newCount = 0;
  const reports = getStoredReports().map((rep) => {
    if (rep.id === reportId) {
      if (wasSupported) {
        newCount = Math.max(0, rep.support_count - 1);
        userSupports.delete(reportId);
      } else {
        newCount = rep.support_count + 1;
        userSupports.add(reportId);
      }
      return { ...rep, support_count: newCount };
    }
    return rep;
  });

  saveStoredReports(reports);
  saveUserSupportedReportIds(userSupports);

  return { supported: !wasSupported, newCount };
}

/**
 * Marca como resuelto con evidencia fotográfica
 */
export async function resolveReportAction(
  reportId: string,
  resolvedImageUrl?: string
): Promise<boolean> {
  const reports = getStoredReports().map((rep) => {
    if (rep.id === reportId) {
      const nowIso = new Date().toISOString();
      const days = calculateDaysElapsed(rep.created_at, nowIso);
      return {
        ...rep,
        status: 'resuelto' as const,
        resolved_at: nowIso,
        resolved_image_url: resolvedImageUrl || rep.resolved_image_url,
        days_to_resolve: days,
        days_unresolved: days,
      };
    }
    return rep;
  });

  saveStoredReports(reports);
  return true;
}

export function calculateStatsSummary(reports: Report[]): StatsSummary {
  const activeReports = reports.filter((r) => r.status !== 'resuelto');
  const resolvedReports = reports.filter((r) => r.status === 'resuelto');

  // Categoría más reportada
  const categoryCounts: Record<string, number> = {};
  for (const r of activeReports) {
    categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
  }
  let topCategoryId = 'calles';
  let maxCatCount = 0;
  for (const [cat, count] of Object.entries(categoryCounts)) {
    if (count > maxCatCount) {
      maxCatCount = count;
      topCategoryId = cat;
    }
  }
  const topCategoryName = CATEGORIAS_REPORTE[topCategoryId as ReportCategory]?.name || 'Calles';

  // Sector más reportado
  const sectorCounts: Record<string, number> = {};
  for (const r of activeReports) {
    sectorCounts[r.sector] = (sectorCounts[r.sector] || 0) + 1;
  }
  let topSectorName = 'Rahue Alto';
  let maxSecCount = 0;
  for (const [sec, count] of Object.entries(sectorCounts)) {
    if (count > maxSecCount) {
      maxSecCount = count;
      topSectorName = sec;
    }
  }

  const total = reports.length;
  const resolutionRatePercent = total > 0 ? Math.round((resolvedReports.length / total) * 100) : 0;

  const totalDaysUnresolved = activeReports.reduce((sum, r) => sum + (r.days_unresolved || calculateDaysElapsed(r.created_at)), 0);
  const avgDaysUnresolved = activeReports.length > 0 ? Math.round(totalDaysUnresolved / activeReports.length) : 0;

  const totalDaysToResolve = resolvedReports.reduce((sum, r) => sum + (r.days_to_resolve || 0), 0);
  const avgDaysToResolve = resolvedReports.length > 0 ? Math.round(totalDaysToResolve / resolvedReports.length) : 0;

  return {
    totalActive: activeReports.length,
    totalResolved: resolvedReports.length,
    topCategory: topCategoryName,
    topSector: topSectorName,
    resolutionRatePercent,
    averageDaysUnresolved: avgDaysUnresolved,
    averageDaysToResolve: avgDaysToResolve,
  };
}

export function getUserFlaggedReportIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(FLAGS_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

export function saveUserFlaggedReportIds(flaggedSet: Set<string>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FLAGS_KEY, JSON.stringify(Array.from(flaggedSet)));
  } catch (err) {
    console.error('Error guardando reportes denunciados:', err);
  }
}

export async function flagReportAction(
  reportId: string,
  _reason?: string
): Promise<{ success: boolean; flagged: boolean; flagsCount: number; isHidden: boolean; message: string }> {
  const flaggedSet = getUserFlaggedReportIds();
  if (flaggedSet.has(reportId)) {
    const report = getStoredReports().find((r) => r.id === reportId);
    return {
      success: true,
      flagged: false,
      flagsCount: report?.flags_count || 1,
      isHidden: !!report?.is_hidden,
      message: 'Ya habías reportado esta publicación previamente desde tu dispositivo.',
    };
  }

  flaggedSet.add(reportId);
  saveUserFlaggedReportIds(flaggedSet);

  let flagsCount = 1;
  let isHidden = false;

  const reports = getStoredReports().map((rep) => {
    if (rep.id === reportId) {
      flagsCount = (rep.flags_count || 0) + 1;
      isHidden = flagsCount >= 3;
      return {
        ...rep,
        flags_count: flagsCount,
        is_hidden: isHidden,
      };
    }
    return rep;
  });

  saveStoredReports(reports);

  return {
    success: true,
    flagged: true,
    flagsCount,
    isHidden,
    message: 'Denuncia recibida correctamente. Gracias por proteger a la comunidad de Osorno.',
  };
}

export function calculateMunicipalBehaviorStats(reports?: Report[]): MunicipalBehaviorStats {
  const allReports = reports || getStoredReports();
  const activeReports = allReports.filter((r) => r.status !== 'resuelto');
  const resolvedReports = allReports.filter((r) => r.status === 'resuelto');

  const urbanReports = allReports.filter((r) => !r.is_rural);
  const ruralReports = allReports.filter((r) => r.is_rural);

  const urbanActive = urbanReports.filter((r) => r.status !== 'resuelto');
  const urbanResolved = urbanReports.filter((r) => r.status === 'resuelto');

  const ruralActive = ruralReports.filter((r) => r.status !== 'resuelto');
  const ruralResolved = ruralReports.filter((r) => r.status === 'resuelto');

  const calcAvg = (items: number[]) =>
    items.length > 0 ? Number((items.reduce((a, b) => a + b, 0) / items.length).toFixed(1)) : 0;

  const communalDaysToResolve = resolvedReports.map((r) => r.days_to_resolve || 0);
  const communalDaysUnresolved = activeReports.map((r) => r.days_unresolved || calculateDaysElapsed(r.created_at));

  const categories: CategoryStat[] = (Object.keys(CATEGORIAS_REPORTE) as ReportCategory[]).map((catKey) => {
    const catReports = allReports.filter((r) => r.category === catKey);
    const catActive = catReports.filter((r) => r.status !== 'resuelto');
    const catResolved = catReports.filter((r) => r.status === 'resuelto');

    return {
      category: catKey,
      name: CATEGORIAS_REPORTE[catKey].name,
      total: catReports.length,
      unresolved: catActive.length,
      resolved: catResolved.length,
      avgDaysUnresolved: calcAvg(catActive.map((r) => r.days_unresolved || calculateDaysElapsed(r.created_at))),
      avgDaysToResolve: calcAvg(catResolved.map((r) => r.days_to_resolve || 0)),
    };
  });

  const sectorMap = new Map<string, { isRural: boolean; reports: Report[] }>();
  allReports.forEach((r) => {
    if (!sectorMap.has(r.sector)) {
      sectorMap.set(r.sector, { isRural: r.is_rural, reports: [] });
    }
    sectorMap.get(r.sector)!.reports.push(r);
  });

  const topCriticalSectors: SectorStat[] = Array.from(sectorMap.entries())
    .map(([sector, data]) => {
      const act = data.reports.filter((r) => r.status !== 'resuelto');
      const res = data.reports.filter((r) => r.status === 'resuelto');
      return {
        sector,
        isRural: data.isRural,
        total: data.reports.length,
        unresolved: act.length,
        resolved: res.length,
        avgDaysUnresolved: calcAvg(act.map((r) => r.days_unresolved || calculateDaysElapsed(r.created_at))),
        avgDaysToResolve: calcAvg(res.map((r) => r.days_to_resolve || 0)),
      };
    })
    .sort((a, b) => b.avgDaysUnresolved - a.avgDaysUnresolved);

  const top10Unresolved = [...activeReports]
    .sort((a, b) => (b.days_unresolved || calculateDaysElapsed(b.created_at)) - (a.days_unresolved || calculateDaysElapsed(a.created_at)))
    .slice(0, 10);

  return {
    totalReports: allReports.length,
    activeReports: activeReports.length,
    resolvedReports: resolvedReports.length,
    overallResolutionRate:
      allReports.length > 0 ? Math.round((resolvedReports.length / allReports.length) * 100) : 0,
    avgDaysToResolveCommunal: calcAvg(communalDaysToResolve),
    avgDaysUnresolvedCommunal: calcAvg(communalDaysUnresolved),
    urbanStats: {
      total: urbanReports.length,
      unresolved: urbanActive.length,
      resolved: urbanResolved.length,
      avgDaysToResolve: calcAvg(urbanResolved.map((r) => r.days_to_resolve || 0)),
      avgDaysUnresolved: calcAvg(urbanActive.map((r) => r.days_unresolved || calculateDaysElapsed(r.created_at))),
    },
    ruralStats: {
      total: ruralReports.length,
      unresolved: ruralActive.length,
      resolved: ruralResolved.length,
      avgDaysToResolve: calcAvg(ruralResolved.map((r) => r.days_to_resolve || 0)),
      avgDaysUnresolved: calcAvg(ruralActive.map((r) => r.days_unresolved || calculateDaysElapsed(r.created_at))),
    },
    categories,
    topCriticalSectors,
    top10Unresolved,
  };
}
