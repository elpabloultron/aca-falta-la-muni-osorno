import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import {
  Report,
  ReportCategory,
  ReportStatus,
  MunicipalBehaviorStats,
  CategoryStat,
  SectorStat,
} from '@/types/report';
import { CATEGORIAS_REPORTE } from '@/config/osorno';
import { calculateDaysElapsed, isSectorRural } from './geo-utils';

let dbInstance: DatabaseSync | null = null;

export function getDatabase(): DatabaseSync {
  if (dbInstance) return dbInstance;

  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, 'osorno_reports.db');
  const db = new DatabaseSync(dbPath);

  // Optimización WAL y claves foráneas
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      resolved_at TEXT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      sector TEXT NOT NULL,
      is_rural INTEGER NOT NULL DEFAULT 0,
      address_reference TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      image_url TEXT,
      resolved_image_url TEXT,
      author_name TEXT NOT NULL,
      is_anonymous INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL,
      support_count INTEGER NOT NULL DEFAULT 1,
      flags_count INTEGER NOT NULL DEFAULT 0,
      is_hidden INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
    CREATE INDEX IF NOT EXISTS idx_reports_category ON reports(category);
    CREATE INDEX IF NOT EXISTS idx_reports_sector ON reports(sector);
    CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at);

    CREATE TABLE IF NOT EXISTS supports (
      id TEXT PRIMARY KEY,
      report_id TEXT NOT NULL,
      device_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(report_id) REFERENCES reports(id) ON DELETE CASCADE,
      UNIQUE(report_id, device_id)
    );

    CREATE INDEX IF NOT EXISTS idx_supports_report ON supports(report_id);

    CREATE TABLE IF NOT EXISTS moderation_flags (
      id TEXT PRIMARY KEY,
      report_id TEXT NOT NULL,
      device_id TEXT NOT NULL,
      reason TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY(report_id) REFERENCES reports(id) ON DELETE CASCADE,
      UNIQUE(report_id, device_id)
    );

    CREATE INDEX IF NOT EXISTS idx_moderation_flags_report ON moderation_flags(report_id);
  `);

  // Migración defensiva en caso de que la tabla ya existiera sin las nuevas columnas
  try {
    db.exec(`ALTER TABLE reports ADD COLUMN flags_count INTEGER NOT NULL DEFAULT 0;`);
  } catch {}
  try {
    db.exec(`ALTER TABLE reports ADD COLUMN is_hidden INTEGER NOT NULL DEFAULT 0;`);
  } catch {}
  try {
    db.exec(`CREATE INDEX IF NOT EXISTS idx_reports_is_hidden ON reports(is_hidden);`);
  } catch {}

  // Semilla inicial si la base de datos está vacía
  const countRow = db.prepare('SELECT COUNT(*) as count FROM reports').get() as { count: number };
  if (countRow.count === 0) {
    seedDatabase(db);
  }

  dbInstance = db;
  return db;
}

function seedDatabase(db: DatabaseSync): void {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  const seedReports: Omit<Report, 'days_unresolved' | 'days_to_resolve'>[] = [
    // 1. Cancura (Récord histórico rural - 94 días)
    {
      id: 'osorno-rep-cancura-01',
      created_at: new Date(now - 94 * dayMs).toISOString(),
      updated_at: new Date(now - 94 * dayMs).toISOString(),
      title: 'Socavón y pérdida de berma en camino ribereño a Cancura',
      description: 'Tras la crecida del río Rahue el invierno pasado, el camino de acceso vecinal perdió media calzada. Con lluvias es intransitable para transporte escolar y furgones.',
      category: 'calles',
      sector: 'Cancura',
      is_rural: true,
      address_reference: 'Ruta U-55 km 22, acceso Ribera Río Rahue',
      latitude: -40.6650,
      longitude: -73.0230,
      author_name: 'Comité de Adelanto Cancura',
      is_anonymous: false,
      status: 'pendiente',
      support_count: 54,
    },
    // 2. Rahue Bajo (Récord urbano - 82 días)
    {
      id: 'osorno-rep-rahue-01',
      created_at: new Date(now - 82 * dayMs).toISOString(),
      updated_at: new Date(now - 82 * dayMs).toISOString(),
      title: 'Cráter en calzada antes del puente San Pedro',
      description: 'Bache de gran profundidad en pista derecha. Numerosos vehículos han roto llantas y neumáticos. Peligro constante de choque por alcance.',
      category: 'calles',
      sector: 'Rahue Bajo',
      is_rural: false,
      address_reference: 'Av. República con Bellavista',
      latitude: -40.5752,
      longitude: -73.1495,
      author_name: 'Vecino de Rahue',
      is_anonymous: false,
      status: 'pendiente',
      support_count: 67,
    },
    // 3. Forrahue (Rural - 79 días)
    {
      id: 'osorno-rep-forrahue-01',
      created_at: new Date(now - 79 * dayMs).toISOString(),
      updated_at: new Date(now - 79 * dayMs).toISOString(),
      title: 'Peligro de desprendimiento de ladera sobre camino vecinal',
      description: 'Grietas en la ladera amenazan con cortar la única vía de salida de 18 familias campesinas hacia Osorno. Se solicitó maquinaria municipal sin respuesta.',
      category: 'calles',
      sector: 'Forrahue',
      is_rural: true,
      address_reference: 'Camino vecinal Forrahue Arriba, sector La Peña',
      latitude: -40.5360,
      longitude: -73.2670,
      author_name: 'JJ.VV. Forrahue',
      is_anonymous: false,
      status: 'pendiente',
      support_count: 48,
    },
    // 4. Ovejería Bajo (Urbano - 73 días)
    {
      id: 'osorno-rep-ovejeria-01',
      created_at: new Date(now - 73 * dayMs).toISOString(),
      updated_at: new Date(now - 73 * dayMs).toISOString(),
      title: 'Microbasural clandestino con escombros y restos de faena',
      description: 'Camiones descargan escombros y basura en el borde del río. Foco de plagas de roedores y malos olores que llegan a las viviendas.',
      category: 'limpieza',
      sector: 'Ovejería Bajo',
      is_rural: false,
      address_reference: 'Ribera Río Rahue, final calle Martín Ruiz de Gamboa',
      latitude: -40.5898,
      longitude: -73.1375,
      author_name: 'Vecina de Ovejería',
      is_anonymous: true,
      status: 'pendiente',
      support_count: 41,
    },
    // 5. Centro (Urbano - 65 días)
    {
      id: 'osorno-rep-centro-01',
      created_at: new Date(now - 65 * dayMs).toISOString(),
      updated_at: new Date(now - 65 * dayMs).toISOString(),
      title: 'Paseo peatonal a oscuras por tableros vandalizados',
      description: 'Cuatro luminarias continuas sin funcionamiento. Comercio local cierra antes por robos y sensación de inseguridad ciudadana.',
      category: 'iluminacion',
      sector: 'Centro',
      is_rural: false,
      address_reference: 'Calle Eleuterio Ramírez con Prat',
      latitude: -40.5731,
      longitude: -73.1360,
      author_name: 'Comerciante céntrico',
      is_anonymous: false,
      status: 'en_revision',
      support_count: 59,
    },
    // 6. Curaco (Rural - 61 días)
    {
      id: 'osorno-rep-curaco-01',
      created_at: new Date(now - 61 * dayMs).toISOString(),
      updated_at: new Date(now - 61 * dayMs).toISOString(),
      title: 'Puente de madera con tablones quebrados y pernos sueltos',
      description: 'Paso peatonal y vehicular de uso diario con riesgo inminente de colapso para camiones recolectores de leche y furgón de salud.',
      category: 'calles',
      sector: 'Curaco',
      is_rural: true,
      address_reference: 'Puente El Estero, Ruta U-220 km 8',
      latitude: -40.6270,
      longitude: -73.2380,
      author_name: 'Comunidad Curaco',
      is_anonymous: false,
      status: 'pendiente',
      support_count: 36,
    },
    // 7. Pichil (Rural - 58 días)
    {
      id: 'osorno-rep-pichil-01',
      created_at: new Date(now - 58 * dayMs).toISOString(),
      updated_at: new Date(now - 58 * dayMs).toISOString(),
      title: 'Paradero escolar a oscuras al borde de la Ruta 5 Sur',
      description: 'Luminaria solar destruida por temporal. Escolares esperan locomoción a las 06:45 completamente a oscuras en una zona de alta velocidad.',
      category: 'iluminacion',
      sector: 'Pichil',
      is_rural: true,
      address_reference: 'Cruce Pichil, paradero poniente km 935',
      latitude: -40.6560,
      longitude: -73.1810,
      author_name: 'Apoderada Escuela Pichil',
      is_anonymous: false,
      status: 'pendiente',
      support_count: 45,
    },
    // 8. Chuyaca (Urbano - 52 días)
    {
      id: 'osorno-rep-chuyaca-01',
      created_at: new Date(now - 52 * dayMs).toISOString(),
      updated_at: new Date(now - 52 * dayMs).toISOString(),
      title: 'Quema clandestina de plásticos y neumáticos en sitio eriazo',
      description: 'Emisión constante de humo denso tóxico que afecta a personas asmáticas de la villa y del Hogar de Ancianos cercano.',
      category: 'medio_ambiente',
      sector: 'Chuyaca',
      is_rural: false,
      address_reference: 'Costanera Río Damas altura Parque Chuyaca',
      latitude: -40.5790,
      longitude: -73.1110,
      author_name: 'JJ.VV. Chuyaca',
      is_anonymous: false,
      status: 'en_revision',
      support_count: 38,
    },
    // 9. Rahue Alto (Urbano - 45 días)
    {
      id: 'osorno-rep-rahuealto-01',
      created_at: new Date(now - 45 * dayMs).toISOString(),
      updated_at: new Date(now - 45 * dayMs).toISOString(),
      title: 'Disco Pare botado en el suelo en cruce de alta afluencia',
      description: 'Señalética derribada por choque. Han ocurrido tres colisiones menores en este mes por confusión de preferencia de paso.',
      category: 'transito',
      sector: 'Rahue Alto',
      is_rural: false,
      address_reference: 'Calle El Salvador con Real',
      latitude: -40.5845,
      longitude: -73.1720,
      author_name: 'Línea de Colectivos 11',
      is_anonymous: false,
      status: 'pendiente',
      support_count: 53,
    },
    // 10. Polloico (Rural - 42 días)
    {
      id: 'osorno-rep-polloico-01',
      created_at: new Date(now - 42 * dayMs).toISOString(),
      updated_at: new Date(now - 42 * dayMs).toISOString(),
      title: 'Vertedero clandestino de envases de agroquímicos',
      description: 'Botadero irregular al costado de acequia de regadío. Peligro grave de contaminación de napas subterráneas de agua potable rural.',
      category: 'medio_ambiente',
      sector: 'Polloico',
      is_rural: true,
      address_reference: 'Camino Polloico Interior km 4',
      latitude: -40.5190,
      longitude: -73.0800,
      author_name: 'Vecino agricultor',
      is_anonymous: false,
      status: 'pendiente',
      support_count: 33,
    },
    // 11. Francke / Pampa Alegre (Urbano - 38 días)
    {
      id: 'osorno-rep-francke-01',
      created_at: new Date(now - 38 * dayMs).toISOString(),
      updated_at: new Date(now - 38 * dayMs).toISOString(),
      title: 'Sumidero de aguas lluvias atascado genera laguna peatonal',
      description: 'El agua sobrepasa la vereda e ingresa al antejardín de tres viviendas. Se necesita desobstrucción con camión limpiafosas.',
      category: 'aguas',
      sector: 'Francke / Pampa Alegre',
      is_rural: false,
      address_reference: 'Av. Héroes de la Concepción con Los Damascos',
      latitude: -40.5492,
      longitude: -73.1340,
      author_name: 'Comité Vecinal Francke',
      is_anonymous: false,
      status: 'pendiente',
      support_count: 39,
    },
    // 12. Las Lumas (Rural - 34 días)
    {
      id: 'osorno-rep-lumas-01',
      created_at: new Date(now - 34 * dayMs).toISOString(),
      updated_at: new Date(now - 34 * dayMs).toISOString(),
      title: 'Falta de demarcación y tachas reflectantes en curva peligrosa',
      description: 'Tramo de neblina intensa en invierno donde los automovilistas pierden la pista y caen a la zanja.',
      category: 'transito',
      sector: 'Las Lumas',
      is_rural: true,
      address_reference: 'Ruta Internacional 215 km 14',
      latitude: -40.5890,
      longitude: -72.9870,
      author_name: 'JJ.VV. Las Lumas',
      is_anonymous: false,
      status: 'pendiente',
      support_count: 27,
    },
    // 13. Pilauco (Urbano - 28 días)
    {
      id: 'osorno-rep-pilauco-01',
      created_at: new Date(now - 28 * dayMs).toISOString(),
      updated_at: new Date(now - 28 * dayMs).toISOString(),
      title: 'Vereda quebrada sin rampa de acceso para adultos mayores',
      description: 'Baldosas despegadas y desnivel de 15 cm. Provocó la caída de una vecina que debió ser trasladada a urgencias del Hospital Base.',
      category: 'accesibilidad',
      sector: 'Pilauco',
      is_rural: false,
      address_reference: 'Calle Pilauco frente al supermercado',
      latitude: -40.5580,
      longitude: -73.1415,
      author_name: 'Vecino del sector',
      is_anonymous: false,
      status: 'pendiente',
      support_count: 22,
    },
    // 14. Tacamó (Rural - 19 días)
    {
      id: 'osorno-rep-tacamo-01',
      created_at: new Date(now - 19 * dayMs).toISOString(),
      updated_at: new Date(now - 19 * dayMs).toISOString(),
      title: 'Jauría de perros asilvestrados ataca terneros y ciclistas',
      description: 'Perros abandonados en el cruce atacan a peatones que caminan hacia la garita y a pequeños productores ganaderos.',
      category: 'bienestar_animal',
      sector: 'Tacamó',
      is_rural: true,
      address_reference: 'Cruce Tacamó km 6',
      latitude: -40.5860,
      longitude: -73.0470,
      author_name: 'Pequeño agricultor',
      is_anonymous: false,
      status: 'pendiente',
      support_count: 31,
    },
    // 15. CASO RESUELTO 1: Población Kolbe (Demoró 14 días)
    {
      id: 'osorno-rep-kolbe-res-01',
      created_at: new Date(now - 32 * dayMs).toISOString(),
      updated_at: new Date(now - 18 * dayMs).toISOString(),
      resolved_at: new Date(now - 18 * dayMs).toISOString(),
      title: 'Juegos infantiles rotos en Plaza Las Araucarias',
      description: 'Columpios rotos con alambres expuestos y bancos desfondados.',
      category: 'espacios_publicos',
      sector: 'Población Kolbe',
      is_rural: false,
      address_reference: 'Plaza Las Araucarias (Av. Kolbe)',
      latitude: -40.5635,
      longitude: -73.1118,
      author_name: 'Vecina mamá',
      is_anonymous: false,
      status: 'resuelto',
      support_count: 51,
    },
    // 16. CASO RESUELTO 2: Las Quemas (Demoró 22 días)
    {
      id: 'osorno-rep-quemas-res-01',
      created_at: new Date(now - 40 * dayMs).toISOString(),
      updated_at: new Date(now - 18 * dayMs).toISOString(),
      resolved_at: new Date(now - 18 * dayMs).toISOString(),
      title: 'Zanja de drenaje desbordada en acceso a escuela rural',
      description: 'Agua acumulada inundaba la entrada de vehículos de la posta rural.',
      category: 'aguas',
      sector: 'Las Quemas',
      is_rural: true,
      address_reference: 'Camino Las Quemas km 4 frente a Posta',
      latitude: -40.6130,
      longitude: -73.0870,
      author_name: 'Paramédico Posta Las Quemas',
      is_anonymous: false,
      status: 'resuelto',
      support_count: 37,
    },
    // 17. CASO RESUELTO 3: Bellavista (Demoró 9 días)
    {
      id: 'osorno-rep-bellavista-res-01',
      created_at: new Date(now - 25 * dayMs).toISOString(),
      updated_at: new Date(now - 16 * dayMs).toISOString(),
      resolved_at: new Date(now - 16 * dayMs).toISOString(),
      title: 'Árbol añoso con ramas a punto de caer sobre cables eléctricos',
      description: 'Poda de emergencia requerida tras temporal de viento.',
      category: 'espacios_publicos',
      sector: 'Bellavista',
      is_rural: false,
      address_reference: 'Calle Bellavista esquina Valdivia',
      latitude: -40.5895,
      longitude: -73.1555,
      author_name: 'Comité de Emergencia Bellavista',
      is_anonymous: false,
      status: 'resuelto',
      support_count: 42,
    },
  ];

  const insertStmt = db.prepare(`
    INSERT INTO reports (
      id, created_at, updated_at, resolved_at, title, description,
      category, sector, is_rural, address_reference, latitude, longitude,
      image_url, resolved_image_url, author_name, is_anonymous, status, support_count
    ) VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?
    )
  `);

  for (const rep of seedReports) {
    insertStmt.run(
      rep.id,
      rep.created_at,
      rep.updated_at,
      rep.resolved_at || null,
      rep.title,
      rep.description,
      rep.category,
      rep.sector,
      rep.is_rural ? 1 : 0,
      rep.address_reference,
      rep.latitude,
      rep.longitude,
      rep.image_url || null,
      rep.resolved_image_url || null,
      rep.author_name,
      rep.is_anonymous ? 1 : 0,
      rep.status,
      rep.support_count
    );
  }
}

function mapRowToReport(row: any): Report {
  const daysUnresolved =
    row.status !== 'resuelto'
      ? calculateDaysElapsed(row.created_at)
      : calculateDaysElapsed(row.created_at, row.resolved_at || row.updated_at);

  const daysToResolve =
    row.status === 'resuelto'
      ? calculateDaysElapsed(row.created_at, row.resolved_at || row.updated_at)
      : undefined;

  return {
    id: row.id,
    created_at: row.created_at,
    updated_at: row.updated_at,
    resolved_at: row.resolved_at || undefined,
    title: row.title,
    description: row.description,
    category: row.category as ReportCategory,
    sector: row.sector,
    is_rural: Boolean(row.is_rural),
    address_reference: row.address_reference,
    latitude: row.latitude,
    longitude: row.longitude,
    image_url: row.image_url || undefined,
    resolved_image_url: row.resolved_image_url || undefined,
    author_name: row.author_name,
    is_anonymous: Boolean(row.is_anonymous),
    status: row.status as ReportStatus,
    support_count: row.support_count,
    days_unresolved: daysUnresolved,
    days_to_resolve: daysToResolve,
    flags_count: row.flags_count || 0,
    is_hidden: Boolean(row.is_hidden),
  };
}

export function getAllReports(filters?: {
  category?: string;
  status?: string;
  sector?: string;
  isRural?: boolean;
  includeHidden?: boolean;
}): Report[] {
  const db = getDatabase();
  let sql = 'SELECT * FROM reports WHERE 1=1';
  const params: any[] = [];

  if (!filters?.includeHidden) {
    sql += ' AND is_hidden = 0';
  }

  if (filters?.category && filters.category !== 'todas') {
    sql += ' AND category = ?';
    params.push(filters.category);
  }

  if (filters?.status && filters.status !== 'todos') {
    sql += ' AND status = ?';
    params.push(filters.status);
  }

  if (filters?.sector && filters.sector !== 'todos') {
    sql += ' AND sector = ?';
    params.push(filters.sector);
  }

  if (filters?.isRural !== undefined) {
    sql += ' AND is_rural = ?';
    params.push(filters.isRural ? 1 : 0);
  }

  sql += ' ORDER BY created_at DESC';

  const rows = db.prepare(sql).all(...params);
  return rows.map(mapRowToReport);
}

export function getReportById(id: string): Report | null {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM reports WHERE id = ?').get(id);
  if (!row) return null;
  return mapRowToReport(row);
}

export function createReport(
  data: Omit<Report, 'id' | 'created_at' | 'updated_at' | 'support_count' | 'status' | 'days_unresolved' | 'days_to_resolve'>
): Report {
  const db = getDatabase();
  const id = 'rep_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
  const now = new Date().toISOString();
  const isRural = data.is_rural ?? isSectorRural(data.sector);

  db.prepare(`
    INSERT INTO reports (
      id, created_at, updated_at, resolved_at, title, description,
      category, sector, is_rural, address_reference, latitude, longitude,
      image_url, resolved_image_url, author_name, is_anonymous, status, support_count
    ) VALUES (
      ?, ?, ?, NULL, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, NULL, ?, ?, 'pendiente', 1
    )
  `).run(
    id,
    now,
    now,
    data.title.trim(),
    data.description.trim(),
    data.category,
    data.sector,
    isRural ? 1 : 0,
    data.address_reference,
    data.latitude,
    data.longitude,
    data.image_url || null,
    data.author_name,
    data.is_anonymous ? 1 : 0
  );

  return getReportById(id)!;
}

export function toggleSupport(
  reportId: string,
  deviceId: string
): { supported: boolean; newCount: number } {
  const db = getDatabase();

  const existingSupport = db
    .prepare('SELECT id FROM supports WHERE report_id = ? AND device_id = ?')
    .get(reportId, deviceId);

  let supported = false;

  if (existingSupport) {
    // Quitar apoyo
    db.prepare('DELETE FROM supports WHERE report_id = ? AND device_id = ?').run(
      reportId,
      deviceId
    );
    db.prepare('UPDATE reports SET support_count = MAX(0, support_count - 1), updated_at = ? WHERE id = ?').run(
      new Date().toISOString(),
      reportId
    );
    supported = false;
  } else {
    // Dar apoyo
    const supportId = 'sup_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
    db.prepare('INSERT INTO supports (id, report_id, device_id, created_at) VALUES (?, ?, ?, ?)').run(
      supportId,
      reportId,
      deviceId,
      new Date().toISOString()
    );
    db.prepare('UPDATE reports SET support_count = support_count + 1, updated_at = ? WHERE id = ?').run(
      new Date().toISOString(),
      reportId
    );
    supported = true;
  }

  const updatedReport = db.prepare('SELECT support_count FROM reports WHERE id = ?').get(reportId) as {
    support_count: number;
  };

  return { supported, newCount: updatedReport ? updatedReport.support_count : 0 };
}

export function resolveReport(reportId: string, resolvedImageUrl?: string): Report | null {
  const db = getDatabase();
  const now = new Date().toISOString();

  db.prepare(`
    UPDATE reports 
    SET status = 'resuelto', 
        resolved_at = ?, 
        resolved_image_url = COALESCE(?, resolved_image_url), 
        updated_at = ?
    WHERE id = ?
  `).run(now, resolvedImageUrl || null, now, reportId);

  return getReportById(reportId);
}

/**
 * Obtiene las 10 denuncias activas con mayor tiempo sin respuesta municipal.
 */
export function getTop10UnresolvedReports(): Report[] {
  const db = getDatabase();
  const rows = db
    .prepare(`
      SELECT * FROM reports 
      WHERE status != 'resuelto' AND is_hidden = 0
      ORDER BY created_at ASC 
      LIMIT 10
    `)
    .all();

  return rows.map(mapRowToReport);
}

/**
 * Registra una denuncia comunitaria por publicación inapropiada o spam.
 * Si acumula 3 o más denuncias independientes, se oculta automáticamente (is_hidden = 1).
 */
export function flagReport(
  reportId: string,
  deviceId: string,
  reason?: string
): { flagged: boolean; flagsCount: number; isHidden: boolean } {
  const db = getDatabase();

  const existingFlag = db
    .prepare('SELECT id FROM moderation_flags WHERE report_id = ? AND device_id = ?')
    .get(reportId, deviceId);

  if (existingFlag) {
    const currentRep = db
      .prepare('SELECT flags_count, is_hidden FROM reports WHERE id = ?')
      .get(reportId) as { flags_count: number; is_hidden: number } | undefined;

    return {
      flagged: false,
      flagsCount: currentRep?.flags_count || 0,
      isHidden: Boolean(currentRep?.is_hidden),
    };
  }

  const flagId = 'flg_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO moderation_flags (id, report_id, device_id, reason, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(flagId, reportId, deviceId, reason || 'Contenido inadecuado o spam', now);

  db.prepare(`
    UPDATE reports 
    SET flags_count = flags_count + 1,
        is_hidden = CASE WHEN flags_count + 1 >= 3 THEN 1 ELSE is_hidden END,
        updated_at = ?
    WHERE id = ?
  `).run(now, reportId);

  const updatedRep = db
    .prepare('SELECT flags_count, is_hidden FROM reports WHERE id = ?')
    .get(reportId) as { flags_count: number; is_hidden: number } | undefined;

  return {
    flagged: true,
    flagsCount: updatedRep?.flags_count || 0,
    isHidden: Boolean(updatedRep?.is_hidden),
  };
}

/**
 * Genera el estudio completo de comportamiento y auditoría municipal para Osorno.
 */
export function getMunicipalBehaviorStats(): MunicipalBehaviorStats {
  const allReports = getAllReports();
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

  // Promedio comunal
  const communalDaysToResolve = resolvedReports.map((r) => r.days_to_resolve || 0);
  const communalDaysUnresolved = activeReports.map((r) => r.days_unresolved || 0);

  // Estadísticas por categoría
  const categoryStatsMap = new Map<ReportCategory, CategoryStat>();
  (Object.keys(CATEGORIAS_REPORTE) as ReportCategory[]).forEach((catKey) => {
    const catReports = allReports.filter((r) => r.category === catKey);
    const catActive = catReports.filter((r) => r.status !== 'resuelto');
    const catResolved = catReports.filter((r) => r.status === 'resuelto');

    categoryStatsMap.set(catKey, {
      category: catKey,
      name: CATEGORIAS_REPORTE[catKey].name,
      total: catReports.length,
      unresolved: catActive.length,
      resolved: catResolved.length,
      avgDaysUnresolved: calcAvg(catActive.map((r) => r.days_unresolved || 0)),
      avgDaysToResolve: calcAvg(catResolved.map((r) => r.days_to_resolve || 0)),
    });
  });

  // Estadísticas por sector
  const sectorMap = new Map<string, { isRural: boolean; reports: Report[] }>();
  allReports.forEach((r) => {
    if (!sectorMap.has(r.sector)) {
      sectorMap.set(r.sector, { isRural: r.is_rural, reports: [] });
    }
    sectorMap.get(r.sector)!.reports.push(r);
  });

  const sectorStats: SectorStat[] = Array.from(sectorMap.entries()).map(([sector, data]) => {
    const act = data.reports.filter((r) => r.status !== 'resuelto');
    const res = data.reports.filter((r) => r.status === 'resuelto');
    return {
      sector,
      isRural: data.isRural,
      total: data.reports.length,
      unresolved: act.length,
      resolved: res.length,
      avgDaysUnresolved: calcAvg(act.map((r) => r.days_unresolved || 0)),
      avgDaysToResolve: calcAvg(res.map((r) => r.days_to_resolve || 0)),
    };
  }).sort((a, b) => b.avgDaysUnresolved - a.avgDaysUnresolved);

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
      avgDaysUnresolved: calcAvg(urbanActive.map((r) => r.days_unresolved || 0)),
    },
    ruralStats: {
      total: ruralReports.length,
      unresolved: ruralActive.length,
      resolved: ruralResolved.length,
      avgDaysToResolve: calcAvg(ruralResolved.map((r) => r.days_to_resolve || 0)),
      avgDaysUnresolved: calcAvg(ruralActive.map((r) => r.days_unresolved || 0)),
    },
    categories: Array.from(categoryStatsMap.values()),
    topCriticalSectors: sectorStats,
    top10Unresolved: getTop10UnresolvedReports(),
  };
}
