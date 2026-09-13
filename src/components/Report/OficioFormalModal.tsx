'use client';

import React from 'react';
import { Report } from '@/types/report';
import { CATEGORIAS_REPORTE } from '@/config/osorno';
import { calculateDaysElapsed } from '@/lib/geo-utils';
import { Printer, X, ShieldAlert, FileText, Check, MapPin, Calendar, Users, AlertCircle } from 'lucide-react';

interface OficioFormalModalProps {
  report: Report;
  onClose: () => void;
}

export const OficioFormalModal: React.FC<OficioFormalModalProps> = ({ report, onClose }) => {
  const catInfo = CATEGORIAS_REPORTE[report.category];
  const daysUnresolved = report.days_unresolved ?? calculateDaysElapsed(report.created_at);
  const now = new Date();

  const fechaEmision = now.toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const fechaDenuncia = new Date(report.created_at).toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const codigoOficio = `OF-OSN-${report.id.replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase()}-${now.getFullYear()}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto print:p-0 print:bg-white print:static">
      {/* Contenedor Principal */}
      <div className="bg-[#1C1C1E] border border-white/15 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[94vh] print:max-h-none print:border-none print:shadow-none print:w-full print:rounded-none">
        {/* Barra superior de herramientas en pantalla (se oculta al imprimir) */}
        <div className="p-4 bg-[#141414] border-b border-neutral-800 flex items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#F4CA19]/15 text-[#F4CA19] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#F4CA19]">
                DOCUMENTO CÍVICO FORMAL
              </span>
              <h3 className="text-white font-bold text-sm">
                Generador de Oficio Municipal y Denuncia CGR
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="bg-[#F4CA19] hover:bg-[#ffe14d] text-black font-extrabold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-md cursor-pointer active:scale-95"
            >
              <Printer className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Imprimir / Descargar PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar documento de oficio"
              className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hoja de Oficio Imprimible (Estilo Formal República de Chile) */}
        <div className="p-6 sm:p-10 overflow-y-auto bg-white text-neutral-900 font-serif leading-relaxed print:p-0 print:overflow-visible text-[13px] sm:text-[14px]">
          {/* Membrete Superior */}
          <div className="border-b-2 border-neutral-900 pb-4 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <p className="font-sans font-black text-xs sm:text-sm tracking-widest text-neutral-900 uppercase">
                  COMUNIDAD VECINAL DE LA COMUNA DE OSORNO
                </p>
                <p className="font-sans text-[11px] text-neutral-600 font-semibold">
                  Plataforma de Fiscalización Ciudadana «Acá Falta la Muni»
                </p>
                <p className="font-sans text-[10px] text-neutral-500">
                  Región de Los Lagos — República de Chile
                </p>
              </div>
              <div className="text-left sm:text-right font-sans">
                <p className="font-black text-xs sm:text-sm text-neutral-900 tracking-wider">
                  {codigoOficio}
                </p>
                <p className="text-[11px] text-neutral-600">
                  Osorno, {fechaEmision}
                </p>
              </div>
            </div>
          </div>

          {/* Destinatarios */}
          <div className="space-y-1 font-sans text-xs sm:text-sm mb-6 bg-neutral-100/70 p-4 rounded-lg border border-neutral-300 print:bg-transparent print:p-2 print:border-neutral-400">
            <p>
              <strong className="text-neutral-900">A:</strong> SR. ALCALDE DE LA ILUSTRE MUNICIPALIDAD DE OSORNO / DIRECCIÓN DE OBRAS MUNICIPALES (DOM) / DIRECCIÓN DE MEDIO AMBIENTE, ASEO Y ORNATO (DIMAO).
            </p>
            <p>
              <strong className="text-neutral-900">CON COPIA A:</strong> CONTRALORÍA REGIONAL DE LOS LAGOS (CGR) — UNIDAD DE CONTROL DE LEGALIDAD MUNICIPAL.
            </p>
            <p>
              <strong className="text-neutral-900">DE:</strong> COMUNIDAD VECINAL FIRMANTE Y VECINOS ADHERENTES DEL SECTOR {report.sector.toUpperCase()}.
            </p>
            <p className="pt-1 border-t border-neutral-300 text-neutral-800">
              <strong className="text-neutral-900">MATERIA:</strong> Requerimiento formal de intervención urgente y denuncia por dilación administrativa injustificada en bien nacional de uso público.
            </p>
          </div>

          {/* Cuerpo del Documento */}
          <div className="space-y-4 text-justify">
            <p>
              Por medio del presente instrumento, los vecinos abajo firmantes y los ciudadanos adherentes de la comuna de Osorno, en ejercicio del derecho constitucional de petición consagrado en el Art. 19 N° 14 de la Constitución Política de la República, y de conformidad con los preceptos de la <strong>Ley N° 18.695</strong> (Orgánica Constitucional de Municipalidades) y la <strong>Ley N° 19.880</strong> (sobre Bases de los Procedimientos Administrativos), vienen en exponer y solicitar formalmente lo siguiente:
            </p>

            {/* 1. Individualización del Reclamo */}
            <div>
              <h4 className="font-sans font-black text-neutral-900 text-xs sm:text-sm uppercase tracking-wide border-b border-neutral-300 pb-1 mb-2">
                1. Individualización del sector y georreferenciación
              </h4>
              <ul className="list-disc list-inside space-y-1 pl-2 font-sans text-xs">
                <li>
                  <strong>Sector territorial:</strong> {report.sector} {report.is_rural ? '— Sector Rural de Osorno' : '— Radio Urbano'}.
                </li>
                <li>
                  <strong>Ubicación referencial:</strong> {report.address_reference}.
                </li>
                <li>
                  <strong>Coordenadas geodésicas GPS:</strong> {report.latitude.toFixed(5)}° S, {report.longitude.toFixed(5)}° O.
                </li>
                <li>
                  <strong>Categoría del bien o servicio afectado:</strong> {catInfo.name}.
                </li>
              </ul>
            </div>

            {/* 2. Cronología e Inacción Municipal */}
            <div>
              <h4 className="font-sans font-black text-neutral-900 text-xs sm:text-sm uppercase tracking-wide border-b border-neutral-300 pb-1 mb-2">
                2. Cronología del abandono y cómputo de plazos
              </h4>
              <p>
                La problemática fue constatada e ingresada por la ciudadanía el día <strong>{fechaDenuncia}</strong>. A la fecha de emisión del presente oficio, han transcurrido <strong>{daysUnresolved} días continuos sin que el municipio haya ejecutado las labores de reparación, conservación ni mitigación requeridas</strong>, excediendo con creces los estándares razonables de funcionamiento del servicio público y vulnerando el principio de celeridad consagrado en el Art. 7° de la Ley N° 19.880.
              </p>
            </div>

            {/* 3. Relación de los Hechos */}
            <div>
              <h4 className="font-sans font-black text-neutral-900 text-xs sm:text-sm uppercase tracking-wide border-b border-neutral-300 pb-1 mb-2">
                3. Relación circunstanciada de la problemática
              </h4>
              <div className="bg-neutral-50 p-3 rounded border border-neutral-200 print:bg-transparent">
                <p className="font-sans font-bold text-neutral-900 text-xs sm:text-sm mb-1">
                  «{report.title}»
                </p>
                <p className="text-neutral-700 italic text-xs">
                  «{report.description}»
                </p>
              </div>
              <p className="mt-2">
                La situación antes descrita pone en grave riesgo la integridad física de peatones, adultos mayores, estudiantes y conductores que transitan a diario por el lugar, generando un deterioro continuo en la calidad de vida comunitaria e impidiendo el libre y seguro tránsito.
              </p>
            </div>

            {/* 4. Evidencia Fotográfica Probatoria */}
            {report.image_url && (
              <div className="my-4 break-inside-avoid">
                <h4 className="font-sans font-black text-neutral-900 text-xs sm:text-sm uppercase tracking-wide border-b border-neutral-300 pb-1 mb-2">
                  4. Evidencia fotográfica probatoria
                </h4>
                <div className="border border-neutral-300 p-2 rounded max-w-md mx-auto text-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={report.image_url}
                    alt="Evidencia probatoria del reclamo"
                    className="max-h-48 w-full object-cover rounded"
                  />
                  <p className="font-sans text-[10px] text-neutral-500 mt-1">
                    Fotografía de terreno registrada en Osorno — ID Reclamo: {report.id}
                  </p>
                </div>
              </div>
            )}

            {/* 5. Fundamentos de Derecho */}
            <div>
              <h4 className="font-sans font-black text-neutral-900 text-xs sm:text-sm uppercase tracking-wide border-b border-neutral-300 pb-1 mb-2">
                5. Fundamentos normativos y legales
              </h4>
              <ol className="list-decimal list-inside space-y-1.5 font-sans text-xs">
                <li>
                  <strong>Ley N° 18.695 (Orgánica Constitucional de Municipalidades):</strong> En sus Artículos 1°, 3° letra f) y 5° letras c) y d), encomienda de manera privativa y obligatoria al municipio la administración, conservación y mantención de los bienes nacionales de uso público, así como el resguardo de las condiciones de seguridad de la comuna.
                </li>
                <li>
                  <strong>Ley N° 19.880 (Procedimientos Administrativos):</strong> Establece en sus Artículos 7° y 8° los principios de celeridad, economía procedimental y el carácter conclusivo de las actuaciones administrativas, imponiendo a la autoridad el deber inexcusable de emitir un pronunciamiento formal.
                </li>
                <li>
                  <strong>Ley N° 18.290 de Tránsito (Art. 99):</strong> Hace civil y patrimonialmente responsable a la Municipalidad de Osorno de los daños, accidentes o perjuicios que se originen con ocasión del mal estado de las calzadas, veredas o de la ausencia de oportuna señalización vial.
                </li>
              </ol>
            </div>

            {/* 6. Petitorio Vecinal */}
            <div className="bg-amber-50/60 border border-amber-300/80 p-4 rounded-lg print:bg-transparent print:border-neutral-400">
              <h4 className="font-sans font-black text-neutral-900 text-xs sm:text-sm uppercase tracking-wide mb-1.5">
                6. Petitorio vecinal urgente
              </h4>
              <p>
                En mérito de lo expuesto, solicitamos respetuosamente:
              </p>
              <ul className="list-disc list-inside space-y-1 font-sans text-xs pl-2 mt-1">
                <li>
                  La concurrencia inmediata de personal técnico o cuadrilla municipal al sector <strong>{report.sector} ({report.address_reference})</strong> para realizar las obras de reparación definitiva o mitigación provisoria.
                </li>
                <li>
                  La emisión de un oficio formal de respuesta y cronograma de obras en un plazo no superior a <strong>10 días hábiles</strong>.
                </li>
                <li>
                  En caso de no obtener respuesta fundada en el plazo legal, se solicita a la Contraloría Regional de Los Lagos iniciar el procedimiento de fiscalización y auditoría sobre el cumplimiento de los deberes funcionarios de mantención del bien nacional de uso público.
                </li>
              </ul>
            </div>

            {/* 7. Respaldo Comunitario y Firmas */}
            <div className="pt-6 border-t border-neutral-300 break-inside-avoid">
              <div className="flex items-center justify-between font-sans text-xs mb-8">
                <p>
                  <strong>Vecinos adherentes en plataforma:</strong> {report.support_count} firmas ciudadanas verificadas.
                </p>
                <p>
                  <strong>Denunciante:</strong> {report.author_name}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-10 font-sans text-center text-xs">
                <div className="border-t border-neutral-900 pt-2">
                  <p className="font-bold text-neutral-900">FIRMA DIRIGENTE VECINAL / VECINO AFECTADO</p>
                  <p className="text-[11px] text-neutral-600">Nombre: _______________________________</p>
                  <p className="text-[11px] text-neutral-600">RUT: ____________________ Tel: _________</p>
                </div>
                <div className="border-t border-neutral-900 pt-2">
                  <p className="font-bold text-neutral-900">TIMBRE JUNTA DE VECINOS / COMITÉ</p>
                  <p className="text-[11px] text-neutral-600">JJ.VV. Sector {report.sector}</p>
                  <p className="text-[11px] text-neutral-600">Comuna de Osorno — Región de Los Lagos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
