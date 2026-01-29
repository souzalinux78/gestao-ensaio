// Service Worker para PWA
// IMPORTANTE: Incrementar a versão a cada deploy para forçar atualização do cache
// Versão atual: v6 - Manifest corrigido (ícones válidos)
const CACHE_NAME = 'gestao-ensaio-v6';
const CACHE_VERSION = '6';

// URLs críticas para cache inicial
const urlsToCache = [
  '/',
  '/login',
  '/manifest.json',
  '/offline.html',
  '/logo.png',
  '/icon-192.png',
  '/icon-512.png',
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
  const url = new URL(request.url);
  
  // Não cachear requisições de API - sempre buscar da rede
  // IMPORTANTE: Preservar todos os headers, especialmente Authorization
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      // Criar nova requisição preservando todos os headers originais
      fetch(request.clone(), {
        // Preservar credenciais (cookies, etc)
        credentials: 'same-origin',
        // Preservar cache mode
        cache: 'no-store',
        // Preservar redirect mode
        redirect: 'follow',
      })
        .then((response) => {
          // NUNCA cachear respostas 401 (não autorizado)
          // Isso evita que respostas de erro sejam servidas do cache
          if (response.status === 401) {
            // Limpar qualquer cache relacionado a esta requisição
            caches.delete(request.url).catch(() => {});
            // Retornar resposta fresca (não cacheada)
            return response;
          }
          return response;
        })
        .catch(() => {
          // Se offline, retornar resposta JSON de erro
          return new Response(
            JSON.stringify({ error: 'Você está offline. Conecte-se à internet para continuar.' }),
            {
              status: 503,
              statusText: 'Service Unavailable',
              headers: { 'Content-Type': 'application/json' },
            }
          );
        })
    );
    return;
  }

  // Cachear assets estáticos (CSS, JS, imagens, fontes)
  const isStaticAsset = 
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/_next/image') ||
    url.pathname.match(/\.(?:png|jpg|jpeg|svg|gif|webp|ico|woff|woff2|ttf|eot)$/i);

  // Para assets estáticos, usar Cache First (mais rápido)
  if (isStaticAsset) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request).then((response) => {
            // Cachear apenas respostas válidas
            if (response && response.status === 200) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return response;
          });
        })
        .catch(() => {
          // Se falhar, tentar buscar do cache novamente
          return caches.match(request);
        })
    );
    return;
  }

  // Para páginas HTML, usar Network First (sempre buscar versão mais recente)
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
          // Se não tiver no cache e for HTML, retornar página offline
          if (request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/offline.html') || caches.match('/');
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

// ============================================
// PUSH NOTIFICATIONS
// ============================================

// Receber push notification
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification recebida:', event);
  
  let notificationData = {
    title: 'Gestão de Ensaio',
    body: 'Você tem uma nova notificação',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'gestao-ensaio-notification',
  };

  // Se houver dados no push, usar eles
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.title || notificationData.title,
        body: data.body || notificationData.body,
        icon: data.icon || notificationData.icon,
        badge: data.badge || notificationData.badge,
        tag: data.tag || notificationData.tag,
        data: data.data || {},
      };
    } catch (error) {
      console.error('[SW] Erro ao parsear dados do push:', error);
      // Usar texto simples se não for JSON
      notificationData.body = event.data.text() || notificationData.body;
    }
  }

  const promiseChain = self.registration.showNotification(notificationData.title, {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    tag: notificationData.tag,
    data: notificationData.data,
    requireInteraction: false,
    vibrate: [200, 100, 200],
  });

  event.waitUntil(promiseChain);
});

// Clique na notificação
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notificação clicada:', event);
  
  event.notification.close();

  // Abrir ou focar na aplicação
  const promiseChain = clients.matchAll({
    type: 'window',
    includeUncontrolled: true,
  }).then((windowClients) => {
    // Se já houver uma janela aberta, focar nela
    for (let i = 0; i < windowClients.length; i++) {
      const client = windowClients[i];
      if (client.url === '/' && 'focus' in client) {
        return client.focus();
      }
    }
    // Se não houver, abrir nova janela
    if (clients.openWindow) {
      return clients.openWindow('/');
    }
  });

  event.waitUntil(promiseChain);
});

// Fechar notificação
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notificação fechada:', event);
});
