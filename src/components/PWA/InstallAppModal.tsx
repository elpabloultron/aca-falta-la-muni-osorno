'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  Download,
  Share,
  PlusSquare,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop'>('desktop');
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detectar si ya está instalada en modo standalone
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    // Detectar sistema operativo
    const ua = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      setPlatform('ios');
    } else if (/android/.test(ua)) {
      setPlatform('android');
    } else {
      setPlatform('desktop');
    }

    // Escuchar el evento oficial PWA para Android/Chrome
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

  const handleInstallAndroid = async () => {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="bg-[#18181A] border border-white/10 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Cabecera del Modal */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#141414]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F4CA19] flex items-center justify-center text-black font-black text-xl shadow-md">
              !
            </div>
            <div>
              <h2 className="text-white font-black text-sm sm:text-base leading-none flex items-center gap-2">
                DESCARGA LA APP
                <span className="text-[10px] bg-[#F4CA19]/15 text-[#F4CA19] font-bold px-1.5 py-0.5 rounded border border-[#F4CA19]/30">
                  OSORNO
                </span>
              </h2>
              <p className="text-neutral-400 text-xs mt-0.5">
                Instalación gratuita sin ocupar espacio
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana de descarga"
            className="p-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selector de Pestaña de Plataforma */}
        <div className="grid grid-cols-3 p-2 bg-neutral-900/90 border-b border-white/5 text-xs font-bold text-center gap-1.5">
          <button
            type="button"
            onClick={() => setPlatform('android')}
            className={`py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              platform === 'android'
                ? 'bg-[#F4CA19] text-black shadow-md'
                : 'text-neutral-400 hover:text-white bg-transparent'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Android</span>
          </button>
          <button
            type="button"
            onClick={() => setPlatform('ios')}
            className={`py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              platform === 'ios'
                ? 'bg-[#F4CA19] text-black shadow-md'
                : 'text-neutral-400 hover:text-white bg-transparent'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>iPhone (iOS)</span>
          </button>
          <button
            type="button"
            onClick={() => setPlatform('desktop')}
            className={`py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              platform === 'desktop'
                ? 'bg-[#F4CA19] text-black shadow-md'
                : 'text-neutral-400 hover:text-white bg-transparent'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>PC / Web</span>
          </button>
        </div>

        {/* Contenido según Plataforma */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-sm">
          {isStandalone || isInstalled ? (
            <div className="text-center py-6 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
              <h3 className="text-white font-bold text-base">¡App instalada correctamente!</h3>
              <p className="text-neutral-300 text-xs mt-1">
                Ya tienes «Acá Falta la Muni» en tu pantalla de inicio lista para fiscalizar.
              </p>
            </div>
          ) : platform === 'android' ? (
            /* GUÍA ANDROID */
            <div className="space-y-4">
              <div className="bg-neutral-900/90 border border-white/10 rounded-2xl p-4 flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#F4CA19]/20 text-[#F4CA19] flex items-center justify-center shrink-0">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">Instalación en 1 toque en Android</h4>
                  <p className="text-neutral-400 text-xs">Directo desde Google Chrome sin pasar por Play Store</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleInstallAndroid}
                className="w-full py-3.5 px-4 rounded-xl bg-[#F4CA19] hover:bg-[#ffe043] text-black font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/20 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Instalar App en este celular</span>
              </button>

              <div className="bg-neutral-900/50 border border-white/5 rounded-2xl p-3.5 text-xs text-neutral-300 space-y-2">
                <p className="font-semibold text-white">¿No ves el mensaje automático?</p>
                <ol className="list-decimal list-inside space-y-1 text-neutral-400">
                  <li>Toca los tres puntos (<strong className="text-white">⋮</strong>) en la esquina de Chrome.</li>
                  <li>Selecciona <strong className="text-white">«Instalar aplicación»</strong> o <strong className="text-white">«Agregar a pantalla principal»</strong>.</li>
                  <li>¡Listo! Se creará el icono oficial de la Muni en tu teléfono.</li>
                </ol>
              </div>
            </div>
          ) : platform === 'ios' ? (
            /* GUÍA IPHONE / IOS */
            <div className="space-y-4">
              <div className="bg-neutral-900/90 border border-white/10 rounded-2xl p-4 flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <Share className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">Instalación en Safari (iPhone / iPad)</h4>
                  <p className="text-neutral-400 text-xs">Instala como App nativa en 2 toques</p>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-start gap-3 bg-neutral-900/70 border border-white/5 p-3 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-[#F4CA19] text-black font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="text-xs">
                    <p className="text-white font-bold">Presiona el botón Compartir</p>
                    <p className="text-neutral-400 mt-0.5">
                      Toca el icono de compartir (<strong className="text-white inline-flex items-center gap-1"><Share className="w-3.5 h-3.5 inline" /> Compartir</strong>) en la barra inferior de Safari.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-neutral-900/70 border border-white/5 p-3 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-[#F4CA19] text-black font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="text-xs">
                    <p className="text-white font-bold">Selecciona «Agregar a inicio»</p>
                    <p className="text-neutral-400 mt-0.5">
                      Baja en el menú y toca <strong className="text-white inline-flex items-center gap-1"><PlusSquare className="w-3.5 h-3.5 inline" /> Agregar a pantalla de inicio</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-neutral-900/70 border border-white/5 p-3 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-[#F4CA19] text-black font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="text-xs">
                    <p className="text-white font-bold">Confirma arriba a la derecha</p>
                    <p className="text-neutral-400 mt-0.5">
                      Presiona <strong className="text-white">«Agregar»</strong>. La aplicación quedará con su icono en tu pantalla como cualquier app de Apple.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* GUÍA DESKTOP / PC */
            <div className="space-y-4">
              <div className="bg-neutral-900/90 border border-white/10 rounded-2xl p-4 flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#F4CA19]/20 text-[#F4CA19] flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">Instalar en tu Computador o Celular</h4>
                  <p className="text-neutral-400 text-xs">Acceso directo en barra de tareas o en tu teléfono</p>
                </div>
              </div>

              <div className="bg-neutral-900/50 border border-white/5 rounded-2xl p-4 text-xs space-y-3">
                <p className="text-neutral-300">
                  Puedes usar la versión web directamente en tu pantalla o instalar la app en Chrome/Edge presionando el icono de instalación (<Download className="w-3.5 h-3.5 inline text-[#F4CA19]" />) en la barra de direcciones superior.
                </p>
                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                  <span className="text-neutral-400">Escanea desde tu móvil:</span>
                  <span className="text-[#F4CA19] font-mono font-bold">aca-falta-la-muni-osorno.web.app</span>
                </div>
              </div>
            </div>
          )}

          {/* Ventajas de la Web App */}
          <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-neutral-300">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>100 % Anónima y segura</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#F4CA19] shrink-0" />
              <span>Carga rápida en 4G/5G</span>
            </div>
          </div>
        </div>

        {/* Pie del Modal con Enlace a la Landing Page */}
        <div className="p-4 bg-[#141414] border-t border-white/10 flex items-center justify-between gap-3">
          <Link
            href="/descargar#tiendas"
            onClick={onClose}
            className="text-xs font-bold text-[#F4CA19] hover:underline flex items-center gap-1"
          >
            <span>Ver opciones de descarga (Obtainium, F-Droid, APK y GitHub)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold transition-colors cursor-pointer"
          >
            Continuar en la web
          </button>
        </div>
      </div>
    </div>
  );
};
