export type ReportStatus = 'pendiente' | 'en_revision' | 'resuelto';

export type ReportCategory =
  | 'calles'
  | 'iluminacion'
  | 'limpieza'
  | 'aguas'
  | 'espacios_publicos'
  | 'accesibilidad'
  | 'transito'
  | 'bienestar_animal'
  | 'medio_ambiente'
  | 'otros';

export interface Report {
  id: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  title: string;
  description: string;
  category: ReportCategory;
  sector: string;
  is_rural: boolean;
  address_reference: string;
  latitude: number;
  longitude: number;
  image_url?: string;
  resolved_image_url?: string;
  author_name: string;
  is_anonymous: boolean;
  status: ReportStatus;
  support_count: number;
  days_unresolved?: number;
  days_to_resolve?: number;
  flags_count?: number;
  is_hidden?: boolean;
}

export interface CategoryInfo {
  id: ReportCategory;
  name: string;
  description: string;
  color: string;
  iconName: string;
}

export interface StatsSummary {
  totalActive: number;
  totalResolved: number;
  topCategory: string;
  topSector: string;
  resolutionRatePercent: number;
  averageDaysUnresolved?: number;
  averageDaysToResolve?: number;
}

export interface CategoryStat {
  category: ReportCategory;
  name: string;
  total: number;
  unresolved: number;
  resolved: number;
  avgDaysUnresolved: number;
  avgDaysToResolve: number;
}

export interface SectorStat {
  sector: string;
  isRural: boolean;
  total: number;
  unresolved: number;
  resolved: number;
  avgDaysUnresolved: number;
  avgDaysToResolve: number;
}

export interface MunicipalBehaviorStats {
  totalReports: number;
  activeReports: number;
  resolvedReports: number;
  overallResolutionRate: number;
  avgDaysToResolveCommunal: number;
  avgDaysUnresolvedCommunal: number;
  urbanStats: {
    total: number;
    unresolved: number;
    resolved: number;
    avgDaysToResolve: number;
    avgDaysUnresolved: number;
  };
  ruralStats: {
    total: number;
    unresolved: number;
    resolved: number;
    avgDaysToResolve: number;
    avgDaysUnresolved: number;
  };
  categories: CategoryStat[];
  topCriticalSectors: SectorStat[];
  top10Unresolved: Report[];
}
