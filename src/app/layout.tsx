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
        {/* Splash screen iOS */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/icon-144.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icon-192.png" />
        {/* Splash screen Android */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#1e3a5f" />
      </head>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                let registration = null;
                let isReloading = false;
                let lastUpdateCheck = 0;
                const UPDATE_CHECK_INTERVAL = 60000; // 1 minuto entre verificações
                
                // Prevenir múltiplos reloads
                function safeReload() {
                  if (isReloading) return;
                  isReloading = true;
                  console.log('🔄 Recarregando página para aplicar atualização...');
                  setTimeout(function() {
                    window.location.reload();
                  }, 1000);
                }
                
                // Verificar atualizações de forma controlada
                function verificarAtualizacoes() {
                  const now = Date.now();
                  // Evitar verificações muito frequentes
                  if (now - lastUpdateCheck < UPDATE_CHECK_INTERVAL) {
                    return;
                  }
                  lastUpdateCheck = now;
                  
                  if (registration) {
                    registration.update().catch(function(err) {
                      console.warn('Erro ao verificar atualizações:', err);
                    });
                  }
                }
                
                // Registrar Service Worker
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(reg) {
                      registration = reg;
                      console.log('✅ Service Worker registrado:', reg.scope);
                      
                      // Verificar atualizações apenas uma vez ao carregar
                      verificarAtualizacoes();
                      
                      // Detectar quando há nova versão disponível (apenas quando realmente houver)
                      reg.addEventListener('updatefound', function() {
                        const newWorker = reg.installing;
                        if (newWorker) {
                          newWorker.addEventListener('statechange', function() {
                            // Só recarregar se realmente houver uma nova versão instalada
                            // e já houver um service worker ativo (não é a primeira instalação)
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller && !isReloading) {
                              console.log('🔄 Nova versão do Service Worker disponível');
                              // Pedir para o novo worker ativar
                              newWorker.postMessage({ type: 'SKIP_WAITING' });
                              // Recarregar apenas uma vez
                              safeReload();
                            }
                          });
                        }
                      });
                    })
                    .catch(function(error) {
                      console.error('❌ Erro ao registrar Service Worker:', error);
                    });
                });
                
                // Verificar atualizações quando voltar para a página (com intervalo)
                document.addEventListener('visibilitychange', function() {
                  if (!document.hidden && !isReloading) {
                    // Aguardar um pouco antes de verificar (evitar verificação imediata)
                    setTimeout(function() {
                      verificarAtualizacoes();
                    }, 2000);
                  }
                });
                
                // Escutar mensagens do Service Worker (apenas para reload quando necessário)
                navigator.serviceWorker.addEventListener('message', function(event) {
                  if (event.data && event.data.type === 'SW_ACTIVATED' && !isReloading) {
                    console.log('🔄 Service Worker ativado - aplicando atualização');
                    safeReload();
                  }
                });
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
