'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Report, ReportCategory } from '@/types/report';
import { OSORNO_CENTER, OSORNO_POLYGON_GEOJSON, CATEGORIAS_REPORTE } from '@/config/osorno';
import {
  SECTOR_CENTROIDS,
  SECTOR_ZOOMS,
  calculateDaysElapsed,
  formatElapsedDays,
  formatResolvedDays,
} from '@/lib/geo-utils';
import { createHeatLayer } from './leaflet-heat';

interface MapViewProps {
  reports: Report[];
  selectedReport: Report | null;
  focusedReport?: Report | null;
  selectedSector?: string | 'todos';
  onSelectReport: (report: Report) => void;
  viewMode: 'pines' | 'calor';
  onMapClick?: (coords: { lat: number; lng: number }) => void;
  pickedCoords?: { lat: number; lng: number } | null;
}

export const MapView: React.FC<MapViewProps> = ({
  reports,
  selectedReport,
  focusedReport,
  selectedSector = 'todos',
  onSelectReport,
  viewMode,
  onMapClick,
  pickedCoords,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const heatLayerRef = useRef<any>(null);
  const pickedMarkerRef = useRef<L.Marker | null>(null);
  const markersMapRef = useRef<Map<string, L.Marker>>(new Map());

  // Inicializar mapa Leaflet con OpenStreetMap oficial (100 % libre y sin API keys)
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [OSORNO_CENTER.lat, OSORNO_CENTER.lng],
      zoom: OSORNO_CENTER.zoom,
      zoomControl: false,
      attributionControl: false,
    });

    // Teselas oficiales de OpenStreetMap
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    // Atribución reglamentaria de OpenStreetMap
    L.control
      .attribution({
        position: 'bottomright',
        prefix: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
      })
      .addTo(map);

    // Delimitación comunal de Osorno
    L.geoJSON(OSORNO_POLYGON_GEOJSON as any, {
      style: {
        color: '#F4CA19',
        weight: 2.5,
        dashArray: '5, 8',
        fillColor: '#F4CA19',
        fillOpacity: 0.04,
      },
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerGroupRef.current = markersGroup;

    // Manejar clics sobre el lienzo del mapa
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (onMapClick) {
        onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    });

    mapInstanceRef.current = map;

    // Asegurar que el mapa cubra todo el ancho/alto de inmediato y en cambios de resolución
    map.invalidateSize();

    let resizeTimer: NodeJS.Timeout | number;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 80);
    };

    window.addEventListener('resize', handleResize);

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      clearTimeout(resizeTimer);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [onMapClick]);

  // Zoom automático al sector de Osorno seleccionado
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (selectedSector && selectedSector !== 'todos') {
      const coords = SECTOR_CENTROIDS[selectedSector];
      const zoomLevel = SECTOR_ZOOMS[selectedSector] || 15;
      if (coords) {
        map.flyTo(coords, zoomLevel, {
          duration: 1.2,
        });
      }
    } else if (selectedSector === 'todos') {
      map.flyTo([OSORNO_CENTER.lat, OSORNO_CENTER.lng], OSORNO_CENTER.zoom, {
        duration: 1.0,
      });
    }
  }, [selectedSector]);

  // Actualizar marcador de punto seleccionado en creación
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (pickedCoords) {
      if (!pickedMarkerRef.current) {
        const pinIcon = L.divIcon({
          className: 'picked-pin-marker',
          html: `
            <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-full animate-bounce">
              <div class="w-10 h-10 rounded-full bg-[#F4CA19] text-black font-black flex items-center justify-center shadow-2xl border-2 border-black">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <div class="absolute -bottom-1 w-2 h-2 bg-[#F4CA19] rotate-45 border-r border-b border-black"></div>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 40],
        });

        pickedMarkerRef.current = L.marker([pickedCoords.lat, pickedCoords.lng], {
          icon: pinIcon,
          draggable: true,
        }).addTo(map);

        pickedMarkerRef.current.on('dragend', (ev) => {
          const marker = ev.target;
          const pos = marker.getLatLng();
          if (onMapClick) {
            onMapClick({ lat: pos.lat, lng: pos.lng });
          }
        });
      } else {
        pickedMarkerRef.current.setLatLng([pickedCoords.lat, pickedCoords.lng]);
      }
    } else if (pickedMarkerRef.current) {
      pickedMarkerRef.current.remove();
      pickedMarkerRef.current = null;
    }
  }, [pickedCoords, onMapClick]);

  // Renderizado reactivo de marcadores o capa de calor según `viewMode`
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();
    markersMapRef.current.clear();

    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    if (viewMode === 'calor') {
      // Modo Mapa de Calor (Heatmap ponderado por cantidad de apoyos)
      const heatPoints: [number, number, number][] = reports.map((r) => [
        r.latitude,
        r.longitude,
        Math.min(1.0, 0.4 + (r.support_count / 50)),
      ]);

      const heat = createHeatLayer(heatPoints, {
        radius: 35,
        blur: 22,
        max: 1.0,
      });
      heat.addTo(map);
      heatLayerRef.current = heat;
    } else {
      // Modo Marcadores (Pines individuales con identidad visual táctica y Popup)
      reports.forEach((rep) => {
        const catInfo = CATEGORIAS_REPORTE[rep.category];
        const isSelected = selectedReport?.id === rep.id;
        const isResolved = rep.status === 'resuelto';
        const isUnderReview = rep.status === 'en_revision';

        const daysUnresolved = rep.days_unresolved ?? calculateDaysElapsed(rep.created_at);
        const daysToResolve = rep.days_to_resolve ?? (isResolved ? calculateDaysElapsed(rep.created_at, rep.resolved_at) : undefined);

        const statusLabel = isResolved ? '✓ Resuelto' : isUnderReview ? '⏱ En revisión' : '⚠️ Pendiente';
        const statusBg = isResolved ? 'rgba(16, 185, 129, 0.2)' : isUnderReview ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)';
        const statusColor = isResolved ? '#34D399' : isUnderReview ? '#FBBF24' : '#F87171';
        const statusBorder = isResolved ? 'rgba(16, 185, 129, 0.4)' : isUnderReview ? 'rgba(245, 158, 11, 0.4)' : 'rgba(239, 68, 68, 0.4)';

        const isOldUnresolved = !isResolved && daysUnresolved >= 30;

        const markerHtml = `
          <div class="group relative cursor-pointer -translate-x-1/2 -translate-y-1/2 transition-transform duration-200 hover:scale-125 ${isSelected ? 'scale-125 z-50' : 'z-10'}">
            <div 
              class="w-9 h-9 rounded-full flex items-center justify-center shadow-lg border-2 text-white font-bold text-xs relative ${
                isResolved 
                  ? 'border-emerald-400 bg-emerald-700' 
                  : 'border-white'
              }"
              style="background-color: ${isResolved ? '#059669' : catInfo.color};"
            >
              <span class="text-sm">${isResolved ? '✓' : '📍'}</span>
              ${
                isOldUnresolved
                  ? `<span class="absolute -top-2 -left-2 bg-rose-600 text-white border border-rose-300 rounded-full text-[9px] font-black px-1.5 py-0.5 leading-none shadow-lg">${daysUnresolved}d</span>`
                  : ''
              }
              ${
                rep.support_count > 3
                  ? `<span class="absolute -top-1.5 -right-1.5 bg-[#141414] text-[#F4CA19] border border-[#F4CA19] rounded-full text-[10px] font-black px-1.5 py-0.5 leading-none shadow-md">+${rep.support_count}</span>`
                  : ''
              }
            </div>
            ${
              !isResolved
                ? `<div class="absolute -inset-1 rounded-full opacity-40 animate-ping -z-10" style="background-color: ${catInfo.color};"></div>`
                : ''
            }
          </div>
        `;

        const icon = L.divIcon({
          className: 'custom-muni-pin',
          html: markerHtml,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const marker = L.marker([rep.latitude, rep.longitude], { icon });

        // Contenido de la ventana emergente sobre el pin (Popup)
        const popupHtml = `
          <div class="muni-popup-card" style="min-width: 240px; max-width: 290px; font-family: inherit;">
            ${
              rep.image_url
                ? `<div style="width: 100%; height: 120px; border-radius: 12px; overflow: hidden; margin-bottom: 8px; background: #000; border: 1px solid rgba(255,255,255,0.1);">
                    <img src="${rep.image_url}" alt="${rep.title}" style="width: 100%; height: 100%; object-fit: cover;" />
                   </div>`
                : ''
            }
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-bottom: 6px;">
              <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: ${catInfo.color}; background: ${catInfo.color}20; padding: 2px 8px; border-radius: 6px; border: 1px solid ${catInfo.color}40;">
                ${catInfo.name}
              </span>
              <span style="font-size: 10px; font-weight: 700; color: ${statusColor}; background: ${statusBg}; padding: 2px 6px; border-radius: 6px; border: 1px solid ${statusBorder};">
                ${statusLabel}
              </span>
            </div>

            <h4 style="color: #FFFFFF; font-size: 13px; font-weight: 800; margin: 4px 0 3px 0; line-height: 1.35;">
              ${rep.title}
            </h4>

            ${
              isResolved
                ? `<div style="font-size: 11px; font-weight: 800; color: #34D399; margin: 5px 0; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.35); padding: 4px 8px; border-radius: 6px;">
                    ✓ Solucionado tras ${daysToResolve ?? 0} días de espera
                   </div>`
                : `<div style="font-size: 11px; font-weight: 800; color: ${daysUnresolved >= 60 ? '#F87171' : daysUnresolved >= 30 ? '#FBBF24' : '#E5E7EB'}; margin: 5px 0; background: ${daysUnresolved >= 60 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)'}; border: 1px solid ${daysUnresolved >= 60 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.4)'}; padding: 4px 8px; border-radius: 6px;">
                    ⏱ ${daysUnresolved} días sin solución municipal
                   </div>`
            }

            <p style="color: #9CA3AF; font-size: 11px; margin: 0 0 6px 0; line-height: 1.3;">
              📍 <strong style="color: #E5E7EB;">${rep.sector}</strong>${rep.is_rural ? ' <span style="font-size: 9px; font-weight: 700; color: #34D399; background: rgba(16, 185, 129, 0.2); padding: 1px 4px; border-radius: 4px;">RURAL</span>' : ''} • ${rep.address_reference}
            </p>

            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.1); margin-top: 4px;">
              <span style="font-size: 11px; font-weight: 800; color: #F4CA19;">
                👍 ${rep.support_count} apoyos
              </span>
              <button 
                id="btn-popup-${rep.id}"
                style="background: #F4CA19; color: #000000; font-size: 11px; font-weight: 800; padding: 5px 12px; border-radius: 8px; border: none; cursor: pointer; display: flex; align-items: center; gap: 4px; transition: transform 0.1s ease;"
              >
                Ver detalle →
              </button>
            </div>
          </div>
        `;

        marker.bindPopup(popupHtml, {
          className: 'custom-muni-popup',
          maxWidth: 300,
          offset: [0, -14],
        });

        marker.on('popupopen', () => {
          const btn = document.getElementById(`btn-popup-${rep.id}`);
          if (btn) {
            btn.onclick = (e) => {
              e.stopPropagation();
              onSelectReport(rep);
            };
          }
        });

        marker.on('click', () => {
          map.panTo([rep.latitude, rep.longitude], { animate: true, duration: 0.5 });
        });

        markersGroup.addLayer(marker);
        markersMapRef.current.set(rep.id, marker);
      });

      const activeTarget = focusedReport || selectedReport;
      if (activeTarget) {
        const marker = markersMapRef.current.get(activeTarget.id);
        if (marker) {
          marker.openPopup();
        }
      }
    }
  }, [reports, selectedReport, focusedReport, viewMode, onSelectReport]);

  // Centrar y abrir popup si hay un reporte seleccionado o enfocado externamente
  useEffect(() => {
    const map = mapInstanceRef.current;
    const target = focusedReport || selectedReport;
    if (!map || !target) return;

    const timer = setTimeout(() => {
      const marker = markersMapRef.current.get(target.id);
      if (marker) {
        marker.openPopup();
      }
      map.flyTo([target.latitude, target.longitude], 16, {
        duration: 1.2,
      });
    }, 120);

    return () => clearTimeout(timer);
  }, [focusedReport, selectedReport]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full z-0 outline-none" />
    </div>
  );
};
