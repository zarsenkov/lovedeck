// ========== LOVE DECK SERVICE WORKER ==========
const APP_VERSION = '2.0.0';
const CACHE_NAME = `lovecouple-${APP_VERSION}`;
const DYNAMIC_CACHE = `lovecouple-dynamic-${APP_VERSION}`;

// Файлы для кэширования
const STATIC_URLS = [
  '/',
  '/index.html',
  '/online.html',
  '/style.css',
  '/online.css',
  '/app.js',
  '/online-app.js',
  '/online-local.js',
  '/mode-selector.js',
  '/custom_cards.js',
  '/online.js',
  '/manifest.json',
  '/icon.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// ========== УСТАНОВКА ==========
self.addEventListener('install', event => {
  console.log(`[SW ${APP_VERSION}] Установка`);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Кэширование файлов');
        return cache.addAll(STATIC_URLS.map(url => new Request(url, { cache: 'reload' })));
      })
      .then(() => {
        console.log('[SW] Пропускаем ожидание');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[SW] Ошибка установки:', error);
      })
  );
});

// ========== АКТИВАЦИЯ ==========
self.addEventListener('activate', event => {
  console.log(`[SW ${APP_VERSION}] Активация`);
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            // Удаляем старые версии кэша
            if (cacheName !== CACHE_NAME && cacheName !== DYNAMIC_CACHE) {
              console.log('[SW] Удаление старого кэша:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Берём контроль над клиентами');
        return self.clients.claim();
      })
      .then(() => {
        // Отправляем уведомление о новой версии
        return self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'NEW_VERSION',
              version: APP_VERSION
            });
          });
        });
      })
  );
});

// ========== ОБРАБОТКА ЗАПРОСОВ ==========
self.addEventListener('fetch', event => {
  const { request } = event;
  
  // Пропускаем WebSocket и POST запросы
  if (request.url.startsWith('ws://') || 
      request.url.startsWith('wss://') ||
      request.method !== 'GET') {
    return;
  }
  
  // Для внешних ресурсов - только сеть
  if (!request.url.startsWith(self.location.origin)) {
    event.respondWith(fetch(request));
    return;
  }
  
  event.respondWith(
    (async () => {
      try {
        // Пытаемся получить из сети
        const networkResponse = await fetch(request);
        
        // Кэшируем успешные ответы
        if (networkResponse.ok) {
          const cache = await caches.open(DYNAMIC_CACHE);
          cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
      } catch (error) {
        console.log('[SW] Сеть недоступна, используем кэш:', request.url);
        
        // Ищем в кэшах
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Для навигации возвращаем запасную страницу
        if (request.mode === 'navigate') {
          const fallback = await caches.match('/index.html');
          if (fallback) return fallback;
        }
        
        // Возвращаем заглушку для других ресурсов
        return new Response('Оффлайн режим', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
    })()
  );
});

// ========== ОБРАБОТКА СООБЩЕНИЙ ==========
self.addEventListener('message', event => {
  console.log('[SW] Получено сообщение:', event.data);
  
  switch (event.data?.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'UPDATE_CACHE':
      updateCache();
      break;
      
    case 'CLEAR_CACHE':
      clearCache();
      break;
      
    case 'CHECK_UPDATES':
      checkForUpdates();
      break;
      
    case 'PING':
      event.ports?.[0]?.postMessage({
        type: 'PONG',
        version: APP_VERSION,
        timestamp: Date.now()
      });
      break;
  }
});

// ========== PUSH УВЕДОМЛЕНИЯ ==========
self.addEventListener('push', event => {
  console.log('[SW] Push уведомление получено');
  
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: 'LoveDeck', body: event.data?.text() || 'Новое уведомление' };
  }
  
  const options = {
    body: data.body || 'Новое уведомление от LoveDeck',
    icon: '/icon.png',
    badge: '/icon.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/online.html',
      timestamp: Date.now()
    },
    actions: [
      { action: 'open', title: 'Открыть игру' },
      { action: 'close', title: 'Закрыть' }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'LoveDeck', options)
  );
});

// ========== КЛИК ПО УВЕДОМЛЕНИЮ ==========
self.addEventListener('notificationclick', event => {
  console.log('[SW] Клик по уведомлению:', event.action);
  
  event.notification.close();
  
  if (event.action === 'open' || event.action === '') {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then(windowClients => {
          // Ищем открытое окно
          for (const client of windowClients) {
            if (client.url.includes('lovecouple.ru') && 'focus' in client) {
              return client.focus();
            }
          }
          
          // Открываем новое окно
          if (clients.openWindow) {
            return clients.openWindow(event.notification.data.url || '/online.html');
          }
        })
    );
  }
});

// ========== ФУНКЦИИ ДЛЯ РАБОТЫ С КЭШЕМ ==========

// Проверка обновлений
async function checkForUpdates() {
  console.log('[SW] Проверка обновлений...');
  
  try {
    const cache = await caches.open(CACHE_NAME);
    const updates = [];
    
    for (const url of STATIC_URLS) {
      try {
        const networkResponse = await fetch(url, { cache: 'no-store' });
        const cachedResponse = await cache.match(url);
        
        if (!cachedResponse) {
          updates.push(url);
          await cache.put(url, networkResponse.clone());
        } else {
          const networkETag = networkResponse.headers.get('etag');
          const cachedETag = cachedResponse.headers.get('etag');
          
          if (networkETag && networkETag !== cachedETag) {
            updates.push(url);
            await cache.put(url, networkResponse.clone());
          }
        }
      } catch (error) {
        console.warn('[SW] Не удалось проверить:', url, error);
      }
    }
    
    if (updates.length > 0) {
      console.log('[SW] Обнаружены обновления:', updates);
      
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'UPDATES_AVAILABLE',
          files: updates,
          version: APP_VERSION
        });
      });
    }
    
    return updates;
  } catch (error) {
    console.error('[SW] Ошибка проверки обновлений:', error);
    return [];
  }
}

// Обновление кэша
async function updateCache() {
  try {
    await checkForUpdates();
    return { success: true };
  } catch (error) {
    console.error('[SW] Ошибка обновления кэша:', error);
    return { success: false, error: error.message };
  }
}

// Очистка кэша
async function clearCache() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    console.log('[SW] Кэш очищен');
    return { success: true };
  } catch (error) {
    console.error('[SW] Ошибка очистки кэша:', error);
    return { success: false, error: error.message };
  }
}

// Получение информации о кэше
async function getCacheInfo() {
  try {
    const cacheNames = await caches.keys();
    const info = await Promise.all(
      cacheNames.map(async name => {
        const cache = await caches.open(name);
        const keys = await cache.keys();
        return {
          name,
          size: keys.length,
          urls: keys.slice(0, 10).map(req => req.url) // первые 10 URL
        };
      })
    );
    
    return {
      version: APP_VERSION,
      caches: info,
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('[SW] Ошибка получения информации:', error);
    return { error: error.message };
  }
}

// ========== ПЕРИОДИЧЕСКАЯ ПРОВЕРКА ==========
// Автоматическая проверка обновлений раз в день
self.setInterval(async () => {
  if (navigator.onLine) {
    await checkForUpdates();
  }
}, 24 * 60 * 60 * 1000);

// ========== ИНИЦИАЛИЗАЦИЯ ==========
console.log(`[SW ${APP_VERSION}] Загружен и готов к работе`);
