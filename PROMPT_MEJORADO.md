# Prompt Maestro: Acá Falta la Muni — Osorno (Chile)

> **Rol del agente:** Desarrollador *Full-Stack Senior* y Diseñador *UX/UI* de nivel *Staff* especializado en *Civic Tech*, interfaces geoespaciales y arquitecturas ágiles.  
> **Filosofía rectora:** Aplicación estricta de la escala de simplicidad de **Ponytail** (*anti-overengineering* y *YAGNI* radical), el sistema de diseño y especificación de **OpenDesign** (inspirado en las *Web Interface Guidelines* de Vercel), la lógica cívica comunitaria de **FixMyStreet** (*mySociety*) y la ingeniería inversa funcional de **«Acá falta la Muni»** de Pía Cavana.

---

## 1. Contexto y Misión del Proyecto

Tu misión es concebir y programar el **MVP** (*Minimum Viable Product*) de **«Acá Falta la Muni — Osorno»**, una plataforma comunitaria y colaborativa de reporte ciudadano en tiempo real, adaptada al entorno urbano y barrial de la comuna de **Osorno**, Región de Los Lagos, Chile.

La aplicación permite a las vecinas y vecinos documentar, geolocalizar, viralizar y fiscalizar el estado de las problemáticas urbanas (luminarias rotas, baches, microbasurales, fallas en sumideros y abandono de espacios públicos), generando presión ciudadana transparente sobre las autoridades municipales y los servicios públicos locales.

---

## 2. Principios de Ingeniería y Diseño Aplicados

### A. Filosofía Ponytail (*Anti-Overengineering & The Laziness Ladder*)
1. **Regla de oro:** El mejor código es el que no se escribe. Queda prohibida la arquitectura especulativa: sin capas innecesarias de repositorios, sin patrones factoría para una sola entidad, sin microservicios y sin librerías pesadas para tareas que resuelve la plataforma nativa.
2. **Uso de capacidades nativas del navegador:**
   - Compresión de imágenes del lado del cliente mediante la *API Canvas* nativa (`canvas.toBlob('image/webp', 0.8)`), evitando dependencias pesadas de compresión en el *bundle*.
   - Captura directa de cámara con `<input type="file" accept="image/*" capture="environment">`.
   - Geolocalización con `navigator.geolocation` acompañada de manejo explícito de permisos y degradación elegante.
3. **Persistencia pragmática:** Cliente directo de base de datos (PostgreSQL con PostGIS o Supabase) con consultas indexadas mediante operadores espaciales nativos (`ST_DWithin`, `ST_Point`), prescindiendo de abstracciones redundantes.
4. **Estado local y URL:** Sincronización de filtros y coordenadas directamente en la URL (`URLSearchParams`), garantizando enlaces compartibles sin dependencias de gestores de estado globales pesados.

### B. Sistema de Diseño OpenDesign & *Web Interface Guidelines*
1. **Identidad visual táctica y urbana:**
   - **Lienzo de fondo:** Negro azabache táctico (`#141414` / `#0D0D0D`) con superficies de tarjeta en gris carbón (`#1C1C1E`).
   - **Color de acento cívico:** Amarillo vial de alta visibilidad (`#F4CA19`), idéntico a la identidad original de «Acá falta la Muni».
   - **Tipografía:** Jerarquía con contrastes marcados: titulares en tipografía geométrica contundente (*Cabinet Grotesk* o *Clash Grotesk*) y cuerpo de texto en sans-serif moderna legible (*Inter* o tipografía del sistema).
2. **Interfaz centrada en el mapa (*Map-Centric HUD*):**
   - Lienzo a pantalla completa fija (`h-[100dvh] w-full overflow-hidden`).
   - Controles flotantes en estilo *HUD* con efecto de desenfoque translúcido (*glassmorphism*: `backdrop-blur-md bg-black/85 border border-white/10`).
   - Adaptación móvil de primer orden: paneles inferiores en cajón deslizable (*bottom drawer / sheet* con tirador táctil `drag-handle`), accesibles con una sola mano y con áreas de toque mínimas de 44 × 44 píxeles.

### C. Lecciones Cívicas de FixMyStreet y Pía Cavana
1. **Modo dual de visualización en el mapa:** Alternancia instantánea entre marcadores agrupados (*clustering*) y capa de calor de densidad urbana (*Heatmap* con gradiente ponderado de reclamos).
2. **Prevención de duplicados por proximidad:** Al marcar un punto, advertir al vecino si ya existe un reporte similar a menos de 35 metros («¿Te refieres a este bache ya reportado?»), promoviendo la adhesión comunitaria en lugar del spam de pines idénticos.
3. **Delimitación comunal estricta:** Restricción geoespacial automática mediante polígono GeoJSON para impedir reportes fuera de los límites de Osorno.
4. **Apoyo cívico y viralización:** Contador de adhesión «A mí también me afecta» (+1) con actualización optimista, junto a generación de tarjetas OpenGraph dinámicas para difusión en grupos de WhatsApp de juntas de vecinos.

---

## 3. Especificación Técnica y Geográfica de Osorno

### Coordenadas y Configuración Cartográfica
- **Centro comunal:** Latitud `-40,5739`, Longitud `-73,1335` (Plaza de Armas de Osorno).
- **Límites geográficos aproximados (*Bounding Box*):**
  - Suroeste: `[-40,6400, -73,2200]` (Rahue Alto / Ovejería Bajo).
  - Noreste: `[-40,5100, -73,0500]` (Pilauco / Francke / Kolbe / Las Quemas).
- **Zoom inicial:** Nivel `13` en escritorio, nivel `14` en dispositivos móviles.
- **Barrios y sectores reconocidos:**
  - Centro
  - Rahue Bajo y Rahue Alto
  - Ovejería (Bajo y Alto)
  - Francke y Pampa Alegre
  - Población Kolbe
  - Pilauco
  - Chuyaca
  - Bellavista y Quinto Centenario

### Categorías de Reclamo Ciudadano (Taxonomía Urbana Oficial)
Cada categoría posee un color semántico distintivo, ícono vectorial y descripción clara:
1. **Calles y pavimentación:** Baches, veredas destruidas, tapas de alcantarilla hundidas o levantadas.
2. **Iluminación pública:** Luminarias apagadas, cables cortados, sectores a oscuras.
3. **Limpieza y microbasurales:** Residuos clandestinos, escombros en la vía pública, contenedores colapsados.
4. **Aguas y drenaje:** Sumideros tapados, inundaciones en calzadas durante temporales, fugas de agua.
5. **Espacios públicos y áreas verdes:** Plazas abandonadas, juegos infantiles rotos, pasto sin mantención.
6. **Accesibilidad universal:** Veredas sin rebaje, rampas obstruidas, barreras para personas con movilidad reducida.
7. **Tránsito y señalética:** Semáforos apagados o desincronizados, discos Pare derribados, demarcación borrada.
8. **Bienestar animal:** Animales abandonados en riesgo, denuncias por tenencia irresponsable.
9. **Medio ambiente:** Humos visibles de combustión contaminante, microquemas ilegales, ruidos molestos.
10. **Otros problemas comunales:** Situaciones no cubiertas por las categorías anteriores.

---

## 4. Requisitos Funcionales Detallados

### Vista Principal (Mapa Interactivo y Filtros)
- **Capa base:** CartoDB Positron / Dark Matter o Stadia Alidade Smooth (con atribución a OpenStreetMap).
- **Selector de modo:** Pestaña flotante para alternar entre:
  1. *Pines agrupados* (con número de densidad y color de categoría predominante).
  2. *Mapa de calor* (densidad de puntos calientes de reclamos desatendidos).
  3. *Vista de lista / feed cronológico* (tarjetas informativas con fotos).
- **Filtros rápidos (Chips flotantes):**
  - Por categoría (con ícono y conteo).
  - Por estado: `Pendiente` (rojo), `En revisión ciudadana` (amarillo), `Resuelto` (verde).
  - Por sector de Osorno.
  - Por orden: «Más recientes» vs. «Más apoyados».

### Ficha Detallada del Reporte (*Popup* / Modal / Permalinks)
- Ruta permalink amigable: `/reporte/:id`.
- Título conciso, fotografía con ampliación *lightbox*, categoría con placa de color, fecha en formato relativo chileno («hace 2 días», «12 de septiembre de 2026»), dirección referencial y sector.
- **Botón de apoyo comunitario:** «A mí también me afecta» (con prevención de voto múltiple mediante `localStorage`).
- **Botón de compartir:** Generación de enlace directo y botón de «Compartir en WhatsApp» con mensaje predefinido.
- **Módulo de resolución comunitaria:** Posibilidad de subir una foto de «Problema resuelto» si la municipalidad o los vecinos repararon la situación.

### Flujo de Creación de Reportes (*Bottom Sheet* Móvil / Modal Escritorio)
1. **Paso 1: Localización:** Marcado en el mapa arrastrando el pin, haciendo clic o pulsando «Usar mi ubicación GPS actual».
   - Validación: Si el punto cae fuera del polígono comunal de Osorno, mostrar alerta explicativa.
   - Geocodificación inversa ligera (Nominatim de OSM) para autocompletar la calle y altura referencial.
2. **Paso 2: Categoría y detalle:**
   - Selección de categoría mediante cuadrícula de botones visuales grandes.
   - Título breve descriptivo (hasta 80 caracteres).
   - Detalle del problema (textarea).
3. **Paso 3: Evidencia fotográfica:**
   - Carga de fotografía comprimida a WebP en el navegador (máximo 800 KB).
   - Vista previa inmediata con botón de eliminación.
4. **Paso 4: Identificación y seguridad:**
   - Nombre o alias del vecino (casilla opcional «Publicar como anónimo»).
   - Campo invisible anti-spam (*honeypot*) para atrapar bots automáticos sin degradar la experiencia humana con captchas molestos.

### Panel Flotante de Métricas Comunitarias (*Stats HUD*)
- Contador total de reclamos activos.
- Porcentaje de resolución comunitaria o municipal.
- Sector con mayor criticidad actual (ej. «Sector con más reportes: Rahue Alto»).

---

## 5. Modelo de Datos Relacional (PostgreSQL / PostGIS / Supabase)

```sql
-- Extensión espacial
create extension if not exists postgis;

-- Enumerador de estados y categorías
create type report_status as enum ('pendiente', 'en_revision', 'resuelto');

-- Tabla principal de reportes ciudadanos
create table reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  title text not null check (char_length(title) between 5 and 120),
  description text not null check (char_length(description) <= 1500),
  category text not null,
  sector text,
  address_reference text,
  latitude double precision not null check (latitude between -41.0 and -40.0),
  longitude double precision not null check (longitude between -74.0 and -72.0),
  geom geometry(Point, 4326) generated always as (st_setsrid(st_makepoint(longitude, latitude), 4326)) stored,
  image_url text,
  resolved_image_url text,
  author_name text default 'Vecina/o de Osorno',
  is_anonymous boolean default true not null,
  status report_status default 'pendiente' not null,
  support_count integer default 0 not null check (support_count >= 0)
);

-- Tabla de adhesiones ciudadanas (+1) para evitar duplicación
create table report_supports (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references reports(id) on delete cascade not null,
  device_fingerprint text not null,
  created_at timestamp with time zone default now() not null,
  unique(report_id, device_fingerprint)
);

-- Índices geoespaciales y de rendimiento
create index idx_reports_geom on reports using gist(geom);
create index idx_reports_category on reports(category);
create index idx_reports_status on reports(status);
create index idx_reports_created_at on reports(created_at desc);
```

---

## 6. Reglas de Entrega y Calidad
1. **Entregar código funcional completo:** Proporcionar la estructura de archivos, componentes modulares claros y sin marcadores de posición (*placeholders*) vacíos.
2. **Rigor ortotipográfico RAE/ASALE:** En todas las etiquetas en español, textos de ayuda y botones, emplear comillas angulares (`« »`), signos dobles obligatorios (`¿ ?`, `¡ !`), raya de inciso pegada (`—`), coma decimal chilena y mayúsculas normativas en sigla (`JJ.VV.`, `OSM`).
3. **Cero dependencias innecesarias:** No importar librerías de más de 100 KB si una función de 20 líneas en TypeScript o el navegador nativo lo resuelven.
