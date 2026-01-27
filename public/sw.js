// Service Worker para PWA
// IMPORTANTE: Incrementar a versão a cada deploy para forçar atualização do cache
// Versão atual: v4 - Sempre busca versão mais recente da rede primeiro
const CACHE_NAME = 'gestao-ensaio-v4';
const CACHE_VERSION = '4';
const urlsToCache = [
  '/',
  '/login',
  '/manifest.json',
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker...');
  // Forçar ativação imediata - não esperar outras abas fecharem
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cache aberto');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('[SW] Erro ao fazer cache:', error);
      })
  );
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Ativando Service Worker - limpando cache antigo...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      // Limpar TODOS os caches antigos
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Limpar cache do navegador também
      console.log('[SW] Cache limpo, assumindo controle...');
      return self.clients.claim();
    })
  );
  
  // NÃO notificar para recarregar automaticamente
  // Apenas assumir controle silenciosamente
  // O reload só acontecerá quando realmente houver uma nova versão
});

// Interceptar requisições - ESTRATÉGIA NETWORK FIRST (sempre buscar versão mais recente)
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Não cachear requisições de API - sempre buscar da rede
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        // Se offline, retornar erro
        return new Response('Offline', { status: 503 });
      })
    );
    return;
  }

  // Para outros recursos, usar Network First (buscar da rede primeiro)
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Se resposta é válida, atualizar cache
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Se offline, tentar buscar do cache
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            console.log('[SW] Retornando do cache (offline):', request.url);
            return cachedResponse;
          }
          // Se não tiver no cache e for HTML, retornar página inicial
          if (request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/');
          }
          return new Response('Offline', { status: 503 });
        });
      })
  );
});

// Notificar quando nova versão estiver disponível
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
