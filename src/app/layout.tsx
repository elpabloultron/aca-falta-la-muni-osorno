import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Acá falta la muni — Mapa de reclamos urbanos en Osorno',
  description:
    'Mapa interactivo y colaborativo de reclamos ciudadanos en Osorno, Chile. Reporta baches, luminarias, microbasurales y fallas urbanas en tu barrio.',
  authors: [{ name: 'Pablo Benavides Jorquera' }],
  creator: 'Pablo Benavides Jorquera',
  keywords: [
    'Osorno',
    'Acá falta la muni',
    'Reclamos urbanos Osorno',
    'Municipalidad de Osorno',
    'Baches Osorno',
    'Rahue',
    'Francke',
    'Ovejería',
    'Civic Tech Chile',
  ],
  openGraph: {
    title: 'Acá falta la muni — Osorno',
    description:
      'Fiscalización ciudadana en tiempo real de problemáticas barriales en la comuna de Osorno.',
    url: 'https://acafaltalamuni-osorno.cl',
    siteName: 'Acá falta la muni Osorno',
    locale: 'es_CL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Acá falta la muni — Osorno',
    description: 'Fiscalización ciudadana en tiempo real de problemáticas barriales en Osorno.',
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#141414',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} dark h-full antialiased`}>
      <body className="h-full w-full overflow-hidden bg-[#141414] text-white selection:bg-[#F4CA19] selection:text-black">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {
                    console.log('SW registration error: ', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
