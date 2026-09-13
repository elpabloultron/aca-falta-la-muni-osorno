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
} from 'lucide-react';

export default function DescargarPage() {
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
            <span>Plataforma Vecinal Oficial Osorno</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.15]">
            Fiscalización comunitaria en tiempo real para{' '}
            <span className="text-[#F4CA19]">todo Osorno</span>
          </h1>

          <p className="text-neutral-400 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            Reporta baches, falta de luminarias, microbasurales y socavones en los 951 km² de la comuna.
            Exige respuestas concretas con respaldo jurídico y seguimiento vecinal.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#F4CA19] hover:bg-[#ffe043] text-black font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-yellow-500/20 transition-all cursor-pointer"
            >
              <MapPin className="w-4 h-4" />
              <span>Ir al Mapa Comunal en Vivo</span>
            </Link>

            <a
              href="#instalar"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-neutral-800/90 hover:bg-neutral-700 text-white font-bold text-sm flex items-center justify-center gap-2 border border-white/10 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#F4CA19]" />
              <span>Instalar App en el Celular</span>
            </a>
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
                    src="/tutorial/tutorial_como_denunciar_osorno.mp4"
                    poster="/tutorial/instagram_tutorial_slide_1.png"
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
                  href="/tutorial/tutorial_como_denunciar_osorno.mp4"
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

      {/* 5. Características Principales de Fiscalización */}
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

      {/* 6. Pie de Página */}
      <footer className="px-4 sm:px-8 py-10 bg-[#0E0E10] border-t border-white/10 text-xs text-neutral-500 text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <p className="text-neutral-400">
            «Acá Falta la Muni — Osorno» es una iniciativa ciudadana independiente de fiscalización vecinal y comunitaria.
          </p>
          <div className="flex items-center justify-center gap-4 text-[#F4CA19] font-bold">
            <Link href="/" className="hover:underline">
              Mapa en Vivo
            </Link>
            <span>•</span>
            <a href="#instalar" className="hover:underline">
              Descargar App
            </a>
            <span>•</span>
            <a href="/tutorial/tutorial_como_denunciar_osorno.mp4" download className="hover:underline">
              Video Tutorial
            </a>
          </div>
          <p className="text-[11px] text-neutral-600">
            Osorno, Región de Los Lagos, Chile • Desarrollado con tecnología cívica abierta
          </p>
        </div>
      </footer>
    </div>
  );
}
