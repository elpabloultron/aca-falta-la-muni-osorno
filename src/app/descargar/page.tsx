'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Download,
  Smartphone,
  Share,
  PlusSquare,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Clock,
  FileText,
  Users,
  Compass,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Play,
  Share2,
  Code2,
  Package,
  RefreshCw,
  Layers,
} from 'lucide-react';
import { APP_VERSION } from '@/config/osorno';
import {
  GitHubBadge,
  FDroidBadge,
  ObtainiumBadge,
} from '@/components/Badges/OfficialStoreBadges';

export default function DescargarPage() {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'pc'>('android');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detectar dispositivo por omisión
    const ua = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      setActiveTab('ios');
    } else if (/android/.test(ua)) {
      setActiveTab('android');
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert('Para instalar en Android: abre el menú de Chrome (los 3 puntos ⋮ en la esquina superior) y presiona "Instalar aplicación" o "Agregar a la pantalla principal".');
    }
  };

  return (
    <div className="h-full w-full overflow-y-auto bg-[#101012] text-white selection:bg-[#F4CA19] selection:text-black scroll-smooth">
      {/* 1. Barra de Navegación Superior */}
      <header className="sticky top-0 z-40 bg-[#141416]/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#F4CA19] flex items-center justify-center text-black font-black text-lg shadow-md">
            !
          </div>
          <div>
            <span className="font-black tracking-tight text-sm sm:text-base text-white">
              ACÁ FALTA LA MUNI
            </span>
            <span className="ml-2 text-[10px] bg-[#F4CA19]/15 text-[#F4CA19] font-bold px-1.5 py-0.5 rounded border border-[#F4CA19]/30">
              OSORNO
            </span>
            <span className="ml-1.5 text-[10px] font-mono bg-white/10 text-neutral-300 font-semibold px-1.5 py-0.5 rounded border border-white/10">
              {APP_VERSION}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="px-3 sm:px-4 py-2 rounded-xl bg-[#F4CA19] hover:bg-[#ffe043] text-black font-black text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Abrir Mapa</span>
          </Link>
        </div>
      </header>

      {/* 2. Hero Section Principal */}
      <section className="relative px-4 sm:px-8 pt-12 pb-16 max-w-6xl mx-auto overflow-hidden">
        {/* Luces de fondo decorativas */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#F4CA19]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 bg-[#F4CA19]/10 border border-[#F4CA19]/30 text-[#F4CA19] text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Plataforma Vecinal Oficial Osorno • {APP_VERSION}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.15]">
            Fiscalización comunitaria en tiempo real para{' '}
            <span className="text-[#F4CA19]">todo Osorno</span>
          </h1>

          <p className="text-neutral-400 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            Reporta baches, falta de luminarias, microbasurales y socavones en los 951 km² de la comuna.
            Exige respuestas concretas con respaldo jurídico y seguimiento vecinal.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/"
              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-[#F4CA19] hover:bg-[#ffe043] text-black font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-yellow-500/20 transition-all cursor-pointer"
            >
              <MapPin className="w-4 h-4" />
              <span>Ir al Mapa Comunal</span>
            </Link>

            <a
              href="#instalar"
              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-neutral-800/90 hover:bg-neutral-700 text-white font-bold text-sm flex items-center justify-center gap-2 border border-white/10 transition-all cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-[#F4CA19]" />
              <span>Instalar Web App (PWA)</span>
            </a>

            <a
              href="#tiendas"
              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-white font-bold text-sm flex items-center justify-center gap-2 border border-white/10 transition-all cursor-pointer"
            >
              <Package className="w-4 h-4 text-[#F4CA19]" />
              <span>Tiendas y Descargas</span>
            </a>
          </div>

          {/* Fila rápida de acceso Open Source (GitHub, Obtainium y F-Droid) */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
            <GitHubBadge />
            <ObtainiumBadge />
            <FDroidBadge />
          </div>

          <div className="pt-4 flex items-center justify-center gap-6 text-xs text-neutral-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              100 % Anónima
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#F4CA19]" />
              Sin Descargas Pesadas
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-blue-400" />
              Urbano y Rural
            </span>
          </div>
        </div>
      </section>

      {/* 3. Sección de Video Tutorial para Instagram y Redes Sociales */}
      <section className="px-4 sm:px-8 py-12 bg-[#141418] border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
              ¿Cómo cargar una denuncia en 20 segundos?
            </h2>
            <p className="text-neutral-400 text-xs sm:text-sm">
              Mira el tutorial en formato vertical creado para Instagram Stories, WhatsApp y TikTok.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Reproductor de Video en Marco de Teléfono */}
            <div className="flex justify-center">
              <div className="relative w-[280px] sm:w-[320px] aspect-[9/16] bg-black rounded-[40px] border-4 border-neutral-700 shadow-2xl overflow-hidden p-1.5">
                <div className="w-full h-full rounded-[32px] overflow-hidden bg-[#121214]">
                  <video
                    src={`${basePath}/tutorial/tutorial_como_denunciar_osorno.mp4`}
                    poster={`${basePath}/tutorial/instagram_tutorial_slide_1.png`}
                    controls
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Pasos Resumidos al Costado */}
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="bg-neutral-900/80 border border-white/10 rounded-2xl p-4 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#F4CA19] text-black font-black flex items-center justify-center shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-white">Elige la categoría y tu sector</h4>
                  <p className="text-neutral-400 text-xs mt-0.5">
                    Calles, luminarias, microbasurales, aguas. Válido para Rahue, Ovejería, Centro y zonas rurales (Cancura, Pichil, Forrahue, etc.).
                  </p>
                </div>
              </div>

              <div className="bg-neutral-900/80 border border-white/10 rounded-2xl p-4 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#F4CA19] text-black font-black flex items-center justify-center shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-white">Sube la fotografía de evidencia</h4>
                  <p className="text-neutral-400 text-xs mt-0.5">
                    Toma la foto o selecciónala de tu galería. Se comprime de inmediato para no gastar tus datos móviles.
                  </p>
                </div>
              </div>

              <div className="bg-neutral-900/80 border border-white/10 rounded-2xl p-4 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#F4CA19] text-black font-black flex items-center justify-center shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-white">Confirma el pin GPS y publica</h4>
                  <p className="text-neutral-400 text-xs mt-0.5">
                    Toca el mapa o usa el satélite de tu celular. Elige publicar de forma anónima o con tu nombre.
                  </p>
                </div>
              </div>

              <div className="bg-neutral-900/80 border border-white/10 rounded-2xl p-4 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#22C55E] text-black font-black flex items-center justify-center shrink-0">
                  4
                </div>
                <div>
                  <h4 className="font-bold text-white">Comienza el conteo y la presión cívica</h4>
                  <p className="text-neutral-400 text-xs mt-0.5">
                    Contador de días sin respuesta, apoyos vecinales (+1), descarga de oficio para la CGR y difusión en redes sociales.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={`${basePath}/tutorial/tutorial_como_denunciar_osorno.mp4`}
                  download="tutorial_como_denunciar_osorno.mp4"
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#F4CA19] hover:underline"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar video original para compartir en tu Instagram o WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Sección de Instalación de la App (Android e iOS) */}
      <section id="instalar" className="px-4 sm:px-8 py-16 max-w-4xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F4CA19] uppercase tracking-wider mb-2">
            <Smartphone className="w-4 h-4" />
            <span>Sin Tiendas de Aplicaciones</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white mb-3">
            Instala la App en tu Celular
          </h2>
          <p className="text-neutral-400 text-xs sm:text-sm">
            «Acá Falta la Muni» es una Progressive Web App (PWA). No ocupa memoria de tu teléfono, se actualiza sola y funciona incluso con baja señal en zonas rurales.
          </p>
        </div>

        {/* Pestañas de Plataforma */}
        <div className="flex rounded-2xl bg-neutral-900 p-1.5 max-w-md mx-auto mb-8 border border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'android'
                ? 'bg-[#F4CA19] text-black shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Android</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'ios'
                ? 'bg-[#F4CA19] text-black shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>iPhone (iOS)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pc')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'pc'
                ? 'bg-[#F4CA19] text-black shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>PC / Mac</span>
          </button>
        </div>

        {/* Tarjeta de Contenido de Instalación */}
        <div className="bg-[#18181C] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
          {activeTab === 'android' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-white/10">
                <div>
                  <h3 className="text-lg font-bold text-white">Instalación en Android con Google Chrome</h3>
                  <p className="text-neutral-400 text-xs mt-1">
                    Solo requiere tocar el botón a continuación para anclar el icono a tus aplicaciones.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#F4CA19] hover:bg-[#ffe043] text-black font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/20 transition-all cursor-pointer shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Instalar App en Android</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-neutral-900/60 border border-white/5 p-4 rounded-2xl space-y-2">
                  <div className="w-6 h-6 rounded-full bg-[#F4CA19] text-black font-black flex items-center justify-center text-xs">
                    1
                  </div>
                  <h4 className="font-bold text-white">Abre en Chrome</h4>
                  <p className="text-neutral-400">
                    Ingresa a <strong className="text-[#F4CA19]">aca-falta-la-muni-osorno.web.app</strong> desde tu navegador habitual.
                  </p>
                </div>

                <div className="bg-neutral-900/60 border border-white/5 p-4 rounded-2xl space-y-2">
                  <div className="w-6 h-6 rounded-full bg-[#F4CA19] text-black font-black flex items-center justify-center text-xs">
                    2
                  </div>
                  <h4 className="font-bold text-white">Toca el botón o menú</h4>
                  <p className="text-neutral-400">
                    Presiona el banner de instalación o abre el menú (<strong className="text-white">⋮</strong>) arriba a la derecha.
                  </p>
                </div>

                <div className="bg-neutral-900/60 border border-white/5 p-4 rounded-2xl space-y-2">
                  <div className="w-6 h-6 rounded-full bg-[#F4CA19] text-black font-black flex items-center justify-center text-xs">
                    3
                  </div>
                  <h4 className="font-bold text-white">¡Listo en tu inicio!</h4>
                  <p className="text-neutral-400">
                    Selecciona «Instalar aplicación». Quedará con su icono y pantalla completa.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ios' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white">Instalación en iPhone / iPad con Safari</h3>
                <p className="text-neutral-400 text-xs mt-1">
                  En Apple iOS la instalación se realiza en 2 toques desde el navegador Safari.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-neutral-900/60 border border-white/5 p-4 rounded-2xl space-y-2">
                  <div className="w-6 h-6 rounded-full bg-blue-500 text-white font-black flex items-center justify-center text-xs">
                    1
                  </div>
                  <h4 className="font-bold text-white">Botón Compartir</h4>
                  <p className="text-neutral-400">
                    En Safari, presiona el icono de compartir (<Share className="w-3.5 h-3.5 inline text-blue-400" />) en la barra inferior de la pantalla.
                  </p>
                </div>

                <div className="bg-neutral-900/60 border border-white/5 p-4 rounded-2xl space-y-2">
                  <div className="w-6 h-6 rounded-full bg-blue-500 text-white font-black flex items-center justify-center text-xs">
                    2
                  </div>
                  <h4 className="font-bold text-white">Agregar a inicio</h4>
                  <p className="text-neutral-400">
                    Desplaza hacia abajo y toca la opción <strong className="text-white">«Agregar a pantalla de inicio»</strong> (<PlusSquare className="w-3.5 h-3.5 inline" />).
                  </p>
                </div>

                <div className="bg-neutral-900/60 border border-white/5 p-4 rounded-2xl space-y-2">
                  <div className="w-6 h-6 rounded-full bg-blue-500 text-white font-black flex items-center justify-center text-xs">
                    3
                  </div>
                  <h4 className="font-bold text-white">Confirmar</h4>
                  <p className="text-neutral-400">
                    Presiona <strong className="text-white">«Agregar»</strong> arriba a la derecha. ¡Ya tienes la app en tu iPhone!
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pc' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Uso en Computador (PC / Mac)</h3>
              <p className="text-neutral-400 text-xs">
                Puedes abrir la aplicación directamente en cualquier pantalla grande para auditar mapas en alta resolución, o bien instalarla en Chrome o Edge presionando el icono de instalación en la barra superior del navegador.
              </p>
              <div className="p-4 bg-neutral-900/80 rounded-2xl border border-white/10 flex items-center justify-between">
                <span className="text-xs text-neutral-300 font-mono">https://aca-falta-la-muni-osorno.web.app</span>
                <Link
                  href="/"
                  className="px-4 py-2 bg-[#F4CA19] hover:bg-[#ffe043] text-black text-xs font-bold rounded-xl shadow transition-colors"
                >
                  Abrir ahora
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 5. Ecosistema 100 % Open Source y Distribución Libre */}
      <section id="tiendas" className="px-4 sm:px-8 py-16 bg-[#131316] border-t border-white/5">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F4CA19] uppercase tracking-wider bg-[#F4CA19]/10 px-3 py-1 rounded-full border border-[#F4CA19]/30">
              <Code2 className="w-4 h-4" />
              <span>Proyecto 100 % Open Source y Libre</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Descargas Libres: GitHub, Obtainium y F-Droid
            </h2>
            <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
              Sin tiendas comerciales cerradas ni rastreo publicitario. Descarga la aplicación de forma libre, auditable y directa mediante repositorios abiertos comunitarios.
            </p>
          </div>

          {/* Fila de Insignias Oficiales Open Source */}
          <div className="bg-[#18181D]/80 border border-white/10 rounded-3xl p-5 sm:p-7 backdrop-blur-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-4">
              <div>
                <h3 className="text-white font-black text-base sm:text-lg flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#F4CA19]" />
                  <span>Canales Libres de Distribución e Instalación</span>
                </h3>
                <p className="text-neutral-400 text-xs mt-0.5">
                  Selecciona tu método preferido de código abierto para instalar o actualizar la aplicación
                </p>
              </div>
              <span className="text-[11px] font-mono bg-[#F4CA19]/10 text-[#F4CA19] font-bold px-2.5 py-1 rounded-full border border-[#F4CA19]/30 self-start sm:self-auto">
                ID: cl.acafaltalamuni.osorno
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1">
              <GitHubBadge />
              <ObtainiumBadge />
              <FDroidBadge />
            </div>
          </div>

          {/* Cuadrícula de Canales Open Source (3 Columnas) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1. GitHub Releases & APK Directo */}
            <div className="bg-[#18181D] border border-white/10 rounded-2xl p-5 flex flex-col justify-between hover:border-[#F4CA19]/40 transition-colors shadow-lg group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center font-black">
                    <Code2 className="w-5 h-5 text-[#F4CA19]" />
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    v1.0.0 Oficial
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-[#F4CA19] transition-colors">
                    GitHub Releases (APK)
                  </h3>
                  <p className="text-neutral-400 text-xs mt-1.5 leading-relaxed">
                    Descarga directa del paquete APK firmado oficial, compilado directamente desde el repositorio público. Código 100 % auditable, sin rastreadores ni publicidad.
                  </p>
                </div>
              </div>
              <div className="pt-5 mt-4 border-t border-white/5 flex flex-col gap-2.5">
                <GitHubBadge />
                <a
                  href="https://github.com/elpabloultron/aca-falta-la-muni-osorno/releases"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-center text-[11px] text-neutral-400 hover:text-white hover:underline transition-colors"
                >
                  Ver Releases y notas de versión en GitHub →
                </a>
              </div>
            </div>

            {/* 2. Obtainium (Actualizaciones Automáticas sin Tiendas) */}
            <div className="bg-[#18181D] border border-white/10 rounded-2xl p-5 flex flex-col justify-between hover:border-purple-500/40 transition-colors shadow-lg group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-black">
                    <RefreshCw className="w-5 h-5 text-purple-400" />
                  </div>
                  <span className="text-[10px] font-bold bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
                    Recomendado FOSS
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                    Obtainium (Android)
                  </h3>
                  <p className="text-neutral-400 text-xs mt-1.5 leading-relaxed">
                    Instala la app directamente desde GitHub y recibe avisos de actualización en 1 toque en tu teléfono Android, sin pasar por Google ni tiendas propietarias.
                  </p>
                </div>
              </div>
              <div className="pt-5 mt-4 border-t border-white/5 flex flex-col gap-2.5">
                <ObtainiumBadge />
                <a
                  href="https://github.com/ImranR98/Obtainium"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-center text-[11px] text-neutral-400 hover:text-white hover:underline transition-colors"
                >
                  ¿Qué es Obtainium? Descargar gestor libre →
                </a>
              </div>
            </div>

            {/* 3. F-Droid (Catálogo Software Libre) */}
            <div className="bg-[#18181D] border border-white/10 rounded-2xl p-5 flex flex-col justify-between hover:border-blue-500/40 transition-colors shadow-lg group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-black">
                    <ShieldCheck className="w-5 h-5 text-blue-400" />
                  </div>
                  <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30">
                    FOSS · 100 % Libre
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                    F-Droid (Android)
                  </h3>
                  <p className="text-neutral-400 text-xs mt-1.5 leading-relaxed">
                    El repositorio de software libre más respetado para Android. Cero librerías de seguimiento privativo, total privacidad y metadatos F-Droid configurados.
                  </p>
                </div>
              </div>
              <div className="pt-5 mt-4 border-t border-white/5 flex flex-col gap-2.5">
                <FDroidBadge />
                <a
                  href="https://f-droid.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-center text-[11px] text-neutral-400 hover:text-white hover:underline transition-colors"
                >
                  Receta metadata F-Droid configurada →
                </a>
              </div>
            </div>
          </div>

          {/* Gran Banner Oficial de GitHub y Proyecto Open Source */}
          <div className="relative overflow-hidden bg-gradient-to-br from-neutral-900 via-[#16161B] to-neutral-900 border-2 border-[#F4CA19]/40 rounded-3xl p-6 sm:p-10 shadow-2xl">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-80 h-80 bg-[#F4CA19]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="space-y-4 text-center lg:text-left max-w-2xl">
                <div className="inline-flex items-center gap-2 bg-[#F4CA19]/15 border border-[#F4CA19]/40 text-[#F4CA19] text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  <span>Proyecto Comunitario en GitHub</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  ¡Visita el repositorio oficial y apóyanos con una estrella en GitHub!
                </h3>

                <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed">
                  «Acá Falta la Muni — Osorno» es una iniciativa 100 % independiente y de código abierto (licencia libre AGPL-3.0). El código fuente es público y auditable: cualquier vecino o desarrollador puede revisarlo, clonarlo, reportar problemas o proponer mejoras para la comuna.
                </p>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-1 text-xs">
                  <span className="bg-black/60 border border-white/10 px-3 py-1 rounded-xl text-neutral-300 font-mono flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    github.com/elpabloultron/aca-falta-la-muni-osorno
                  </span>
                  <span className="bg-white/10 px-2.5 py-1 rounded-xl text-neutral-300 font-semibold">
                    Licencia AGPL-3.0
                  </span>
                  <span className="bg-white/10 px-2.5 py-1 rounded-xl text-neutral-300 font-semibold">
                    0 % Rastreadores
                  </span>
                </div>
              </div>

              {/* Botones de Acción del Banner */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0">
                <a
                  href="https://github.com/elpabloultron/aca-falta-la-muni-osorno"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 rounded-2xl bg-[#F4CA19] hover:bg-[#ffe14d] text-black font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-yellow-500/20 transition-all cursor-pointer active:scale-95 text-center"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  <span>Visitar Proyecto en GitHub ⭐</span>
                </a>

                <a
                  href="https://github.com/elpabloultron/aca-falta-la-muni-osorno/releases"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-white/10 transition-all cursor-pointer text-center"
                >
                  <Package className="w-4 h-4 text-[#F4CA19]" />
                  <span>Ver Releases y Descargar APK</span>
                </a>

                <a
                  href="https://github.com/elpabloultron/aca-falta-la-muni-osorno/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer text-center"
                >
                  <Code2 className="w-3.5 h-3.5 text-[#F4CA19]" />
                  <span>Aportar Código o Reportar Fallos</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* 6. Características Principales de Fiscalización */}
      <section className="px-4 sm:px-8 py-16 bg-[#141418] border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
              ¿Por qué usar Acá Falta la Muni?
            </h2>
            <p className="text-neutral-400 text-xs sm:text-sm">
              Una plataforma creada por y para los vecinos de Osorno con herramientas ciudadanas avanzadas.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#18181C] border border-white/10 p-5 rounded-2xl space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#F4CA19]/20 text-[#F4CA19] flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-white">Toda la Comuna</h3>
              <p className="text-neutral-400 text-xs leading-relaxed">
                Cubre los 951 km² comunales, integrando tanto los barrios urbanos como sectores campesinos y ribereños.
              </p>
            </div>

            <div className="bg-[#18181C] border border-white/10 p-5 rounded-2xl space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-white">Contador de Espera</h3>
              <p className="text-neutral-400 text-xs leading-relaxed">
                Cada reclamo acumula públicamente los días de inacción municipal, visibilizando la demora histórica en dar soluciones.
              </p>
            </div>

            <div className="bg-[#18181C] border border-white/10 p-5 rounded-2xl space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-white">Oficios para la CGR</h3>
              <p className="text-neutral-400 text-xs leading-relaxed">
                Genera automáticamente escritos formales imprimibles fundamentados en la Ley N° 18.695 y Ley N° 19.880 para Contraloría.
              </p>
            </div>

            <div className="bg-[#18181C] border border-white/10 p-5 rounded-2xl space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-white">Apoyo Vecinal (+1)</h3>
              <p className="text-neutral-400 text-xs leading-relaxed">
                Tus vecinos pueden sumar respaldos con un toque para elevar la prioridad y viralizar el problema en redes sociales.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Pie de Página */}
      <footer className="px-4 sm:px-8 py-10 bg-[#0E0E10] border-t border-white/10 text-xs text-neutral-500 text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <p className="text-neutral-400">
            «Acá Falta la Muni — Osorno» es una iniciativa ciudadana independiente de fiscalización vecinal y comunitaria.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[#F4CA19] font-bold text-xs">
            <Link href="/" className="hover:underline">
              Mapa en Vivo
            </Link>
            <span>•</span>
            <a href="#instalar" className="hover:underline">
              Web App (PWA)
            </a>
            <span>•</span>
            <a href="#tiendas" className="hover:underline">
              Tiendas y Descargas
            </a>
            <span>•</span>
            <a
              href="https://github.com/elpabloultron/aca-falta-la-muni-osorno"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline flex items-center gap-1"
            >
              <span>Código Abierto (GitHub)</span>
              <ExternalLink className="w-3 h-3 inline" />
            </a>
            <span>•</span>
            <a href={`${basePath}/tutorial/tutorial_como_denunciar_osorno.mp4`} download className="hover:underline">
              Video Tutorial
            </a>
          </div>
          <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 text-[11px] text-neutral-500">
            <span className="font-mono text-[10px] bg-white/5 text-neutral-400 px-1.5 py-0.5 rounded border border-white/10 font-medium">
              {APP_VERSION}
            </span>
            <span className="hidden sm:inline text-neutral-700">·</span>
            <span>Autor: <strong className="text-neutral-400 font-semibold">Pablo Benavides Jorquera</strong></span>
            <span className="hidden sm:inline text-neutral-700">·</span>
            <span>Contacto: <a href="mailto:acafaltalamuniosorno@gmail.com" className="text-neutral-400 hover:text-[#F4CA19] hover:underline transition-colors">acafaltalamuniosorno@gmail.com</a></span>
          </div>
          <p className="text-[11px] text-neutral-600">
            Osorno, Región de Los Lagos, Chile • Desarrollado con tecnología cívica abierta
          </p>
        </div>
      </footer>
    </div>
  );
}
