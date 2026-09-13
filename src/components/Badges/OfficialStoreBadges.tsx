'use client';

import React from 'react';

interface StoreBadgeProps {
  className?: string;
}

// 1. Insignia Oficial de GitHub Releases (APK Directo)
export const GitHubBadge: React.FC<{ href?: string; onClick?: () => void }> = ({
  href = 'https://github.com/pablobenavidesj/aca-falta-la-muni-osorno/releases',
  onClick,
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    onClick={onClick}
    className="group relative inline-flex items-center gap-3 px-4 py-2.5 bg-black hover:bg-neutral-900 border border-neutral-700 hover:border-[#F4CA19] rounded-xl transition-all duration-200 shadow-md hover:shadow-yellow-500/10 active:scale-95 text-left select-none cursor-pointer"
    title="Descargar APK oficial en GitHub Releases"
  >
    <svg className="w-7 h-7 text-white fill-current shrink-0" viewBox="0 0 24 24">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
    <div className="flex flex-col leading-tight">
      <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold group-hover:text-neutral-300">
        Descargar APK en
      </span>
      <span className="text-sm font-extrabold text-white group-hover:text-[#F4CA19] transition-colors">
        GitHub Releases
      </span>
    </div>
  </a>
);

// 2. Insignia Oficial de F-Droid (Catálogo Software Libre)
export const FDroidBadge: React.FC<{ href?: string; onClick?: () => void }> = ({
  href = 'https://f-droid.org',
  onClick,
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    onClick={onClick}
    className="group relative inline-flex items-center gap-3 px-4 py-2.5 bg-[#0d1f2d] hover:bg-[#11283a] border border-[#1976D2]/60 hover:border-[#19B5FE] rounded-xl transition-all duration-200 shadow-md hover:shadow-cyan-500/10 active:scale-95 text-left select-none cursor-pointer"
    title="Disponible en catálogo de software libre F-Droid"
  >
    {/* Logotipo F-Droid Robot Vectorial */}
    <div className="w-7 h-7 rounded-lg bg-[#1976D2]/30 flex items-center justify-center p-1 shrink-0 border border-[#19B5FE]/40">
      <svg className="w-full h-full text-[#19B5FE]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.5 5.5l1.5-2.6c.1-.2 0-.5-.2-.6-.2-.1-.5 0-.6.2l-1.5 2.6C15.2 4.4 13.6 4 12 4s-3.2.4-4.7 1.1L5.8 2.5c-.1-.2-.4-.3-.6-.2-.2.1-.3.4-.2.6l1.5 2.6C3.9 7 2 9.8 2 13h20c0-3.2-1.9-6-4.5-7.5zM7.5 10c-.8 0-1.5-.7-1.5-1.5S6.7 7 7.5 7 9 7.7 9 8.5 8.3 10 7.5 10zm9 0c-.8 0-1.5-.7-1.5-1.5S15.7 7 16.5 7s1.5.7 1.5 1.5-.7 1.5-1.5 1.5zM2 15v5c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-5H2z" />
      </svg>
    </div>
    <div className="flex flex-col leading-tight">
      <span className="text-[9px] uppercase tracking-wider text-cyan-300 font-bold">
        DISPONIBLE EN
      </span>
      <span className="text-sm font-extrabold text-white group-hover:text-cyan-200 transition-colors">
        F-Droid
      </span>
    </div>
  </a>
);

// 3. Insignia Oficial de Obtainium (Actualizaciones Automáticas Directas)
export const ObtainiumBadge: React.FC<{ href?: string; onClick?: () => void }> = ({
  href = 'obtainium://app/https://github.com/pablobenavidesj/aca-falta-la-muni-osorno',
  onClick,
}) => (
  <a
    href={href}
    onClick={onClick}
    className="group relative inline-flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-[#2e1065] to-[#4c1d95] hover:from-[#3b0764] hover:to-[#581c87] border border-purple-500/50 hover:border-purple-400 rounded-xl transition-all duration-200 shadow-md hover:shadow-purple-500/20 active:scale-95 text-left select-none cursor-pointer"
    title="Instalar y actualizar en 1 toque con Obtainium"
  >
    <div className="w-7 h-7 rounded-lg bg-purple-400/20 flex items-center justify-center p-1 shrink-0 border border-purple-300/40">
      <svg className="w-full h-full text-purple-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    </div>
    <div className="flex flex-col leading-tight">
      <span className="text-[9px] uppercase tracking-wider text-purple-200 font-bold">
        1 TOQUE · AUTO-UPDATE
      </span>
      <span className="text-sm font-extrabold text-white group-hover:text-purple-100 transition-colors">
        Obtainium
      </span>
    </div>
  </a>
);

// 4. Insignia Oficial de Samsung Galaxy Store
export const SamsungGalaxyStoreBadge: React.FC<{ href?: string; onClick?: () => void }> = ({
  href = 'https://galaxystore.samsung.com',
  onClick,
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    onClick={onClick}
    className="group relative inline-flex items-center gap-3 px-4 py-2.5 bg-[#0a0f1d] hover:bg-[#0e162c] border border-sky-600/40 hover:border-sky-400 rounded-xl transition-all duration-200 shadow-md hover:shadow-sky-500/10 active:scale-95 text-left select-none cursor-pointer"
    title="Disponible en Samsung Galaxy Store"
  >
    {/* Logotipo Galaxy Store */}
    <div className="w-7 h-7 rounded-lg bg-sky-500/10 flex items-center justify-center p-1 shrink-0 border border-sky-400/30">
      <svg className="w-full h-full text-sky-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h14v12zm-7-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
      </svg>
    </div>
    <div className="flex flex-col leading-tight">
      <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold">
        DISPONIBLE EN
      </span>
      <span className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
        Galaxy Store
      </span>
    </div>
  </a>
);

// 5. Insignia Oficial de Huawei AppGallery
export const HuaweiAppGalleryBadge: React.FC<{ href?: string; onClick?: () => void }> = ({
  href = 'https://appgallery.huawei.com',
  onClick,
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    onClick={onClick}
    className="group relative inline-flex items-center gap-3 px-4 py-2.5 bg-[#170505] hover:bg-[#240909] border border-red-700/50 hover:border-red-500 rounded-xl transition-all duration-200 shadow-md hover:shadow-red-500/10 active:scale-95 text-left select-none cursor-pointer"
    title="Consíguelo en Huawei AppGallery"
  >
    {/* Logotipo Huawei AppGallery bolsa roja */}
    <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center p-1 shrink-0 shadow-sm">
      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm2 10.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5V11c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v2.5z" />
      </svg>
    </div>
    <div className="flex flex-col leading-tight">
      <span className="text-[9px] uppercase tracking-wider text-red-300 font-bold">
        CONSIGUELO EN EL
      </span>
      <span className="text-sm font-bold text-white group-hover:text-red-200 transition-colors">
        AppGallery
      </span>
    </div>
  </a>
);

// 6. Insignia Oficial de Google Play Store (Próximamente)
export const GooglePlayBadge: React.FC<{ isUpcoming?: boolean }> = ({ isUpcoming = true }) => (
  <div
    className="group relative inline-flex items-center gap-3 px-4 py-2.5 bg-black/90 border border-neutral-700 rounded-xl shadow-md text-left select-none cursor-default opacity-85 hover:opacity-100 transition-opacity"
    title="Próximamente disponible en Google Play Store"
  >
    {/* Logotipo Google Play Vectorial Oficial */}
    <svg className="w-7 h-7 shrink-0" viewBox="0 0 24 24">
      <path d="M3.609 1.814L13.793 12 3.61 22.186a1.986 1.986 0 01-.61-1.428V3.242c0-.555.228-1.056.61-1.428z" fill="#00D2FF" />
      <path d="M17.18 8.613L13.793 12 3.609 1.814A1.99 1.99 0 014.774 1.5c.613 0 1.2.247 1.636.57l10.77 6.543z" fill="#00F076" />
      <path d="M17.18 15.387L6.41 21.93c-.436.323-1.023.57-1.636.57a1.99 1.99 0 01-1.165-.314L13.793 12l3.387 3.387z" fill="#FF3A44" />
      <path d="M21.19 12.001a1.997 1.997 0 01-1.18 1.817l-2.83 1.569-3.387-3.387 3.387-3.387 2.83 1.569c.725.402 1.18 1.077 1.18 1.819z" fill="#FFC800" />
    </svg>
    <div className="flex flex-col leading-tight">
      <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold">
        DISPONIBLE EN
      </span>
      <span className="text-sm font-bold text-white flex items-center gap-1.5">
        Google Play
        {isUpcoming && (
          <span className="text-[9px] font-bold bg-[#F4CA19]/20 text-[#F4CA19] px-1.5 py-0.2 rounded border border-[#F4CA19]/30">
            Pronto
          </span>
        )}
      </span>
    </div>
  </div>
);

// 7. Insignia Oficial de Apple App Store (Próximamente)
export const AppleAppStoreBadge: React.FC<{ isUpcoming?: boolean }> = ({ isUpcoming = true }) => (
  <div
    className="group relative inline-flex items-center gap-3 px-4 py-2.5 bg-black/90 border border-neutral-700 rounded-xl shadow-md text-left select-none cursor-default opacity-85 hover:opacity-100 transition-opacity"
    title="Próximamente disponible en Apple App Store (ya puedes usarla en Safari)"
  >
    {/* Logotipo Apple Vectorial */}
    <svg className="w-7 h-7 text-white fill-current shrink-0" viewBox="0 0 24 24">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.78 1.06-1.85.94-2.93-.93.04-2.02.63-2.67 1.4-.57.66-.99 1.74-.86 2.79 1.03.08 2.05-.53 2.59-1.26z" />
    </svg>
    <div className="flex flex-col leading-tight">
      <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold">
        Consíguelo en el
      </span>
      <span className="text-sm font-bold text-white flex items-center gap-1.5">
        App Store
        {isUpcoming && (
          <span className="text-[9px] font-bold bg-white/20 text-neutral-200 px-1.5 py-0.2 rounded border border-white/20">
            Pronto
          </span>
        )}
      </span>
    </div>
  </div>
);
