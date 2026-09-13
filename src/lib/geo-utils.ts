import { OSORNO_BOUNDS, SECTORES_OSORNO } from '@/config/osorno';
import { Report, ReportCategory } from '@/types/report';

/**
 * Fórmula del semiverseno (Haversine) para cálculo de distancias geodésicas en metros.
 * Implementación en TypeScript puro sin librerías pesadas.
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Radio medio de la Tierra en metros
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Detector cívico de duplicados (Estilo FixMyStreet).
 * Busca si existe ya un reporte de la misma categoría a menos de N metros (por defecto 35 m).
 */
export function findNearbyDuplicate(
  newLat: number,
  newLng: number,
  category: ReportCategory,
  existingReports: Report[],
  thresholdMeters = 35
): { report: Report; distance: number } | null {
  for (const rep of existingReports) {
    if (rep.category === category && rep.status !== 'resuelto') {
      const dist = calculateDistanceMeters(newLat, newLng, rep.latitude, rep.longitude);
      if (dist <= thresholdMeters) {
        return { report: rep, distance: dist };
      }
    }
  }
  return null;
}

/**
 * Valida si un par de coordenadas se sitúa dentro de los límites comunales de Osorno.
 */
export function isWithinOsornoBounds(lat: number, lng: number): boolean {
  const [sw, ne] = OSORNO_BOUNDS;
  return lat >= sw[0] && lat <= ne[0] && lng >= sw[1] && lng <= ne[1];
}

/**
 * Centros referenciales de sectores de Osorno (urbanos y rurales) para asignación aproximada y zoom en mapa.
 */
export const SECTOR_CENTROIDS: Record<string, [number, number]> = {
  // Radio Urbano
  'Centro': [-40.5739, -73.1335],
  'Rahue Bajo': [-40.5745, -73.1510],
  'Rahue Alto': [-40.5840, -73.1700],
  'Ovejería Bajo': [-40.5890, -73.1360],
  'Ovejería Alto': [-40.5980, -73.1410],
  'Francke / Pampa Alegre': [-40.5480, -73.1350],
  'Población Kolbe': [-40.5620, -73.1110],
  'Pilauco': [-40.5570, -73.1420],
  'Chuyaca': [-40.5780, -73.1120],
  'Bellavista': [-40.5890, -73.1550],
  'Quinto Centenario': [-40.5810, -73.1820],

  // Sectores Rurales y Periurbanos
  'Cancura': [-40.6625, -73.0210],
  'Pichil': [-40.6550, -73.1800],
  'Tacamó': [-40.5850, -73.0450],
  'Las Quemas': [-40.6120, -73.0850],
  'Forrahue': [-40.5350, -73.2650],
  'Polloico': [-40.5180, -73.0780],
  'Las Lumas': [-40.5880, -72.9850],
  'Curaco': [-40.6250, -73.2350],
  'Baquedano': [-40.5650, -73.1950],
  'Trumao / Mulpulmo': [-40.5200, -73.3100],
};

/**
 * Nivel de zoom óptimo según extensión territorial del sector.
 */
export const SECTOR_ZOOMS: Record<string, number> = {
  'Centro': 15.5,
  'Rahue Bajo': 15,
  'Rahue Alto': 14.5,
  'Ovejería Bajo': 15,
  'Ovejería Alto': 15,
  'Francke / Pampa Alegre': 14.5,
  'Población Kolbe': 15,
  'Pilauco': 15,
  'Chuyaca': 15,
  'Bellavista': 15,
  'Quinto Centenario': 15,

  'Cancura': 14,
  'Pichil': 13.5,
  'Tacamó': 13.5,
  'Las Quemas': 14,
  'Forrahue': 13.5,
  'Polloico': 13.5,
  'Las Lumas': 13.5,
  'Curaco': 13.5,
  'Baquedano': 14,
  'Trumao / Mulpulmo': 13,
};

const RURAL_SET = new Set([
  'Cancura',
  'Pichil',
  'Tacamó',
  'Las Quemas',
  'Forrahue',
  'Polloico',
  'Las Lumas',
  'Curaco',
  'Baquedano',
  'Trumao / Mulpulmo',
]);

export function isSectorRural(sector: string): boolean {
  return RURAL_SET.has(sector);
}

/**
 * Calcula días transcurridos entre dos fechas ISO o desde una fecha hasta hoy.
 */
export function calculateDaysElapsed(fromDateStr: string, toDateStr?: string): number {
  try {
    const from = new Date(fromDateStr).getTime();
    const to = toDateStr ? new Date(toDateStr).getTime() : Date.now();
    const diffMs = Math.max(0, to - from);
    return Math.floor(diffMs / (24 * 60 * 60 * 1000));
  } catch {
    return 0;
  }
}

/**
 * Formatea días transcurridos para visualización comunitaria.
 */
export function formatElapsedDays(days: number): string {
  if (days <= 0) return 'Hoy';
  if (days === 1) return '1 día sin solución';
  return `${days} días sin solución`;
}

/**
 * Formatea tiempo que demoró la reparación municipal o vecinal.
 */
export function formatResolvedDays(days: number): string {
  if (days <= 0) return 'Mismo día';
  if (days === 1) return 'Solucionado en 1 día';
  return `Solucionado en ${days} días`;
}

/**
 * Estima el sector barrial de Osorno más cercano por proximidad euclidiana.
 */
export function estimateOsornoSector(lat: number, lng: number): string {
  let closestSector = 'Centro';
  let minDistance = Infinity;

  for (const [sector, coords] of Object.entries(SECTOR_CENTROIDS)) {
    const dist = calculateDistanceMeters(lat, lng, coords[0], coords[1]);
    if (dist < minDistance) {
      minDistance = dist;
      closestSector = sector;
    }
  }

  return closestSector;
}

/**
 * Geocodificación inversa ligera con OSM Nominatim y respaldo a sector local de Osorno.
 */
export async function reverseGeocodeOsorno(
  lat: number,
  lng: number
): Promise<{ address: string; sector: string }> {
  const estimatedSector = estimateOsornoSector(lat, lng);

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'es',
        },
      }
    );

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const road = addr.road || addr.pedestrian || addr.street;
      const houseNumber = addr.house_number ? ` N° ${addr.house_number}` : '';
      const suburb = addr.suburb || addr.neighbourhood || estimatedSector;

      if (road) {
        return {
          address: `${road}${houseNumber}`,
          sector: suburb,
        };
      }
    }
  } catch (err) {
    // Si falla la red o hay rate-limit de OSM, degradar elegantemente
  }

  return {
    address: `Referencia sector ${estimatedSector}`,
    sector: estimatedSector,
  };
}
