import type { Metadata, Viewport } from 'next';
import './globals.css';
import InstallPrompt from '@/components/InstallPrompt';
import LoadingScreen from '@/components/LoadingScreen';

export const metadata: Metadata = {
  title: 'Gestão de Ensaio',
  description: 'Sistema de gestão de ensaios musicais',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Gestão de Ensaio',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'Gestão de Ensaio',
    title: 'Gestão de Ensaio',
    description: 'Sistema de gestão de ensaios musicais',
  },
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#1e3a5f',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Gestão de Ensaio" />
        <meta name="application-name" content="Gestão de Ensaio" />
        <meta name="msapplication-TileColor" content="#1e3a5f" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('✅ Service Worker registrado:', registration.scope);
                      // Atualizar service worker quando houver nova versão
                      registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        if (newWorker) {
                          newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                              console.log('🔄 Nova versão disponível!');
                            }
                          });
                        }
                      });
                    })
                    .catch(function(error) {
                      console.error('❌ Erro ao registrar Service Worker:', error);
                    });
                });
                
                // Atualizar service worker quando voltar para a página
                if (navigator.serviceWorker.controller) {
                  navigator.serviceWorker.controller.addEventListener('statechange', () => {
                    if (navigator.serviceWorker.controller?.state === 'redundant') {
                      window.location.reload();
                    }
                  });
                }
              }
            `,
          }}
        />
        <LoadingScreen />
        {children}
        <InstallPrompt />
      </body>
    </html>
  );
}
