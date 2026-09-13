import { CategoryInfo, ReportCategory } from '@/types/report';

export const OSORNO_CENTER = {
  lat: -40.5739,
  lng: -73.1335,
  zoom: 12,
};

// Límites geográficos totales que abarcan toda la comuna de Osorno (urbano + rural, 951 km²)
export const OSORNO_BOUNDS: [[number, number], [number, number]] = [
  [-40.7500, -73.4500], // Suroeste (Rumbo a Curaco / Pichil / Río Negro)
  [-40.4000, -72.8500], // Noreste (Rumbo a Polloico / Las Lumas / Puyehue)
];

export const SECTORES_URBANOS = [
  'Centro',
  'Rahue Alto',
  'Rahue Bajo',
  'Ovejería Bajo',
  'Ovejería Alto',
  'Francke / Pampa Alegre',
  'Población Kolbe',
  'Pilauco',
  'Chuyaca',
  'Bellavista',
  'Quinto Centenario',
] as const;

export const SECTORES_RURALES = [
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
] as const;

export const SECTORES_OSORNO = [
  ...SECTORES_URBANOS,
  ...SECTORES_RURALES,
] as const;

export const CATEGORIAS_REPORTE: Record<ReportCategory, CategoryInfo> = {
  calles: {
    id: 'calles',
    name: 'Calles y pavimentación',
    description: 'Baches, calzadas rotas, veredas destruidas y tapas de alcantarilla levantadas.',
    color: '#F59E0B',
    iconName: 'Construction',
  },
  iluminacion: {
    id: 'iluminacion',
    name: 'Iluminación pública',
    description: 'Luminarias apagadas, postes chocados o sectores a oscuras.',
    color: '#EAB308',
    iconName: 'Lightbulb',
  },
  limpieza: {
    id: 'limpieza',
    name: 'Limpieza y microbasurales',
    description: 'Residuos clandestinos, escombros en la vía pública y contenedores colapsados.',
    color: '#EF4444',
    iconName: 'Trash2',
  },
  aguas: {
    id: 'aguas',
    name: 'Aguas y drenaje',
    description: 'Sumideros tapados, inundaciones de calzada tras lluvias y fugas de agua potable.',
    color: '#06B6D4',
    iconName: 'Droplets',
  },
  espacios_publicos: {
    id: 'espacios_publicos',
    name: 'Espacios públicos y áreas verdes',
    description: 'Plazas descuidadas, pasto sin cortar, bancos o juegos infantiles dañados.',
    color: '#10B981',
    iconName: 'Trees',
  },
  accesibilidad: {
    id: 'accesibilidad',
    name: 'Accesibilidad universal',
    description: 'Rampas peatonales bloqueadas, veredas intransitables para sillas de ruedas o coches.',
    color: '#3B82F6',
    iconName: 'Accessibility',
  },
  transito: {
    id: 'transito',
    name: 'Tránsito y señalética',
    description: 'Semáforos descompuestos, discos Pare derribados o falta de demarcación.',
    color: '#F97316',
    iconName: 'AlertTriangle',
  },
  bienestar_animal: {
    id: 'bienestar_animal',
    name: 'Bienestar animal',
    description: 'Animales abandonados, jaurías con riesgo para peatones o casos de maltrato.',
    color: '#8B5CF6',
    iconName: 'Dog',
  },
  medio_ambiente: {
    id: 'medio_ambiente',
    name: 'Medio ambiente',
    description: 'Humo denso por leña húmeda, microquemas ilegales y descargas a los ríos Rahue o Damas.',
    color: '#84CC16',
    iconName: 'Flame',
  },
  otros: {
    id: 'otros',
    name: 'Otros problemas comunales',
    description: 'Cualquier otra problemática urbana no comprendida en las categorías anteriores.',
    color: '#6B7280',
    iconName: 'HelpCircle',
  },
};

// Polígono comunal representativo de la totalidad de la comuna de Osorno (951 km²)
export const OSORNO_POLYGON_GEOJSON = {
  type: 'Feature' as const,
  properties: {
    name: 'Comuna de Osorno (Límites Comunales)',
  },
  geometry: {
    type: 'Polygon' as const,
    coordinates: [
      [
        [-73.3400, -40.5000], // Norponiente (Trumao / Forrahue)
        [-73.1500, -40.4600], // Norte (Río Rahue norte)
        [-73.0600, -40.4800], // Nororiente (Polloico / Ruta 5 Norte)
        [-72.9500, -40.5500], // Oriente (Las Lumas / Ruta 215)
        [-72.9800, -40.6200], // Suroriente (Tacamó / Las Quemas)
        [-73.0150, -40.6950], // Sureste (Cancura / Ruta U-55 hacia Puerto Octay)
        [-73.1950, -40.6800], // Sur (Pichil / Ruta 5 Sur)
        [-73.2900, -40.6400], // Surponiente (Curaco)
        [-73.3500, -40.5600], // Poniente (Forrahue / Cordillera de la Costa)
        [-73.3400, -40.5000], // Cierre
      ],
    ],
  },
};
