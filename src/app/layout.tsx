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
                let registration = null;
                
                // Função para limpar cache e forçar atualização
                function limparCacheEAtualizar() {
                  console.log('🧹 Limpando cache e forçando atualização...');
                  
                  // Limpar todos os caches
                  if ('caches' in window) {
                    caches.keys().then(function(cacheNames) {
                      return Promise.all(
                        cacheNames.map(function(cacheName) {
                          console.log('🗑️ Removendo cache:', cacheName);
                          return caches.delete(cacheName);
                        })
                      );
                    }).then(function() {
                      console.log('✅ Cache limpo!');
                    });
                  }
                  
                  // Forçar atualização do service worker
                  if (registration) {
                    registration.update();
                  }
                }
                
                // Registrar Service Worker
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js?t=' + Date.now())
                    .then(function(reg) {
                      registration = reg;
                      console.log('✅ Service Worker registrado:', reg.scope);
                      
                      // Verificar atualizações imediatamente
                      reg.update();
                      
                      // Verificar atualizações a cada vez que a página ganha foco
                      window.addEventListener('focus', function() {
                        console.log('👁️ Página em foco - verificando atualizações...');
                        reg.update();
                        limparCacheEAtualizar();
                      });
                      
                      // Verificar atualizações quando voltar para a página
                      document.addEventListener('visibilitychange', function() {
                        if (!document.hidden) {
                          console.log('👁️ Página visível - verificando atualizações...');
                          reg.update();
                          limparCacheEAtualizar();
                        }
                      });
                      
                      // Detectar quando há nova versão disponível
                      reg.addEventListener('updatefound', function() {
                        const newWorker = reg.installing;
                        if (newWorker) {
                          newWorker.addEventListener('statechange', function() {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                              console.log('🔄 Nova versão disponível! Atualizando...');
                              // Forçar atualização imediata
                              newWorker.postMessage({ type: 'SKIP_WAITING' });
                              // Recarregar página após 1 segundo
                              setTimeout(function() {
                                window.location.reload();
                              }, 1000);
                            }
                          });
                        }
                      });
                    })
                    .catch(function(error) {
                      console.error('❌ Erro ao registrar Service Worker:', error);
                    });
                });
                
                // Limpar cache ao entrar no app
                window.addEventListener('pageshow', function(event) {
                  if (event.persisted) {
                    // Página foi carregada do cache (back/forward)
                    console.log('📄 Página carregada do cache - limpando...');
                    limparCacheEAtualizar();
                  } else {
                    // Página carregada normalmente
                    console.log('📄 Página carregada - verificando atualizações...');
                    if (registration) {
                      registration.update();
                    }
                  }
                });
                
                // Limpar cache ao iniciar o app
                if ('caches' in window) {
                  caches.keys().then(function(cacheNames) {
                    console.log('🔍 Caches encontrados:', cacheNames.length);
                    if (cacheNames.length > 0) {
                      limparCacheEAtualizar();
                    }
                  });
                }
                
                // Escutar mensagens do Service Worker
                navigator.serviceWorker.addEventListener('message', function(event) {
                  if (event.data && event.data.type === 'SW_ACTIVATED') {
                    console.log('🔄 Service Worker ativado - recarregando página...');
                    setTimeout(function() {
                      window.location.reload();
                    }, 500);
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
