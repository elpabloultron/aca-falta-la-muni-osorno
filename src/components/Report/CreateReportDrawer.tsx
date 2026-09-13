'use client';

import React, { useState, useEffect } from 'react';
import { Report, ReportCategory } from '@/types/report';
import { CATEGORIAS_REPORTE, OSORNO_CENTER, SECTORES_OSORNO, SECTORES_URBANOS, SECTORES_RURALES } from '@/config/osorno';
import {
  X,
  MapPin,
  Camera,
  AlertTriangle,
  Check,
  Compass,
  UploadCloud,
  ChevronRight,
  Info,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { CategoryIcon } from '../CategoryIcon';
import { compressImage, uploadImageToServer } from '@/lib/compression';
import {
  findNearbyDuplicate,
  isWithinOsornoBounds,
  reverseGeocodeOsorno,
  isSectorRural,
  SECTOR_CENTROIDS,
} from '@/lib/geo-utils';

interface CreateReportDrawerProps {
  initialCoords: { lat: number; lng: number } | null;
  existingReports: Report[];
  onClose: () => void;
  onSubmitReport: (newReportData: {
    title: string;
    description: string;
    category: ReportCategory;
    sector: string;
    is_rural?: boolean;
    address_reference: string;
    latitude: number;
    longitude: number;
    image_url?: string;
    author_name: string;
    is_anonymous: boolean;
  }) => void;
  onSelectExistingReport: (report: Report) => void;
}

export const CreateReportDrawer: React.FC<CreateReportDrawerProps> = ({
  initialCoords,
  existingReports,
  onClose,
  onSubmitReport,
  onSelectExistingReport,
}) => {
  const [coords, setCoords] = useState<{ lat: number; lng: number }>(
    initialCoords || { lat: OSORNO_CENTER.lat, lng: OSORNO_CENTER.lng }
  );
  const [category, setCategory] = useState<ReportCategory>('calles');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sector, setSector] = useState('Rahue Bajo');
  const [addressReference, setAddressReference] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [authorName, setAuthorName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Control anti-spam mediante captcha aritmético accesible
  const [captchaA, setCaptchaA] = useState(3);
  const [captchaB, setCaptchaB] = useState(4);
  const [captchaInput, setCaptchaInput] = useState('');

  const refreshCaptcha = () => {
    const a = Math.floor(Math.random() * 8) + 2; // 2..9
    const b = Math.floor(Math.random() * 8) + 1; // 1..8
    setCaptchaA(a);
    setCaptchaB(b);
    setCaptchaInput('');
  };

  useEffect(() => {
    refreshCaptcha();
  }, []);

  const [isLocating, setIsLocating] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [nearbyDuplicate, setNearbyDuplicate] = useState<{
    report: Report;
    distance: number;
  } | null>(null);

  // Actualizar coordenadas y realizar geocodificación inversa
  useEffect(() => {
    if (initialCoords) {
      setCoords(initialCoords);
      reverseGeocodeOsorno(initialCoords.lat, initialCoords.lng).then((res) => {
        setAddressReference(res.address);
        setSector(res.sector);
      });
    }
  }, [initialCoords]);

  // Verificar duplicados cercanos cada vez que cambian las coordenadas o la categoría
  useEffect(() => {
    const duplicate = findNearbyDuplicate(coords.lat, coords.lng, category, existingReports, 40);
    setNearbyDuplicate(duplicate);
  }, [coords, category, existingReports]);

  // Botón "Usar mi ubicación GPS actual"
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setFormError('Tu navegador no soporta geolocalización.');
      return;
    }

    setIsLocating(true);
    setFormError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        if (!isWithinOsornoBounds(lat, lng)) {
          setFormError('Tu ubicación GPS detectada está fuera del radio comunal de Osorno. Se utilizará el sector seleccionado.');
          setIsLocating(false);
          return;
        }

        setCoords({ lat, lng });
        const res = await reverseGeocodeOsorno(lat, lng);
        setAddressReference(res.address);
        setSector(res.sector);
        setIsLocating(false);
      },
      (err) => {
        setFormError('No pudimos acceder a tu ubicación GPS (' + err.message + '). Puedes elegir el sector o calle manualmente.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Compresión nativa con Canvas WebP de fotografía
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      setFormError(null);
      const compressed = await compressImage(file, 960, 0.72);
      const serverUrl = await uploadImageToServer(compressed);
      setImageUrl(serverUrl);
    } catch (err: any) {
      setFormError(err.message || 'Error al procesar la fotografía.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFormError(null);

    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setFormError('Por favor ingresa un título descriptivo para la denuncia.');
      return;
    }

    const cleanDesc = description.trim();
    if (!cleanDesc) {
      setFormError('Por favor describe brevemente la problemática o sus consecuencias.');
      return;
    }

    const expected = captchaA + captchaB;
    if (parseInt(captchaInput.trim(), 10) !== expected) {
      setFormError(`Control anti-spam: la suma de ${captchaA} + ${captchaB} no es correcta. Por favor resuelve la suma para publicar.`);
      refreshCaptcha();
      return;
    }

    let finalCoords = coords;
    // Si las coordenadas están fuera de Osorno, reasignar al centroide del sector para asegurar validez
    if (!isWithinOsornoBounds(finalCoords.lat, finalCoords.lng)) {
      const fallback = SECTOR_CENTROIDS[sector] || [OSORNO_CENTER.lat, OSORNO_CENTER.lng];
      finalCoords = { lat: fallback[0], lng: fallback[1] };
    }

    setIsSubmitting(true);
    try {
      await onSubmitReport({
        title: cleanTitle,
        description: cleanDesc,
        category,
        sector: sector || 'Centro',
        is_rural: isSectorRural(sector),
        address_reference: addressReference.trim() || 'Sector ' + sector,
        latitude: finalCoords.lat,
        longitude: finalCoords.lng,
        image_url: imageUrl || undefined,
        author_name: isAnonymous ? 'Vecino de Osorno (Anónimo)' : authorName.trim() || 'Vecino de Osorno',
        is_anonymous: isAnonymous,
      });
    } catch (err: any) {
      setFormError(err.message || 'Error al registrar la denuncia. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#18181A] border border-white/10 w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Tirador táctil móvil */}
        <div className="w-12 h-1.5 bg-neutral-700 rounded-full mx-auto mt-3 sm:hidden" />

        {/* Cabecera del formulario */}
        <div className="p-5 pb-3 flex items-center justify-between border-b border-neutral-800">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#F4CA19] bg-[#F4CA19]/10 px-2 py-0.5 rounded border border-[#F4CA19]/20">
              NUEVO RECLAMO COMUNAL
            </span>
            <h2 className="text-white font-black text-lg sm:text-xl mt-1">
              ¿Qué falta en tu barrio de Osorno?
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar formulario de nuevo reclamo"
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulario con desplazamiento vertical */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {/* Alerta de Duplicado Cercano (Estilo FixMyStreet) */}
          {nearbyDuplicate && (
            <div className="bg-amber-950/40 border border-[#F4CA19]/40 rounded-2xl p-3.5 space-y-2 animate-fadeIn">
              <div className="flex items-start gap-2 text-[#F4CA19] text-xs font-bold">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  ¡Posible reporte duplicado a {nearbyDuplicate.distance} metros!
                </span>
              </div>
              <p className="text-neutral-300 text-xs leading-relaxed">
                Ya existe el reclamo <strong className="text-white">«{nearbyDuplicate.report.title}»</strong> en este mismo punto. Te sugerimos sumarte con un apoyo para que el reclamo gane fuerza colectiva ante la Municipalidad.
              </p>
              <button
                type="button"
                onClick={() => {
                  onSelectExistingReport(nearbyDuplicate.report);
                  onClose();
                }}
                className="w-full bg-[#F4CA19] hover:bg-[#ffe14d] text-black font-extrabold text-xs py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Ver y apoyar reclamo existente ({nearbyDuplicate.report.support_count} apoyos)</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* 1. Selector de Categoría (Visual Grid) */}
          <div>
            <label className="block text-neutral-300 text-xs font-bold uppercase tracking-wider mb-2">
              1. Selecciona la categoría del problema
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(CATEGORIAS_REPORTE) as ReportCategory[]).map((catKey) => {
                const cat = CATEGORIAS_REPORTE[catKey];
                const isSelected = category === catKey;

                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setCategory(catKey)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-neutral-800 border-[#F4CA19] ring-1 ring-[#F4CA19] text-white shadow-md'
                        : 'bg-neutral-900/60 border-white/5 hover:border-white/20 text-neutral-400'
                    }`}
                  >
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${cat.color}25`,
                        color: cat.color,
                      }}
                    >
                      <CategoryIcon category={catKey} className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-semibold truncate leading-tight">
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Ubicación y Sector en Osorno */}
          <div className="bg-neutral-900/60 border border-white/5 rounded-2xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-neutral-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#F4CA19]" />
                2. Ubicación en el mapa de Osorno
              </label>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isLocating}
                className="text-[11px] font-bold text-[#F4CA19] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Compass className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'Obteniendo GPS...' : 'Usar mi GPS'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-neutral-400 text-[11px] mb-1">Sector / Barrio</label>
                <select
                  value={sector}
                  onChange={(e) => {
                    const newSector = e.target.value;
                    setSector(newSector);
                    if (formError) setFormError(null);
                    const centroid = SECTOR_CENTROIDS[newSector];
                    if (centroid) {
                      setCoords({ lat: centroid[0], lng: centroid[1] });
                      setAddressReference((prev) => (!prev || prev.startsWith('Sector ') ? `Sector ${newSector}` : prev));
                    }
                  }}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#F4CA19]"
                >
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

              <div>
                <label className="block text-neutral-400 text-[11px] mb-1">Dirección referencial</label>
                <input
                  type="text"
                  placeholder="Ej. Av. República con Bellavista"
                  value={addressReference}
                  onChange={(e) => setAddressReference(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#F4CA19]"
                />
              </div>
            </div>

            <p className="text-[11px] text-neutral-500 flex items-center gap-1">
              <Info className="w-3 h-3 text-neutral-400 shrink-0" />
              <span>Puedes arrastrar el marcador amarillo en el mapa para ajustar la posición exacta.</span>
            </p>
          </div>

          {/* 3. Título y Descripción */}
          <div className="space-y-3">
            <div>
              <label className="block text-neutral-300 text-xs font-bold uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>3. Título breve del problema</span>
                {formError && !title.trim() && (
                  <span className="text-rose-400 text-[10px] font-semibold lowercase">Requerido</span>
                )}
              </label>
              <input
                type="text"
                maxLength={80}
                placeholder="Ej. Cráter peligroso en cruce vehicular"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (formError) setFormError(null);
                }}
                className={`w-full bg-neutral-900 border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none transition-colors ${
                  formError && !title.trim()
                    ? 'border-rose-500 ring-1 ring-rose-500/50 focus:border-rose-400'
                    : 'border-neutral-700 focus:border-[#F4CA19]'
                }`}
              />
            </div>

            <div>
              <label className="block text-neutral-300 text-xs font-bold uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Detalle y consecuencias</span>
                {formError && !description.trim() && (
                  <span className="text-rose-400 text-[10px] font-semibold lowercase">Requerido</span>
                )}
              </label>
              <textarea
                rows={3}
                placeholder="Explica qué ocurre, desde cuándo y cómo afecta a los peatones o vehículos..."
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (formError) setFormError(null);
                }}
                className={`w-full bg-neutral-900 border rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none transition-colors resize-none ${
                  formError && !description.trim()
                    ? 'border-rose-500 ring-1 ring-rose-500/50 focus:border-rose-400'
                    : 'border-neutral-700 focus:border-[#F4CA19]'
                }`}
              />
            </div>
          </div>

          {/* 4. Fotografía de Evidencia (Canvas WebP Nativo) */}
          <div>
            <label className="block text-neutral-300 text-xs font-bold uppercase tracking-wider mb-1">
              4. Fotografía de evidencia
            </label>
            <div className="border-2 border-dashed border-neutral-700 hover:border-[#F4CA19] rounded-2xl p-4 text-center transition-colors">
              {imageUrl ? (
                <div className="space-y-2">
                  <div className="rounded-xl overflow-hidden max-h-40 mx-auto">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl} alt="Vista previa" className="w-full h-full object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setImageUrl(null)}
                    className="text-rose-400 text-xs hover:underline cursor-pointer"
                  >
                    Eliminar fotografía
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-1.5 cursor-pointer py-2">
                  <Camera className="w-6 h-6 text-[#F4CA19]" />
                  <span className="text-white text-xs font-bold">
                    {isCompressing ? 'Comprimiendo imagen en navegador...' : 'Tomar foto o subir imagen'}
                  </span>
                  <span className="text-neutral-400 text-[11px]">
                    Optimización automática a WebP (máx. 800 KB)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* 5. Identificación y Privacidad */}
          <div className="bg-neutral-900/60 border border-white/5 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isAnonymous"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-700 text-[#F4CA19] focus:ring-0 focus:ring-offset-0 bg-neutral-800 cursor-pointer"
              />
              <label htmlFor="isAnonymous" className="text-neutral-200 text-xs font-semibold cursor-pointer">
                Publicar como vecina/o anónimo
              </label>
            </div>

            {!isAnonymous && (
              <div className="pt-1">
                <input
                  type="text"
                  placeholder="Tu nombre o alias (ej. Don Carlos, Vecina de Rahue)"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#F4CA19]"
                />
              </div>
            )}
          </div>

          {/* 6. Verificación Anti-Spam Comunitaria (Suma Aritmética Simple) */}
          <div className="bg-neutral-900/60 border border-white/5 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-neutral-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#F4CA19]" />
                <span>6. Control anti-spam vecinal</span>
              </label>
              <button
                type="button"
                onClick={refreshCaptcha}
                className="text-[11px] text-neutral-400 hover:text-[#F4CA19] flex items-center gap-1 transition-colors cursor-pointer"
                title="Generar otra suma"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Cambiar suma</span>
              </button>
            </div>
            <p className="text-[11px] text-neutral-400 leading-tight">
              Para proteger a la comunidad del spam y bots, resuelve esta sencilla suma:
            </p>
            <div className="flex items-center gap-2.5 pt-1">
              <div className="bg-neutral-800 border border-neutral-700/80 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-extrabold text-white select-none tracking-wide">
                ¿Cuánto es {captchaA} + {captchaB}? =
              </div>
              <input
                type="number"
                placeholder="Resultado"
                value={captchaInput}
                onChange={(e) => {
                  setCaptchaInput(e.target.value);
                  if (formError) setFormError(null);
                }}
                className="w-28 bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-center text-white focus:outline-none focus:border-[#F4CA19] font-bold"
              />
            </div>
          </div>

          {/* Alerta visible si falta algún campo obligatorio */}
          {formError && (
            <div className="bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs p-3 rounded-xl flex items-center gap-2 animate-fadeIn">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Botón de Envío Final */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isCompressing || isSubmitting}
              className="w-full bg-[#F4CA19] hover:bg-[#ffe14d] active:scale-98 disabled:opacity-60 text-black font-black text-sm py-3.5 rounded-xl shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                  <span>Publicando denuncia en el mapa...</span>
                </>
              ) : isCompressing ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                  <span>Comprimiendo fotografía...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Publicar reporte en el mapa de Osorno</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
